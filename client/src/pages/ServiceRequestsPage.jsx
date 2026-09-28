import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Bell, Plus, Car, Coffee, Clock } from 'lucide-react';

const SERVICE_ICONS = {
  RoomService: Coffee,
  WakeUpCall: Clock,
  Transportation: Car,
  Housekeeping: Bell,
  Other: Bell,
};

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ guestId: '', serviceType: 'RoomService', details: '', requestedTime: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const [reqRes, guestsRes] = await Promise.all([
        API.get('/service-requests', { params }),
        API.get('/guests'),
      ]);
      setRequests(reqRes.data?.data || reqRes.data || []);
      const guestsData = guestsRes.data?.data || guestsRes.data || [];
      setGuests(Array.isArray(guestsData) ? guestsData : []);
    } catch (err) {
      console.error('Failed to load service requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.guestId) return alert('Please select a guest');
    try {
      await API.post('/service-requests', form);
      setShowModal(false);
      setForm({ guestId: '', serviceType: 'RoomService', details: '', requestedTime: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log request');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/service-requests/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const statusBadge = (status) => {
    const map = {
      Pending: 'bg-warning-subtle text-warning',
      'In Progress': 'bg-info-subtle text-info',
      Completed: 'bg-success-subtle text-success',
      Cancelled: 'bg-danger-subtle text-danger',
    };
    return map[status] || 'bg-secondary-subtle text-secondary';
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--hotel-navy)' }}>Guest Service Requests</h3>
          <p className="text-muted mb-0 small">Room service, wake-up calls, transportation & more</p>
        </div>
        <button className="btn btn-luxury d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Request
        </button>
      </div>

      <div className="luxury-card p-3 mb-4">
        <select className="form-select" style={{ maxWidth: 220 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="luxury-card text-center py-5">
          <Bell size={48} className="text-muted mb-2 opacity-50" />
          <h5 className="fw-semibold">No Service Requests</h5>
        </div>
      ) : (
        <div className="row g-3">
          {requests.map((r) => {
            const Icon = SERVICE_ICONS[r.serviceType] || Bell;
            return (
              <div key={r._id} className="col-md-6 col-lg-4">
                <div className="luxury-card p-3 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <Icon size={18} style={{ color: 'var(--hotel-gold)' }} />
                      <span className="fw-bold">{r.serviceType}</span>
                    </div>
                    <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span>
                  </div>
                  <div className="small text-muted mb-1">{r.guest?.fullName || 'Guest'} {r.room?.roomNumber ? `· Room ${r.room.roomNumber}` : ''}</div>
                  {r.details && <p className="small mb-2">{r.details}</p>}
                  {r.requestedTime && (
                    <div className="small text-muted mb-2">
                      Requested for: {new Date(r.requestedTime).toLocaleString()}
                    </div>
                  )}
                  <select
                    className="form-select form-select-sm"
                    value={r.status}
                    onChange={(e) => handleStatusChange(r._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold" style={{ color: 'var(--hotel-navy)' }}>New Service Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Guest *</label>
                    <select className="form-select" required value={form.guestId} onChange={(e) => setForm({ ...form, guestId: e.target.value })}>
                      <option value="">-- Choose Guest --</option>
                      {guests.map((g) => (
                        <option key={g._id} value={g._id}>{g.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Service Type *</label>
                    <select className="form-select" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
                      <option value="RoomService">Room Service</option>
                      <option value="WakeUpCall">Wake-up Call</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Requested Time</label>
                    <input type="datetime-local" className="form-control" value={form.requestedTime} onChange={(e) => setForm({ ...form, requestedTime: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Details</label>
                    <textarea className="form-control" rows={2} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-luxury btn-sm">Log Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
