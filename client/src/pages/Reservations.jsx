import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  CalendarCheck, 
  Plus, 
  Search, 
  User, 
  BedDouble, 
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal State synced with Backend Controller
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    guestId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
  });
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resBookings, resRooms, resGuests] = await Promise.all([
        API.get('/reservations'),
        API.get('/rooms'),
        API.get('/guests'),
      ]);

      const bookingsData = resBookings.data?.data || resBookings.data?.reservations || resBookings.data || [];
      const roomsData = resRooms.data?.data || resRooms.data?.rooms || resRooms.data || [];
      const guestsData = resGuests.data?.data || resGuests.data?.guests || resGuests.data || [];

      setReservations(Array.isArray(bookingsData) ? bookingsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setGuests(Array.isArray(guestsData) ? guestsData : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading reservations data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-calculate Total Amount when room or dates change
  useEffect(() => {
    if (formData.roomId && formData.checkInDate && formData.checkOutDate) {
      const selectedRoom = rooms.find((r) => r._id === formData.roomId);
      const inDate = new Date(formData.checkInDate);
      const outDate = new Date(formData.checkOutDate);

      const diffTime = outDate - inDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0 && selectedRoom?.pricePerNight) {
        setCalculatedTotal(diffDays * selectedRoom.pricePerNight);
      } else {
        setCalculatedTotal(0);
      }
    } else {
      setCalculatedTotal(0);
    }
  }, [formData.roomId, formData.checkInDate, formData.checkOutDate, rooms]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guestId || !formData.roomId) {
      alert('Kripya Guest aur Room dono select karein');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/reservations', {
        guestId: formData.guestId,
        roomId: formData.roomId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
      });

      setShowModal(false);
      setFormData({
        guestId: '',
        roomId: '',
        checkInDate: '',
        checkOutDate: '',
      });
      setCalculatedTotal(0);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Reservation create karne mein masla hua');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Badges
  const getBookingBadge = (status) => {
    switch (status) {
      case 'CheckedIn':
      case 'Checked-In':
        return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><CheckCircle size={12} className="me-1 inline" />Checked-In</span>;
      case 'Confirmed':
      case 'Booked':
        return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1"><Clock size={12} className="me-1 inline" />Confirmed</span>;
      case 'CheckedOut':
      case 'Checked-Out':
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">Checked-Out</span>;
      case 'Cancelled':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1"><XCircle size={12} className="me-1 inline" />Cancelled</span>;
      default:
        return <span className="badge bg-light text-dark">{status || 'Pending'}</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="badge bg-success text-white px-2 py-1">Paid</span>;
      case 'Partially Paid':
        return <span className="badge bg-warning text-dark px-2 py-1">Partial</span>;
      default:
        return <span className="badge bg-danger text-white px-2 py-1">Pending</span>;
    }
  };

  // Search filter
  const filteredReservations = reservations.filter((b) => {
    const q = search.toLowerCase();
    const guestName = b.guest?.fullName?.toLowerCase() || '';
    const roomNum = b.room?.roomNumber?.toString() || '';
    return guestName.includes(q) || roomNum.includes(q);
  });

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--hotel-navy)' }}>
            Reservations & Front Desk
          </h3>
          <p className="text-muted mb-0 small">
            Manage check-ins, room allocations, booking dates, and payment states
          </p>
        </div>
        <button 
          className="btn btn-luxury d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> New Reservation
        </button>
      </div>

      {/* Filter Bar */}
      <div className="luxury-card p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search reservation by guest name or room number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading reservations...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredReservations.length === 0 ? (
        <div className="luxury-card text-center py-5">
          <CalendarCheck size={48} className="text-muted mb-2 opacity-50" />
          <h5 className="fw-semibold">No Reservations Found</h5>
          <p className="text-muted small">Create your first booking to begin front desk operations.</p>
        </div>
      ) : (
        <div className="luxury-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase text-muted">
                  <th className="ps-4">Guest</th>
                  <th>Room Allocated</th>
                  <th>Duration (Dates)</th>
                  <th>Total Amount</th>
                  <th>Booking Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((b) => (
                  <tr key={b._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <User size={16} className="text-muted" />
                        <div>
                          <div className="fw-bold text-dark">{b.guest?.fullName || 'Walk-in Guest'}</div>
                          <div className="text-muted small" style={{ fontSize: '11px' }}>
                            {b.guest?.phone || b.guest?.email || 'No contact'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <BedDouble size={16} className="text-muted" />
                        <div>
                          <div className="fw-semibold">Room {b.room?.roomNumber || 'N/A'}</div>
                          <div className="text-muted small" style={{ fontSize: '11px' }}>
                            {b.room?.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        <div><strong>In:</strong> {new Date(b.checkInDate).toLocaleDateString()}</div>
                        <div><strong>Out:</strong> {new Date(b.checkOutDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td>
                      <span className="fw-bold fs-6 text-dark">${b.totalAmount || 0}</span>
                    </td>
                    <td>{getBookingBadge(b.status || b.bookingStatus)}</td>
                    <td>{getPaymentBadge(b.paymentStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold" style={{ color: 'var(--hotel-navy)' }}>
                  New Reservation
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* Guest Select */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Select Guest *</label>
                      <select 
                        className="form-select"
                        required
                        value={formData.guestId}
                        onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                      >
                        <option value="">-- Choose Guest --</option>
                        {guests.map((g) => (
                          <option key={g._id} value={g._id}>
                            {g.fullName} ({g.phone || g.idNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Room Select */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Select Room *</label>
                      <select 
                        className="form-select"
                        required
                        value={formData.roomId}
                        onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                      >
                        <option value="">-- Choose Room --</option>
                        {rooms.map((r) => (
                          <option key={r._id} value={r._id}>
                            Room {r.roomNumber} - {r.type} (${r.pricePerNight}/night) [{r.status}]
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Check In Date */}
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Check-In Date *</label>
                      <input 
                        type="date" 
                        className="form-control"
                        required
                        value={formData.checkInDate}
                        onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                      />
                    </div>

                    {/* Check Out Date */}
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Check-Out Date *</label>
                      <input 
                        type="date" 
                        className="form-control"
                        required
                        value={formData.checkOutDate}
                        onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                      />
                    </div>

                    {/* Calculated Total Display */}
                    <div className="col-12 bg-light p-3 rounded d-flex justify-content-between align-items-center">
                      <span className="fw-semibold text-muted small">Calculated Total:</span>
                      <span className="fs-5 fw-bold text-success">${calculatedTotal}</span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-luxury btn-sm"
                    disabled={submitting}
                  >
                    {submitting ? 'Confirming...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}