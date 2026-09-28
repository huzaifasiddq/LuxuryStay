import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      enum: ['Single', 'Double', 'Standard', 'Deluxe', 'Suite', 'Executive Suite', 'Presidential Suite'],
      default: 'Single',
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
      default: 'Available',
    },
    capacity: {
      type: Number,
      default: 2,
      min: [1, 'Capacity must be at least 1'],
      max: [10, 'Capacity cannot exceed 10'],
    },
    floor: {
      type: Number,
      default: 1,
    },
    features: {
      type: [String], // e.g. ['Wi-Fi', 'AC', 'TV', 'Balcony']
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room', roomSchema);
export default Room;