import { createClient, RedisClientType } from 'redis';
import { logger } from '../../../shared/utils/logger';
import { CONSTANTS } from '../../../shared/utils/constants';

export interface ICacheRepository {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    deletePattern(pattern: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}

export class RedisCache implements ICacheRepository {
    private client: RedisClientType;
    private isConnected: boolean = false;

    constructor() {
        this.client = createClient({
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            },
            password: process.env.REDIS_PASSWORD || undefined,
        });

        this.client.on('error', (err) => {
            logger.error(`Redis Client Error: ${err}`);
            this.isConnected = false;
        });

        this.client.on('connect', () => {
            logger.info('Redis Client Connected');
            this.isConnected = true;
        });

        this.client.on('ready', () => {
            logger.info('Redis Client Ready');
        });

        this.client.on('end', () => {
            logger.info('Redis Client Disconnected');
            this.isConnected = false;
        });
    }

    async connect(): Promise<void> {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }

    async disconnect(): Promise<void> {
        if (this.isConnected) {
            await this.client.quit();
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await this.client.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            logger.error(`Redis GET error for key ${key}: ${error}`);
            return null;
        }
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
            const serializedValue = JSON.stringify(value);
            const expiration = ttl || CONSTANTS.CACHE_TTL.LIST;

            await this.client.setEx(key, expiration, serializedValue);
        } catch (error) {
            logger.error(`Redis SET error for key ${key}: ${error}`);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            logger.error(`Redis DELETE error for key ${key}: ${error}`);
        }
    }

    async deletePattern(pattern: string): Promise<void> {
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        } catch (error) {
            logger.error(`Redis DELETE PATTERN error for pattern ${pattern}: ${error}`);
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            logger.error(`Redis EXISTS error for key ${key}: ${error}`);
            return false;
        }
    }

    static generateKey(prefix: string, ...args: (string | number)[]): string {
        return `${prefix}:${args.join(':')}`;
    }
}

let redisCacheInstance: RedisCache | null = null;

export const getRedisCache = (): RedisCache => {
    if (!redisCacheInstance) {
        redisCacheInstance = new RedisCache();
    }
    return redisCacheInstance;
};