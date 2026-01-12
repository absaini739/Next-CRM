import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { getPersonEmails as fetchPersonEmails } from '../services/email-linking.service';

const personSchema = z.object({
    name: z.string().min(1),
    emails: z.array(z.object({
        value: z.string().email(),
        label: z.string().optional(),
    })),
    contact_numbers: z.array(z.object({
        value: z.string(),
        label: z.string().optional(),
    })).optional(),
    organization_id: z.number().int().optional(),
});

export const createPerson = async (req: Request, res: Response) => {
    try {
        const data = personSchema.parse(req.body);
        // @ts-ignore
        const userId = req.userId;

        const person = await prisma.person.create({
            data: {
                ...data,
                user_id: userId,
            },
            include: { organization: true }
        });
        res.status(201).json(person);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error creating person' });
    }
};

export const getPersons = async (req: Request, res: Response) => {
    try {
        const persons = await prisma.person.findMany({
            include: { organization: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(persons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching persons' });
    }
};

export const getPerson = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const person = await prisma.person.findUnique({
            where: { id },
            include: { organization: true, leads: true, deals: true }
        });
        if (!person) return res.status(404).json({ message: 'Person not found' });
        res.json(person);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching person' });
    }
};

export const updatePerson = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const data = personSchema.parse(req.body);

        const person = await prisma.person.update({
            where: { id },
            data,
        });

        res.json(person);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error updating person' });
    }
};

export const deletePerson = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        await prisma.person.delete({
            where: { id },
        });

        res.json({ message: 'Person deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting person' });
    }
};

export const getPersonEmails = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        // Verify person exists
        const person = await prisma.person.findUnique({
            where: { id },
        });

        if (!person) {
            return res.status(404).json({ message: 'Person not found' });
        }

        const emails = await fetchPersonEmails(id);
        res.json(emails);
    } catch (error) {
        console.error('Error fetching person emails:', error);
        res.status(500).json({ message: 'Error fetching emails' });
    }
};
