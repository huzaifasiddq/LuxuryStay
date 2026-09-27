import Guest from '../models/Guest.mjs';

// @desc    Get all guests
// @route   GET /api/guests
// @access  Private (Admin, Manager, Receptionist)
export const getGuests = async (req, res) => {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 });
    res.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error.message);
    res.status(500).json({ message: 'Server error fetching guests' });
  }
};

// @desc    Get single guest by ID
// @route   GET /api/guests/:id
// @access  Private (Admin, Manager, Receptionist)
export const getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    res.json(guest);
  } catch (error) {
    console.error('Error fetching guest details:', error.message);
    res.status(500).json({ message: 'Server error fetching guest details' });
  }
};

// @desc    Register a new guest profile
// @route   POST /api/guests
// @access  Private (Admin, Manager, Receptionist)
export const createGuest = async (req, res) => {
  try {
    const { fullName, email, phone, idType, idNumber, country, address, specialPreferences } = req.body;

    // Check if guest with same ID/CNIC number already exists
    const guestExists = await Guest.findOne({ idNumber });
    if (guestExists) {
      return res.status(400).json({ message: `Guest with ID ${idNumber} already exists` });
    }

    const guest = await Guest.create({
      fullName,
      email,
      phone,
      idType: idType || 'CNIC',
      idNumber,
      country: country || 'Pakistan',
      address: address || '',
      specialPreferences: specialPreferences || 'None',
    });

    res.status(201).json(guest);
  } catch (error) {
    console.error('Error creating guest profile:', error.message);
    res.status(500).json({ message: 'Server error creating guest profile' });
  }
};

// @desc    Update guest profile
// @route   PUT /api/guests/:id
// @access  Private (Admin, Manager, Receptionist)
export const updateGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.json(guest);
  } catch (error) {
    console.error('Error updating guest profile:', error.message);
    res.status(500).json({ message: 'Server error updating guest profile' });
  }
};