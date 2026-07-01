import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory, reorderCategories } from '../controllers/categoryController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.post('/', protect, createCategory);
router.put('/reorder', protect, reorderCategories);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

export default router;
