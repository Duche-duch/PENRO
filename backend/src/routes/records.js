import { Router } from 'express';
import {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} from '../controllers/recordsController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listRecords);
router.get('/:id', requireAuth, getRecord);
router.post('/', requireAuth, createRecord);
router.put('/:id', requireAuth, updateRecord);
router.delete('/:id', requireAuth, requireRoles('admin'), deleteRecord);

export default router;
