import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma'; // We will create this

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
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
import { initEmailSyncWorker } from './workers/email-sync.worker';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { emailSyncQueue, startPeriodicSync } from './queues/email-sync.queue';

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

// Bull Board - Queue monitoring dashboard
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
    queues: [new BullAdapter(emailSyncQueue)],
    serverAdapter: serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

app.get('/', (req, res) => {
    // Health check endpoint
    res.json({ message: 'ispecia API is running' });
});

// Initialize background workers
initEmailSyncWorker();

// Start periodic email sync
startPeriodicSync().then(() => {
    console.log('✅ Email sync queue initialized');
}).catch((err) => {
    console.error('❌ Failed to start periodic sync:', err);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Bull Board available at http://localhost:${port}/admin/queues`);
});
