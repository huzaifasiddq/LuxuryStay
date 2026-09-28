import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    hotelName: { type: String, default: 'LuxuryStay Hospitality' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    currency: { type: String, default: 'PKR' },
    taxRate: { type: Number, default: 0.16 }, // 16% default, used across invoices
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '12:00' },
    lateCheckoutFee: { type: Number, default: 0 },
    cancellationPolicy: {
      type: String,
      default: 'Free cancellation up to 24 hours before check-in. Late cancellations forfeit one night.',
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
