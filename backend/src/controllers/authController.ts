import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'portfolio_jwt_secret_key_2026_abdul_anam', {
    expiresIn: '30d'
  });
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json({
      token: generateToken(admin._id.toString()),
      username: admin.username
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const setup = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const adminCount = await Admin.countDocuments({});
    if (adminCount > 0) {
      return res.status(400).json({ message: 'Setup already completed' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      username,
      passwordHash
    });

    res.status(201).json({
      message: 'Admin created successfully',
      token: generateToken(admin._id.toString()),
      username: admin.username
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Check if setup is needed
export const checkSetup = async (req: Request, res: Response) => {
  try {
    const adminCount = await Admin.countDocuments({});
    res.json({ isSetupRequired: adminCount === 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Change admin credentials (username and/or password)
export const changeCredentials = async (req: Request, res: Response) => {
  const { currentPassword, newUsername, newPassword } = req.body;
  const adminId = (req as any).adminId;

  if (!currentPassword) {
    return res.status(400).json({ message: 'Current password is required' });
  }

  if (!newUsername && !newPassword) {
    return res.status(400).json({ message: 'Provide a new username or new password' });
  }

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update username if provided
    if (newUsername && newUsername !== admin.username) {
      // Check if the new username is already taken by another admin
      const existingAdmin = await Admin.findOne({ username: newUsername, _id: { $ne: adminId } });
      if (existingAdmin) {
        return res.status(409).json({ message: 'Username already taken' });
      }
      admin.username = newUsername;
    }

    // Update password if provided
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      admin.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    await admin.save();

    // Generate a new token with the updated info
    res.json({
      message: 'Credentials updated successfully',
      token: generateToken(admin._id.toString()),
      username: admin.username
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
