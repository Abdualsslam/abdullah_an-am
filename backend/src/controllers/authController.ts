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
