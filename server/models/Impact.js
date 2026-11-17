const mongoose = require('mongoose');
const ImpactSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'public' },
  dogsHelped: { type: Number, default: 0, min: 0 },
  capsCollected: { type: Number, default: 0, min: 0 },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.models.Impact || mongoose.model('Impact', ImpactSchema);
