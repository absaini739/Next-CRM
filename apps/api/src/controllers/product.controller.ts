import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const productSchema = z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    quantity: z.number().int().optional(),
    price: z.number().optional(),
});

export const createProduct = async (req: Request, res: Response) => {
    try {
        const data = productSchema.parse(req.body);
        const product = await prisma.product.create({
            data: {
                ...data,
            },
        });
        res.status(201).json(product);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error creating product' });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { created_at: 'desc' },
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
};
