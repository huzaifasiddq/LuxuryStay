import Feedback from '../models/Feedback.mjs';

// @desc    Get all feedback (optionally filter by rating)
// @route   GET /api/feedback
// @access  Private
export const getFeedback = async (req, res) => {
  try {
    const { rating } = req.query;
    const filter = rating ? { rating: Number(rating) } : {};

    const feedback = await Feedback.find(filter)
      .populate('guest', 'fullName email')
      .populate('reservation', 'bookingId')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error.message);
    res.status(500).json({ message: 'Server error fetching feedback' });
  }
};

// @desc    Log new guest feedback (recorded by front desk on guest's behalf,
//          or wired up later to a guest-facing form)
// @route   POST /api/feedback
// @access  Private
export const createFeedback = async (req, res) => {
  try {
    const { guestId, reservationId, rating, comment } = req.body;

    if (!guestId || !rating) {
      return res.status(400).json({ message: 'Guest and rating are required' });
    }

    const feedback = await Feedback.create({
      guest: guestId,
      reservation: reservationId || null,
      rating,
      comment: comment || '',
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error.message);
    res.status(500).json({ message: 'Server error creating feedback' });
  }
};

// @desc    Staff response to a piece of feedback
// @route   PUT /api/feedback/:id/respond
// @access  Private (Admin, Manager)
export const respondToFeedback = async (req, res) => {
  try {
    const { response } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.response = response;
    feedback.respondedBy = req.user._id;
    feedback.respondedAt = new Date();
    await feedback.save();

    res.json(feedback);
  } catch (error) {
    console.error('Error responding to feedback:', error.message);
    res.status(500).json({ message: 'Server error responding to feedback' });
  }
};

// @desc    Delete feedback entry
// @route   DELETE /api/feedback/:id
// @access  Private (Admin)
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted' });
  } catch (error) {
    console.error('Error deleting feedback:', error.message);
    res.status(500).json({ message: 'Server error deleting feedback' });
  }
};
