import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Guest full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Guest email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    idType: {
      type: String,
      enum: ['CNIC', 'Passport', 'Driving License'],
      default: 'CNIC',
    },
    idNumber: {
      type: String,
      required: [true, 'ID / CNIC number is required'],
      unique: true,
      trim: true,
    },
    country: {
      type: String,
      default: 'Pakistan',
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
    specialPreferences: {
      type: String,
      default: 'None',
    },
  },
  {
    timestamps: true, // Automatically tracks creation and update time
  }
);

const Guest = mongoose.model('Guest', guestSchema);
export default Guest;