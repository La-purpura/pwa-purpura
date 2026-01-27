
import { Parser } from 'json2csv';

export function generateCsv(data: any[], fields?: string[]): string {
    if (!data || data.length === 0) return '';

    try {
        const opts = fields ? { fields } : {};
        const parser = new Parser(opts);
        return parser.parse(data);
    } catch (err) {
        console.error('Error generating CSV:', err);
        throw new Error('Error generando exportación CSV');
    }
}
