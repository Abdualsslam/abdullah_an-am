import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Project } from '../models/Project';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const { name_ar, name_en, key, icon, href, order } = req.body;

  try {
    const existing = await Category.findOne({ key });
    if (existing) {
      return res.status(400).json({ message: 'Category key already exists' });
    }

    const category = await Category.create({
      name_ar,
      name_en,
      key,
      icon,
      href,
      order: order || 0
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name_ar, name_en, key, icon, href, order } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(444).json({ message: 'Category not found' });
    }

    // If key is changing, we should verify uniqueness
    if (key && key !== category.key) {
      const existing = await Category.findOne({ key });
      if (existing) {
        return res.status(400).json({ message: 'Category key already in use' });
      }
      
      // Update projects with old category key to the new key
      await Project.updateMany({ category: category.key }, { category: key });
    }

    category.name_ar = name_ar || category.name_ar;
    category.name_en = name_en || category.name_en;
    category.key = key || category.key;
    category.icon = icon || category.icon;
    category.href = href || category.href;
    if (order !== undefined) category.order = order;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete projects in this category
    await Project.deleteMany({ category: category.key });
    
    await Category.findByIdAndDelete(id);
    res.json({ message: 'Category and all its projects deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const reorderCategories = async (req: Request, res: Response) => {
  const { orderList } = req.body; // Array of { id: string, order: number }

  try {
    for (const item of orderList) {
      await Category.findByIdAndUpdate(item.id, { order: item.order });
    }
    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
