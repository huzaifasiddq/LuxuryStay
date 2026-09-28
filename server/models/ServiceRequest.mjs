import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema(
  {
    guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', default: null },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    serviceType: {
      type: String,
      enum: ['RoomService', 'WakeUpCall', 'Transportation', 'Housekeeping', 'Other'],
      required: true,
    },
    details: { type: String, default: '' },
    requestedTime: { type: Date, default: null }, // e.g. wake-up call time, pickup time
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
export default ServiceRequest;
