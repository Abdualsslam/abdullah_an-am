import { Request, Response } from 'express';
import { Project } from '../models/Project';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProjectsByCategory = async (req: Request, res: Response) => {
  const { category } = req.params;
  try {
    const projects = await Project.find({ category }).sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createProject = async (req: Request, res: Response) => {
  const { title_ar, title_en, category, main_image, images, description_ar, description_en, order } = req.body;

  try {
    const project = await Project.create({
      title_ar,
      title_en,
      category,
      main_image,
      images: images || [],
      description_ar: description_ar || '',
      description_en: description_en || '',
      order: order || 0
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title_ar, title_en, category, main_image, images, description_ar, description_en, order } = req.body;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.title_ar = title_ar || project.title_ar;
    project.title_en = title_en || project.title_en;
    project.category = category || project.category;
    project.main_image = main_image || project.main_image;
    if (images !== undefined) project.images = images;
    project.description_ar = description_ar !== undefined ? description_ar : project.description_ar;
    project.description_en = description_en !== undefined ? description_en : project.description_en;
    if (order !== undefined) project.order = order;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Project.findByIdAndDelete(id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const reorderProjects = async (req: Request, res: Response) => {
  const { orderList } = req.body; // Array of { id: string, order: number }

  try {
    for (const item of orderList) {
      await Project.findByIdAndUpdate(item.id, { order: item.order });
    }
    res.json({ message: 'Projects reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
