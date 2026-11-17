const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: { type: String, trim: true, maxlength: 100 },
  phone: { type: String, trim: true, maxlength: 30 },
  items: [{
    productId: String,
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }
  }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["nuevo", "confirmado", "enviado", "cancelado"], default: "nuevo" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
