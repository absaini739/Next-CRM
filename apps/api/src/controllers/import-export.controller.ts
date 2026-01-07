import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Create import job
export const createImport = async (req: Request, res: Response) => {
    try {
        const { entity_type, file_data, field_mapping } = req.body;
        // @ts-ignore
        const userId = req.userId;

        // Parse CSV/Excel data
        let rows: any[] = [];
        if (file_data.type === 'csv') {
            const parsed = Papa.parse(file_data.content, { header: true });
            rows = parsed.data;
        } else if (file_data.type === 'xlsx') {
            const workbook = XLSX.read(file_data.content, { type: 'base64' });
            const sheetName = workbook.SheetNames[0];
            rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }

        // Process based on entity type
        let successCount = 0;
        let failedCount = 0;
        const errors: any[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            try {
                const mappedData: any = {};

                // Map fields according to field_mapping
                Object.keys(field_mapping).forEach(dbField => {
                    const csvField = field_mapping[dbField];
                    if (row[csvField] !== undefined && row[csvField] !== '') {
                        mappedData[dbField] = row[csvField];
                    }
                });

                // Import based on entity type
                if (entity_type === 'persons') {
                    await prisma.person.create({
                        data: {
                            name: mappedData.name,
                            emails: mappedData.email ? [{ value: mappedData.email, label: 'primary' }] : [],
                            contact_numbers: mappedData.phone ? [{ value: mappedData.phone, label: 'primary' }] : [],
                            user_id: userId,
                        }
                    });
                } else if (entity_type === 'products') {
                    await prisma.product.create({
                        data: {
                            sku: mappedData.sku,
                            name: mappedData.name,
                            description: mappedData.description,
                            price: parseFloat(mappedData.price || 0),
                            quantity: parseInt(mappedData.quantity || 0),
                        }
                    });
                } else if (entity_type === 'leads') {
                    const leadData: any = {
                        title: mappedData.title,
                        description: mappedData.description,
                        lead_source_id: 1,
                        lead_type_id: 1,
                        user_id: userId,
                        status: 1,
                    };
                    if (mappedData.value) leadData.lead_value = parseFloat(mappedData.value);
                    if (mappedData.person_id) leadData.person_id = parseInt(mappedData.person_id);

                    await prisma.lead.create({ data: leadData });
                }

                successCount++;
            } catch (error: any) {
                failedCount++;
                errors.push({
                    row: i + 1,
                    data: row,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            total_rows: rows.length,
            success_count: successCount,
            failed_count: failedCount,
            errors: errors.slice(0, 10) // Return first 10 errors
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Error processing import', error: error.message });
    }
};

// Export data
export const exportData = async (req: Request, res: Response) => {
    try {
        const { entity_type, format = 'csv' } = req.query;

        let data: any[] = [];
        let headers: string[] = [];

        if (entity_type === 'persons') {
            const persons = await prisma.person.findMany({
                include: { organization: true }
            });

            data = persons.map(p => {
                const emails = p.emails as any;
                const phones = p.contact_numbers as any;
                return {
                    Name: p.name,
                    Email: emails?.[0]?.value || '',
                    Phone: phones?.[0]?.value || '',
                    Organization: p.organization?.name || '',
                    'Created At': p.created_at.toISOString().split('T')[0]
                };
            });
            headers = ['Name', 'Email', 'Phone', 'Organization', 'Created At'];
        } else if (entity_type === 'products') {
            const products = await prisma.product.findMany();

            data = products.map(p => ({
                SKU: p.sku,
                Name: p.name,
                Description: p.description || '',
                Price: p.price,
                Quantity: p.quantity,
                'Created At': p.created_at.toISOString().split('T')[0]
            }));
            headers = ['SKU', 'Name', 'Description', 'Price', 'Quantity', 'Created At'];
        } else if (entity_type === 'leads') {
            const leads = await prisma.lead.findMany({
                include: { person: true, source: true, type: true }
            });

            data = leads.map(l => ({
                Title: l.title,
                Description: l.description || '',
                Value: l.lead_value || 0,
                Person: l.person?.name || '',
                Source: l.source?.name || '',
                Type: l.type?.name || '',
                Status: l.status === 1 ? 'Won' : l.status === 0 ? 'Lost' : 'Open',
                'Created At': l.created_at.toISOString().split('T')[0]
            }));
            headers = ['Title', 'Description', 'Value', 'Person', 'Source', 'Type', 'Status', 'Created At'];
        }

        if (format === 'csv') {
            const csv = Papa.unparse(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${entity_type}_export.csv`);
            res.send(csv);
        } else if (format === 'xlsx') {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, entity_type as string);
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${entity_type}_export.xlsx`);
            res.send(buffer);
        }
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Error exporting data', error: error.message });
    }
};
