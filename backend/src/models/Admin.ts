import { Schema, model } from 'mongoose';

const adminSchema = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}, {
  timestamps: true
});

export const Admin = model('Admin', adminSchema);
