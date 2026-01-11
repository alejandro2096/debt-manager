export class JSONExporter {
  static arrayToJSON<T>(data: T[], pretty: boolean = true): string {
    if (pretty) {
      return JSON.stringify(data, null, 2);
    }
    return JSON.stringify(data);
  }

  static generateFilename(prefix: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_${timestamp}.json`;
  }
}