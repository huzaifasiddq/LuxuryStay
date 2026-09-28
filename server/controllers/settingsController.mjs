import Settings from '../models/Settings.mjs';

// Ensures a single settings document always exists
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private (any logged-in staff)
export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error.message);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (Admin only)
export const updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    const allowedFields = [
      'hotelName',
      'contactEmail',
      'contactPhone',
      'currency',
      'taxRate',
      'checkInTime',
      'checkOutTime',
      'lateCheckoutFee',
      'cancellationPolicy',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error.message);
    res.status(500).json({ message: 'Server error updating settings' });
  }
};
