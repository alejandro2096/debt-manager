export class User {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly password: string,
        public readonly name: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    static create(data: {
        id: string;
        email: string;
        password: string;
        name: string;
        createdAt?: Date;
        updatedAt?: Date;
    }): User {
        return new User(
            data.id,
            data.email,
            data.password,
            data.name,
            data.createdAt || new Date(),
            data.updatedAt || new Date()
        );
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}