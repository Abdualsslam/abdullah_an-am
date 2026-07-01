import { Request, Response } from 'express';
import crypto from 'crypto';
import { PageView } from '../models/PageView';
import { Project } from '../models/Project';
import { Category } from '../models/Category';

export const trackPageView = async (req: Request, res: Response) => {
  const { path } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '';
  const userAgent = req.headers['user-agent'] || '';

  try {
    // Generate a simple hash of IP to maintain privacy but allow unique count
    const ipHash = crypto.createHash('sha256').update(String(ip)).digest('hex');

    await PageView.create({
      path,
      ipHash,
      userAgent
    });

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking view', error });
  }
};

export const getAnalyticsStats = async (req: Request, res: Response) => {
  try {
    const totalViews = await PageView.countDocuments({});
    
    // Unique visitors (by IP Hash)
    const uniqueVisitorsResult = await PageView.aggregate([
      { $group: { _id: '$ipHash' } },
      { $count: 'count' }
    ]);
    const uniqueVisitors = uniqueVisitorsResult[0]?.count || 0;

    // Page views grouped by path
    const viewsByPath = await PageView.aggregate([
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Simple history (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyViews = await PageView.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalProjects = await Project.countDocuments({});
    const totalCategories = await Category.countDocuments({});

    res.json({
      totalViews,
      uniqueVisitors,
      totalProjects,
      totalCategories,
      viewsByPath,
      dailyViews
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
