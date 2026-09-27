import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    roomCharges: {
      type: Number,
      required: true,
      default: 0,
    },
    services: [
      {
        name: { type: String, required: true }, // e.g. Food, Laundry, Mini-bar
        cost: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Paid', 'Partially Paid'],
      default: 'Unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Debit Card', 'Online Transfer'],
      default: 'Cash',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;