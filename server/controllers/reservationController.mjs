import Reservation from '../models/Reservation.mjs';
import Room from '../models/Room.mjs';
import Guest from '../models/Guest.mjs';

// Helper function to generate unique human-readable booking ID
const generateBookingId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `LS-${timestamp}-${random}`;
};

// @desc    Get all reservations (optional filter by status)
// @route   GET /api/reservations
// @access  Private (Admin, Manager, Receptionist)
export const getReservations = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const reservations = await Reservation.find(filter)
      .populate('guest', 'fullName email phone idNumber')
      .populate('room', 'roomNumber roomType pricePerNight status')
      .populate('bookedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error.message);
    res.status(500).json({ message: 'Server error fetching reservations' });
  }
};

// @desc    Get single reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
export const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('guest')
      .populate('room')
      .populate('bookedBy', 'name email role');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation details:', error.message);
    res.status(500).json({ message: 'Server error fetching reservation details' });
  }
};

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private (Admin, Manager, Receptionist, Guest)
export const createReservation = async (req, res) => {
  try {
    const { guestId, roomId, checkInDate, checkOutDate } = req.body;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Validate dates
    if (checkIn >= checkOut) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Verify guest exists
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Check for date conflicts on active reservations
    const conflictingReservation = await Reservation.findOne({
      room: roomId,
      status: { $in: ['Confirmed', 'CheckedIn'] },$or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: {$gt: checkIn } },
      ],
    });

    if (conflictingReservation) {
      return res.status(400).json({
        message: 'Room is already booked for selected dates. Choose another room or date range.',
      });
    }

    // Calculate total nights and pricing
    const diffTime = Math.abs(checkOut - checkIn);
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalAmount = totalNights * room.pricePerNight;

    const reservation = await Reservation.create({
      bookingId: generateBookingId(),
      guest: guestId,
      room: roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalNights,
      totalAmount,
      status: 'Confirmed',
      bookedBy: req.user._id,
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error.message);
    res.status(500).json({ message: 'Server error creating reservation' });
  }
};

// @desc    Update reservation status (Check-in, Check-out, Cancel)
// @route   PATCH /api/reservations/:id/status
// @access  Private (Admin, Manager, Receptionist)
export const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid reservation status' });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    reservation.status = status;
    await reservation.save();

    // Sync room status according to reservation state
    if (status === 'CheckedIn') {
      await Room.findByIdAndUpdate(reservation.room, { status: 'Occupied' });
    } else if (status === 'CheckedOut') {
      await Room.findByIdAndUpdate(reservation.room, { status: 'Cleaning' });
    } else if (status === 'Cancelled') {
      await Room.findByIdAndUpdate(reservation.room, { status: 'Available' });
    }

    res.json({ message: `Reservation status updated to ${status}`, reservation });
  } catch (error) {
    console.error('Error updating reservation status:', error.message);
    res.status(500).json({ message: 'Server error updating status' });
  }
};