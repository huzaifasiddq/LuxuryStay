import Invoice from '../models/Invoice.mjs';
import Reservation from '../models/Reservation.mjs';

// Helper function to generate clean invoice numbering
const generateInvoiceNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomSuffix}`;
};

// @desc    Get all invoices (optional filter by paymentStatus)
// @route   GET /api/invoices
// @access  Private (Admin, Manager, Accountant, Receptionist)
export const getInvoices = async (req, res) => {
  try {
    const { paymentStatus } = req.query;
    const filter = paymentStatus ? { paymentStatus } : {};

    const invoices = await Invoice.find(filter)
      .populate('guest', 'fullName email phone idNumber')
      .populate({
        path: 'reservation',
        populate: { path: 'room', select: 'roomNumber roomType' },
      })
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error.message);
    res.status(500).json({ message: 'Server error fetching invoices' });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('guest')
      .populate({
        path: 'reservation',
        populate: { path: 'room' },
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice details:', error.message);
    res.status(500).json({ message: 'Server error fetching invoice details' });
  }
};

// @desc    Generate invoice for a reservation
// @route   POST /api/invoices
// @access  Private (Admin, Manager, Receptionist)
export const createInvoice = async (req, res) => {
  try {
    const { reservationId, services = [], taxRate = 0.16, paymentMethod = 'Cash' } = req.body;

    const reservation = await Reservation.findById(reservationId).populate('room');
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if an invoice already exists for this reservation
    const existingInvoice = await Invoice.findOne({ reservation: reservationId });
    if (existingInvoice) {
      return res.status(400).json({
        message: 'Invoice already generated for this reservation',
        invoice: existingInvoice,
      });
    }

    const roomCharges = reservation.totalAmount;
    const servicesTotal = services.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
    const subtotal = roomCharges + servicesTotal;
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    const invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      reservation: reservation._id,
      guest: reservation.guest,
      roomCharges,
      services,
      subtotal,
      taxAmount,
      totalAmount,
      paymentStatus: 'Unpaid',
      paymentMethod,
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error.message);
    res.status(500).json({ message: 'Server error generating invoice' });
  }
};

// @desc    Record payment for an invoice
// @route   PATCH /api/invoices/:id/payment
// @access  Private (Admin, Manager, Receptionist)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (paymentStatus) invoice.paymentStatus = paymentStatus;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;

    await invoice.save();

    res.json({ message: 'Payment status updated successfully', invoice });
  } catch (error) {
    console.error('Error updating payment status:', error.message);
    res.status(500).json({ message: 'Server error updating payment status' });
  }
};