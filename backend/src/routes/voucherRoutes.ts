import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { 
  createVoucher, 
  getVouchers, 
  getVoucherById, 
  updateVoucher, 
  deleteVoucher, 
  reviewVoucher 
} from '../controllers/voucherController';

const router = Router();

// Apply auth middleware to all routes below
router.use(authenticateToken);

router.post('/', requireRole(['employee']), upload.single('signature'), createVoucher);
router.get('/', getVouchers);
router.get('/:id', getVoucherById);
router.put('/:id', requireRole(['employee']), upload.single('signature'), updateVoucher);
router.delete('/:id', requireRole(['employee']), deleteVoucher);
router.post('/:id/review', requireRole(['director']), upload.single('signature'), reviewVoucher);

export default router;
