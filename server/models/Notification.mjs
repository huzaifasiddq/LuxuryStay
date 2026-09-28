import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // If recipientRole is set, all active users of that role see it (broadcast).
    // If recipient is set, it's targeted to one user specifically.
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    recipientRole: {
      type: String,
      enum: ['Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Maintenance', null],
      default: null,
    },
    type: {
      type: String,
      enum: ['Booking', 'Maintenance', 'ServiceRequest', 'Feedback', 'System'],
      default: 'System',
    },
    message: { type: String, required: true },
    link: { type: String, default: '' }, // frontend route to navigate to on click
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
