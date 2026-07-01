import { Schema, model } from 'mongoose';

const categorySchema = new Schema({
  name_ar: { type: String, required: true },
  name_en: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  icon: { type: String, required: true }, // lucide icon name
  href: { type: String, required: true },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Category = model('Category', categorySchema);
