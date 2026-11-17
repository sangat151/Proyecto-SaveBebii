const mongoose = require('mongoose');
const DonationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 70 },
  contact: { type: String, trim: true, maxlength: 100 },
  type: { type: String, required: true },
  detail: { type: String, required: true, trim: true, maxlength: 140 },
  status: { type: String, enum: ['pendiente', 'recibido', 'verificado'], default: 'pendiente' }
}, { timestamps: true });
module.exports = mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
