import Room from '../models/Room.mjs';

// @desc    Get all rooms (supports filter by status or roomType)
// @route   GET /api/rooms
// @access  Public
export const getRooms = async (req, res) => {
  try {
    const { status, roomType } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (roomType) filter.roomType = roomType;

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error.message);
    res.status(500).json({ message: 'Server error fetching rooms' });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Error fetching room details:', error.message);
    res.status(500).json({ message: 'Server error fetching room details' });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private (Admin, Manager)
export const createRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerNight, status, floor, features } = req.body;

    // Check if room number already exists
    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ message: `Room ${roomNumber} already exists` });
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      pricePerNight,
      status: status || 'Available',
      floor: floor || 1,
      features: features || [],
    });

    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error.message);
    res.status(500).json({ message: 'Server error creating room' });
  }
};

// @desc    Update room details or status
// @route   PUT /api/rooms/:id
// @access  Private (Admin, Manager, Receptionist)
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error updating room:', error.message);
    res.status(500).json({ message: 'Server error updating room' });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin only)
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room removed successfully' });
  } catch (error) {
    console.error('Error deleting room:', error.message);
    res.status(500).json({ message: 'Server error deleting room' });
  }
};