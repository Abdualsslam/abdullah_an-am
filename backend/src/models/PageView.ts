import { Schema, model } from 'mongoose';

const pageViewSchema = new Schema({
  path: { type: String, required: true },
  ipHash: { type: String, default: '' },
  userAgent: { type: String, default: '' }
}, {
  timestamps: true
});

export const PageView = model('PageView', pageViewSchema);
