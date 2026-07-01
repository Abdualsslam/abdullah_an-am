import { Request, Response } from 'express';
import { SiteSettings } from '../models/SiteSettings';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await SiteSettings.find();
    // Convert to a nice key-value object
    const settingsMap: { [key: string]: any } = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    // Provide default settings if they don't exist yet
    const defaults = {
      whatsapp: '00972592308524',
      instagram: 'ahmed.designer19',
      name_ar: 'أحمد',
      name_en: 'Ahmed',
      title_ar: 'مصمم جرافيك',
      title_en: 'Graphic Designer',
      portfolioCategoriesOrder: ['brand', 'profile', 'social']
    };

    const finalSettings = { ...defaults, ...settingsMap };
    res.json(finalSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  const settingsObj = req.body; // e.g. { whatsapp: '...', title_ar: '...' }

  try {
    const keys = Object.keys(settingsObj);
    for (const key of keys) {
      await SiteSettings.findOneAndUpdate(
        { key },
        { value: settingsObj[key] },
        { upsert: true, new: true }
      );
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
