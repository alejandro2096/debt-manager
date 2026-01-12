export class CSVExporter {
    static arrayToCSV<T extends Record<string, any>>(
        data: T[],
        columns?: (keyof T)[]
    ): string {
        if (data.length === 0) {
            return '';
        }

        const headers = columns || (Object.keys(data[0]) as (keyof T)[]);
        const headerRow = headers.join(',');

        const rows = data.map((item) => {
            return headers
                .map((header) => {
                    const value = item[header];

                    // Handle null/undefined
                    if (value === null || value === undefined) {
                        return '';
                    }

                    // Handle dates
                    if (value && typeof value === 'object' && 'toISOString' in value) {
                        return (value as Date).toISOString();
                    }

                    // Handle strings with commas or quotes
                    const stringValue = String(value);
                    if (stringValue.includes(',') || stringValue.includes('"')) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }

                    return stringValue;
                })
                .join(',');
        });

        return [headerRow, ...rows].join('\n');
    }

    static generateFilename(prefix: string): string {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `${prefix}_${timestamp}.csv`;
    }
}