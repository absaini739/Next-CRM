import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const quoteSchema = z.object({
    subject: z.string().min(1),
    person_id: z.number().int(),
    items: z.array(z.object({
        product_id: z.number().int(),
        quantity: z.number().int(),
        price: z.number(),
    })),
    // Add other fields as needed
});

export const createQuote = async (req: Request, res: Response) => {
    try {
        const data = quoteSchema.parse(req.body);
        // @ts-ignore
        const userId = req.userId;

        // Calculate totals logic should be here
        let subTotal = 0;
        const itemCreates = data.items.map(item => {
            const total = item.quantity * item.price;
            subTotal += total;
            return {
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                amount: total,
            };
        });

        const quote = await prisma.quote.create({
            data: {
                quote_number: `QUO-${Date.now()}`,
                subject: data.subject,
                person_id: data.person_id,
                user_id: userId,
                sub_total: subTotal,
                grand_total: subTotal,
                items: {
                    create: itemCreates
                }
            },
            include: { items: true }
        });
        res.status(201).json(quote);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error(error);
        res.status(500).json({ message: 'Error creating quote' });
    }
};

export const getQuotes = async (req: Request, res: Response) => {
    try {
        const quotes = await prisma.quote.findMany({
            include: { person: true, items: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quotes' });
    }
};
