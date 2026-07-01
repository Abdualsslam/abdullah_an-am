import { Schema, model } from 'mongoose';

const siteSettingsSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true }
}, {
  timestamps: true
});

export const SiteSettings = model('SiteSettings', siteSettingsSchema);
