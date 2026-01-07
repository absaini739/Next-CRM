import { Router } from 'express';
import * as inboundRouteController from '../controllers/inbound-route.controller';

const router = Router();

router.get('/', inboundRouteController.getAllRoutes);
router.get('/:id', inboundRouteController.getRouteById);
router.post('/', inboundRouteController.createRoute);
router.put('/:id', inboundRouteController.updateRoute);
router.delete('/:id', inboundRouteController.deleteRoute);

export default router;
