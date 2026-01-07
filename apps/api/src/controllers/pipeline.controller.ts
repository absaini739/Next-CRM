import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const pipelineSchema = z.object({
    name: z.string().min(1),
    is_default: z.boolean().optional(),
});

const stageSchema = z.object({
    name: z.string().min(1),
    color: z.string().optional(),
    sort_order: z.number().int(),
});

// Get all pipelines
export const getPipelines = async (req: Request, res: Response) => {
    try {
        const pipelines = await prisma.leadPipeline.findMany({
            include: {
                stages: {
                    orderBy: { name: 'asc' }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(pipelines);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching pipelines' });
    }
};

// Create pipeline
export const createPipeline = async (req: Request, res: Response) => {
    try {
        const data = pipelineSchema.parse(req.body);
        const { stages } = req.body;

        // If this is set as default, unset other defaults
        if (data.is_default) {
            await prisma.leadPipeline.updateMany({
                where: { is_default: true },
                data: { is_default: false }
            });
        }

        const pipeline = await prisma.leadPipeline.create({
            data: {
                name: data.name,
                is_default: data.is_default || false,
            }
        });

        // Create stages if provided
        if (stages && Array.isArray(stages)) {
            await Promise.all(
                stages.map((stage: any, index: number) =>
                    prisma.leadPipelineStage.create({
                        data: {
                            name: stage.name,
                            lead_pipeline_id: pipeline.id,
                        }
                    })
                )
            );
        }

        const fullPipeline = await prisma.leadPipeline.findUnique({
            where: { id: pipeline.id },
            include: { stages: true }
        });

        res.status(201).json(fullPipeline);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error(error);
        res.status(500).json({ message: 'Error creating pipeline' });
    }
};

// Update pipeline
export const updatePipeline = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const data = pipelineSchema.parse(req.body);

        if (data.is_default) {
            await prisma.leadPipeline.updateMany({
                where: { id: { not: id }, is_default: true },
                data: { is_default: false }
            });
        }

        const pipeline = await prisma.leadPipeline.update({
            where: { id },
            data: {
                name: data.name,
                is_default: data.is_default,
            },
            include: { stages: true }
        });

        res.json(pipeline);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error updating pipeline' });
    }
};

// Delete pipeline
export const deletePipeline = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        // Check if it's the default pipeline
        const pipeline = await prisma.leadPipeline.findUnique({ where: { id } });
        if (pipeline?.is_default) {
            return res.status(400).json({ message: 'Cannot delete default pipeline' });
        }

        await prisma.leadPipeline.delete({ where: { id } });
        res.json({ message: 'Pipeline deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting pipeline' });
    }
};

// Add stage to pipeline
export const addStage = async (req: Request, res: Response) => {
    try {
        const pipelineId = parseInt(req.params.id);
        const data = stageSchema.parse(req.body);

        const stage = await prisma.leadPipelineStage.create({
            data: {
                name: data.name,
                lead_pipeline_id: pipelineId,
            }
        });

        res.status(201).json(stage);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error adding stage' });
    }
};

// Update stage
export const updateStage = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.stageId);
        const data = stageSchema.partial().parse(req.body);

        const stage = await prisma.leadPipelineStage.update({
            where: { id },
            data: {
                name: data.name,
            }
        });

        res.json(stage);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error updating stage' });
    }
};

// Delete stage
export const deleteStage = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.stageId);
        await prisma.leadPipelineStage.delete({ where: { id } });
        res.json({ message: 'Stage deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting stage' });
    }
};
