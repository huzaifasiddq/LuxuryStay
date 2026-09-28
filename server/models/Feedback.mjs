import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    response: { type: String, default: '' },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
