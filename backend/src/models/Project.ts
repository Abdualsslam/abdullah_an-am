import { Schema, model } from 'mongoose';

const projectSchema = new Schema({
  title_ar: { type: String, required: true },
  title_en: { type: String, required: true },
  category: { type: String, required: true }, // refers to category key
  main_image: { type: String, required: true }, // path to cover image or video
  images: [{ type: String }], // additional images/videos
  description_ar: { type: String, default: '' },
  description_en: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Project = model('Project', projectSchema);
