import ServiceRequest from '../models/ServiceRequest.mjs';
import { notifyRole } from './notificationController.mjs';

// @desc    Get all service requests (filter by status/type)
// @route   GET /api/service-requests
// @access  Private
export const getServiceRequests = async (req, res) => {
  try {
    const { status, serviceType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;

    const requests = await ServiceRequest.find(filter)
      .populate('guest', 'fullName phone')
      .populate('room', 'roomNumber')
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching service requests:', error.message);
    res.status(500).json({ message: 'Server error fetching service requests' });
  }
};

// @desc    Log a new guest service request
// @route   POST /api/service-requests
// @access  Private
export const createServiceRequest = async (req, res) => {
  try {
    const { guestId, reservationId, roomId, serviceType, details, requestedTime } = req.body;

    if (!guestId || !serviceType) {
      return res.status(400).json({ message: 'Guest and service type are required' });
    }

    const request = await ServiceRequest.create({
      guest: guestId,
      reservation: reservationId || null,
      room: roomId || null,
      serviceType,
      details: details || '',
      requestedTime: requestedTime || null,
      loggedBy: req.user._id,
    });

    // Notify front-desk/housekeeping staff of the new request
    await notifyRole(
      serviceType === 'Transportation' ? 'Manager' : 'Housekeeping',
      `New ${serviceType} request logged`,
      'ServiceRequest',
      '/service-requests'
    );

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating service request:', error.message);
    res.status(500).json({ message: 'Server error creating service request' });
  }
};

// @desc    Update service request status / assignment
// @route   PUT /api/service-requests/:id/status
// @access  Private
export const updateServiceRequestStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    if (status) request.status = status;
    if (assignedTo !== undefined) request.assignedTo = assignedTo;

    await request.save();
    res.json(request);
  } catch (error) {
    console.error('Error updating service request:', error.message);
    res.status(500).json({ message: 'Server error updating service request' });
  }
};
