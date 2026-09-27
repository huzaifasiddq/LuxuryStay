import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  Receipt, 
  Plus, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Trash2,
  Printer,
  CreditCard
} from 'lucide-react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form State strictly synced with createInvoice Controller
  const [reservationId, setReservationId] = useState('');
  const [taxPercent, setTaxPercent] = useState(16); // 16% standard
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [services, setServices] = useState([]);

  // Service input state
  const [serviceName, setServiceName] = useState('');
  const [serviceCost, setServiceCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resInvoices, resBookings] = await Promise.all([
        API.get('/invoices'),
        API.get('/reservations'),
      ]);

      const invData = resInvoices.data?.data || resInvoices.data?.invoices || resInvoices.data || [];
      const bookData = resBookings.data?.data || resBookings.data?.reservations || resBookings.data || [];

      setInvoices(Array.isArray(invData) ? invData : []);
      setReservations(Array.isArray(bookData) ? bookData : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Selected reservation details for live preview
  const selectedReservation = reservations.find((r) => r._id === reservationId);
  const roomCharges = selectedReservation?.totalAmount || 0;
  const servicesTotal = services.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
  const liveSubtotal = roomCharges + servicesTotal;
  const liveTaxAmount = Math.round((liveSubtotal * Number(taxPercent || 0)) / 100);
  const liveGrandTotal = liveSubtotal + liveTaxAmount;

  // Add Service Item
  const handleAddService = () => {
    if (!serviceName.trim() || !serviceCost || Number(serviceCost) <= 0) return;
    setServices([...services, { name: serviceName.trim(), cost: Number(serviceCost) }]);
    setServiceName('');
    setServiceCost('');
  };

  // Remove Service Item
  const handleRemoveService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // Submit Invoice to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reservationId) {
      alert('Please select a Reservation');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/invoices', {
        reservationId,
        services,
        taxRate: Number(taxPercent) / 100,
        paymentMethod,
      });

      setShowCreateModal(false);
      setReservationId('');
      setServices([]);
      setPaymentMethod('Cash');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating invoice');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Payment Status Update using PATCH route
  const handleQuickPayment = async (invoiceId) => {
    try {
      await API.patch(`/invoices/${invoiceId}/payment`, {
        paymentStatus: 'Paid',
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><CheckCircle size={12} className="me-1 inline" />Paid</span>;
      case 'Partially Paid':
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">Partial</span>;
      default:
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1"><AlertCircle size={12} className="me-1 inline" />Unpaid</span>;
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const invNum = inv.invoiceNumber?.toLowerCase() || '';
    const guestName = inv.guest?.fullName?.toLowerCase() || '';
    return invNum.includes(q) || guestName.includes(q);
  });

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--hotel-navy)' }}>
            Billing & Invoices
          </h3>
          <p className="text-muted mb-0 small">
            Generate receipts, track room charges, hotel services, and settle guest accounts
          </p>
        </div>
        <button 
          className="btn btn-luxury d-flex align-items-center gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} /> Create New Invoice
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="luxury-card p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search invoice by # or guest name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Invoice Table */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading invoices...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredInvoices.length === 0 ? (
        <div className="luxury-card text-center py-5">
          <Receipt size={48} className="text-muted mb-2 opacity-50" />
          <h5 className="fw-semibold">No Invoices Found</h5>
          <p className="text-muted small">Generate your first invoice for a guest reservation.</p>
        </div>
      ) : (
        <div className="luxury-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase text-muted">
                  <th className="ps-4">Invoice #</th>
                  <th>Guest</th>
                  <th>Method</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id}>
                    <td className="ps-4 fw-bold text-dark">{inv.invoiceNumber}</td>
                    <td>
                      <div>
                        <span className="fw-semibold">{inv.guest?.fullName || 'Guest'}</span>
                        <div className="text-muted small" style={{ fontSize: '11px' }}>
                          {inv.guest?.phone || 'No phone'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td>${inv.subtotal}</td>
                    <td className="text-muted">${inv.taxAmount}</td>
                    <td>
                      <span className="fw-bold fs-6" style={{ color: 'var(--hotel-navy)' }}>
                        ${inv.totalAmount}
                      </span>
                    </td>
                    <td>{getStatusBadge(inv.paymentStatus)}</td>
                    <td className="text-end pe-4">
                      <div className="d-inline-flex gap-2">
                        {inv.paymentStatus !== 'Paid' && (
                          <button
                            className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-1"
                            onClick={() => handleQuickPayment(inv._id)}
                            title="Mark as Paid"
                          >
                            <CreditCard size={13} /> Settle
                          </button>
                        )}
                        <button
                          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <Eye size={14} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold" style={{ color: 'var(--hotel-navy)' }}>
                  Generate Reservation Invoice
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCreateModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* Reservation Dropdown */}
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold">Select Active Reservation *</label>
                      <select 
                        className="form-select"
                        required
                        value={reservationId}
                        onChange={(e) => setReservationId(e.target.value)}
                      >
                        <option value="">-- Choose Reservation --</option>
                        {reservations.map((r) => (
                          <option key={r._id} value={r._id}>
                            Room {r.room?.roomNumber || 'N/A'} — {r.guest?.fullName || 'Guest'} (${r.totalAmount})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Method */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Payment Method</label>
                      <select 
                        className="form-select"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Online Transfer">Online Transfer</option>
                      </select>
                    </div>

                    {/* Services Add Section */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold d-block">
                        Hospitality Add-on Services (Optional)
                      </label>
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. Dining, Laundry, Minibar"
                          value={serviceName}
                          onChange={(e) => setServiceName(e.target.value)}
                        />
                        <input 
                          type="number" 
                          className="form-control" 
                          placeholder="Cost ($)"
                          style={{ maxWidth: '140px' }}
                          value={serviceCost}
                          onChange={(e) => setServiceCost(e.target.value)}
                        />
                        <button 
                          type="button" 
                          className="btn btn-dark"
                          onClick={handleAddService}
                        >
                          Add Service
                        </button>
                      </div>

                      {services.length > 0 && (
                        <div className="table-responsive border rounded mt-2">
                          <table className="table table-sm align-middle mb-0">
                            <thead className="table-light">
                              <tr>
                                <th className="ps-3">Service Name</th>
                                <th>Cost</th>
                                <th className="text-end pe-3">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {services.map((s, idx) => (
                                <tr key={idx}>
                                  <td className="ps-3">{s.name}</td>
                                  <td>${s.cost}</td>
                                  <td className="text-end pe-3">
                                    <button 
                                      type="button" 
                                      className="btn btn-sm btn-link text-danger p-0"
                                      onClick={() => handleRemoveService(idx)}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Financial Summary */}
                    <div className="col-12">
                      <div className="p-3 rounded bg-light border">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted small">Room Charges:</span>
                          <span className="fw-semibold">${roomCharges}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted small">Services Total:</span>
                          <span className="fw-semibold">${servicesTotal}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted small">Subtotal:</span>
                          <span className="fw-semibold">${liveSubtotal}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Tax Rate (%):</span>
                          <input 
                            type="number" 
                            className="form-control form-control-sm text-end"
                            style={{ width: '80px' }}
                            value={taxPercent}
                            onChange={(e) => setTaxPercent(e.target.value)}
                          />
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted small">Calculated Tax:</span>
                          <span className="fw-semibold">${liveTaxAmount}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold fs-6">Grand Total:</span>
                          <span className="fw-bold fs-5 text-success">${liveGrandTotal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-luxury btn-sm"
                    disabled={submitting}
                  >
                    {submitting ? 'Generating...' : 'Issue Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW & PRINT RECEIPT MODAL */}
      {selectedInvoice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedInvoice(null)}
                />
              </div>
              <div className="modal-body p-4 pt-0">
                <div className="text-center mb-4 border-bottom pb-3">
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--hotel-navy)' }}>
                    LuxuryStay Hospitality
                  </h4>
                  <p className="text-muted small mb-0">Official Guest Folio / Receipt</p>
                </div>

                <div className="d-flex justify-content-between small mb-3">
                  <div>
                    <strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}<br />
                    <strong>Guest:</strong> {selectedInvoice.guest?.fullName || 'N/A'}<br />
                    <strong>Phone:</strong> {selectedInvoice.guest?.phone || 'N/A'}
                  </div>
                  <div className="text-end">
                    <strong>Date:</strong> {new Date(selectedInvoice.createdAt || Date.now()).toLocaleDateString()}<br />
                    <strong>Method:</strong> {selectedInvoice.paymentMethod}<br />
                    <strong>Status:</strong> {selectedInvoice.paymentStatus}
                  </div>
                </div>

                <table className="table table-sm border small mb-3">
                  <thead className="table-light">
                    <tr>
                      <th>Description</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Base Accommodation Charges</td>
                      <td className="text-end">${selectedInvoice.roomCharges}</td>
                    </tr>
                    {selectedInvoice.services?.map((s, idx) => (
                      <tr key={idx}>
                        <td>{s.name}</td>
                        <td className="text-end">${s.cost}</td>
                      </tr>
                    ))}
                    <tr className="border-top">
                      <td className="fw-bold">Subtotal</td>
                      <td className="text-end fw-bold">${selectedInvoice.subtotal}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Taxes & Levies</td>
                      <td className="text-end text-muted">${selectedInvoice.taxAmount}</td>
                    </tr>
                    <tr className="table-light">
                      <td className="fw-bold fs-6">Grand Total</td>
                      <td className="text-end fw-bold fs-6">${selectedInvoice.totalAmount}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-center text-muted small mt-4">
                  Thank you for choosing LuxuryStay Hospitality!
                </div>
              </div>
              <div className="modal-footer border-top bg-light">
                <button 
                  className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1"
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> Print Receipt
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setSelectedInvoice(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}