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

app.get('/', (req, res) => {
    // Health check endpoint
    res.json({ message: 'ispecia API is running' });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
