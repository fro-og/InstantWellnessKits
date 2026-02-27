import { Router } from 'express';
import multer from 'multer';
import { OrdersController } from '../controllers/orders.controller';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/orders - Manual order creation
router.post('/', OrdersController.create);

// GET /api/orders - List orders with filters
router.get('/', OrdersController.list);

// POST /api/orders/import - CSV import
router.post('/import', upload.single('file'), OrdersController.importCSV);

// GET /api/orders/:id - Get single order
router.get('/:id', OrdersController.getById);

export default router;