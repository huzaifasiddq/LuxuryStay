import User from '../models/User.mjs';

// @desc    Get all staff members (supports search & filter by role/status)
// @route   GET /api/staff
// @access  Private (Admin, Manager)
export const getStaff = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const filter = { role: { $ne: 'Guest' } };

    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const staff = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error.message);
    res.status(500).json({ message: 'Server error fetching staff' });
  }
};

// @desc    Get single staff member by ID
// @route   GET /api/staff/:id
// @access  Private (Admin, Manager)
export const getStaffById = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff member:', error.message);
    res.status(500).json({ message: 'Server error fetching staff member' });
  }
};

// @desc    Create a new staff account
// @route   POST /api/staff
// @access  Private (Admin, Manager)
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'A user already exists with this email' });
    }

    const staff = await User.create({
      name,
      email,
      password,
      role,
      phone: phone || '',
    });

    const { password: _pw, ...staffData } = staff.toObject();
    res.status(201).json(staffData);
  } catch (error) {
    console.error('Error creating staff member:', error.message);
    res.status(500).json({ message: 'Server error creating staff member' });
  }
};

// @desc    Update staff details (name, role, phone)
// @route   PUT /api/staff/:id
// @access  Private (Admin, Manager)
export const updateStaff = async (req, res) => {
  try {
    const { name, role, phone } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (role) updateFields.role = role;
    if (phone !== undefined) updateFields.phone = phone;

    const staff = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json(staff);
  } catch (error) {
    console.error('Error updating staff member:', error.message);
    res.status(500).json({ message: 'Server error updating staff member' });
  }
};

// @desc    Reset a staff member's password
// @route   PUT /api/staff/:id/password
// @access  Private (Admin, Manager)
export const resetStaffPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const staff = await User.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    staff.password = newPassword; // re-hashed automatically via pre-save hook
    await staff.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error.message);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};

// @desc    Activate or deactivate a staff account
// @route   PUT /api/staff/:id/status
// @access  Private (Admin, Manager)
export const toggleStaffStatus = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Prevent an admin from deactivating their own account by accident
    if (req.user && String(req.user._id) === String(staff._id)) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    staff.isActive = !staff.isActive;
    await staff.save();

    res.json({
      message: `Staff member ${staff.isActive ? 'activated' : 'deactivated'}`,
      isActive: staff.isActive,
    });
  } catch (error) {
    console.error('Error updating staff status:', error.message);
    res.status(500).json({ message: 'Server error updating staff status' });
  }
};

// @desc    Permanently delete a staff account
// @route   DELETE /api/staff/:id
// @access  Private (Admin only)
export const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ message: 'Staff member permanently deleted' });
  } catch (error) {
    console.error('Error deleting staff member:', error.message);
    res.status(500).json({ message: 'Server error deleting staff member' });
  }
};
