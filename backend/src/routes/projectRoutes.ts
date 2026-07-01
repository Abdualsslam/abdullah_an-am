import { Router } from 'express';
import { getProjects, getProjectsByCategory, getProjectById, createProject, updateProject, deleteProject, reorderProjects } from '../controllers/projectController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', getProjects);
router.get('/category/:category', getProjectsByCategory);
router.get('/single/:id', getProjectById);
router.get('/:id', getProjectById);

router.post('/', protect, createProject);
router.put('/reorder', protect, reorderProjects);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

export default router;
