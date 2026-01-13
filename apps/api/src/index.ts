import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Security & Performance Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(compression()); // Gzip compression
app.use(express.json());

import authRoutes from './routes/auth.routes';
import personRoutes from './routes/person.routes';
import organizationRoutes from './routes/organization.routes';
import leadRoutes from './routes/lead.routes';
import dealRoutes from './routes/deal.routes';
import productRoutes from './routes/product.routes';
import quoteRoutes from './routes/quote.routes';
import activityRoutes from './routes/activity.routes';
import analyticsRoutes from './routes/analytics.routes';
import importExportRoutes from './routes/import-export.routes';
import pipelineRoutes from './routes/pipeline.routes';
import roleRoutes from './routes/role.routes';
import emailRoutes from './routes/email.routes';
import taskRoutes from './routes/task.routes';
import calendarRoutes from './routes/calendar.routes';
import voipProviderRoutes from './routes/voip-provider.routes';
import voipTrunkRoutes from './routes/voip-trunk.routes';
import inboundRouteRoutes from './routes/inbound-route.routes';
import callRecordingRoutes from './routes/call-recording.routes';
import emailAccountRoutes from './routes/email-account.routes';
import emailTemplateRoutes from './routes/email-template.routes';
import trackingRoutes from './routes/tracking.routes';
import callRoutes from './routes/call.routes';

app.use('/auth', authRoutes);
app.use('/persons', personRoutes);
app.use('/organizations', organizationRoutes);
app.use('/leads', leadRoutes);
app.use('/deals', dealRoutes);
app.use('/products', productRoutes);
app.use('/quotes', quoteRoutes);
app.use('/activities', activityRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/data-transfer', importExportRoutes);
app.use('/pipelines', pipelineRoutes);
app.use('/roles', roleRoutes);
app.use('/emails', emailRoutes);
app.use('/tasks', taskRoutes);
app.use('/calendar', calendarRoutes);
app.use('/voip/providers', voipProviderRoutes);
app.use('/voip/trunks', voipTrunkRoutes);
app.use('/voip/routes', inboundRouteRoutes);
app.use('/voip/recordings', callRecordingRoutes);
app.use('/email-accounts', emailAccountRoutes);
app.use('/email-templates', emailTemplateRoutes);
app.use('/track', trackingRoutes);
app.use('/voip', callRoutes);



// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'ispecia API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Detailed health check
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            status: 'healthy',
            checks: {
                database: 'connected',
            },
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: 'Database connection failed',
        });
    }
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);



// Validate environment variables on startup
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
}

// Warn about localhost API_URL
const apiUrl = process.env.API_URL || 'http://localhost:3001';
if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
    console.warn('⚠️  WARNING: API_URL is set to localhost. Email tracking will not work in production!');
    console.warn('   Set API_URL to your public domain for tracking to function correctly.');
}

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
if (frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1')) {
    console.log('ℹ️  FRONTEND_URL not set or is localhost. Defaulting to:', frontendUrl);
}

app.listen(port, () => {
    console.log(`✅ Server is running at http://localhost:${port}`);
    console.log(`🏥 Health check at http://localhost:${port}/health`);
});
