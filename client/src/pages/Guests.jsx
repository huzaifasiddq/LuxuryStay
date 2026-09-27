import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  CreditCard, 
  MapPin,
  Globe
} from 'lucide-react';

export default function Guests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal State synced with Backend Schema
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    idType: 'CNIC',
    idNumber: '',
    country: 'Pakistan',
    address: '',
    specialPreferences: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch Guests
  const fetchGuests = async () => {
    try {
      setLoading(true);
      const res = await API.get('/guests');
      const data = res.data?.data || res.data?.guests || res.data || [];
      setGuests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  // Create Guest
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/guests', formData);
      setShowModal(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        idType: 'CNIC',
        idNumber: '',
        country: 'Pakistan',
        address: '',
        specialPreferences: '',
      });
      fetchGuests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register guest');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGuests = guests.filter((g) => {
    const q = search.toLowerCase();
    return (
      g.fullName?.toLowerCase().includes(q) ||
      g.email?.toLowerCase().includes(q) ||
      g.phone?.toLowerCase().includes(q) ||
      g.idNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--hotel-navy)' }}>
            Guests Directory
          </h3>
          <p className="text-muted mb-0 small">
            Maintain customer identities, contact numbers, and identification records
          </p>
        </div>
        <button 
          className="btn btn-luxury d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <UserPlus size={16} /> Register Guest
        </button>
      </div>

      {/* Search Bar */}
      <div className="luxury-card p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search guest by name, phone, email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Guest Table */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading guest profiles...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredGuests.length === 0 ? (
        <div className="luxury-card text-center py-5">
          <Users size={48} className="text-muted mb-2 opacity-50" />
          <h5 className="fw-semibold">No Guests Found</h5>
          <p className="text-muted small">Register your first guest using the button above.</p>
        </div>
      ) : (
        <div className="luxury-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase text-muted">
                  <th className="ps-4">Guest Details</th>
                  <th>Contact Info</th>
                  <th>Identity Doc</th>
                  <th>Origin / Address</th>
                  <th>Preferences</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr key={guest._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: '38px', height: '38px', backgroundColor: 'var(--hotel-navy)' }}
                        >
                          {guest.fullName?.charAt(0).toUpperCase() || 'G'}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{guest.fullName}</div>
                          <div className="text-muted small" style={{ fontSize: '11px' }}>
                            ID: {guest._id?.slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small d-flex flex-column gap-1">
                        <span className="text-muted d-flex align-items-center gap-1">
                          <Mail size={13} /> {guest.email || 'N/A'}
                        </span>
                        <span className="text-dark d-flex align-items-center gap-1">
                          <Phone size={13} /> {guest.phone || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        <CreditCard size={12} className="me-1 inline" />
                        {guest.idType}: {guest.idNumber}
                      </span>
                    </td>
                    <td className="text-muted small">
                      <div className="d-flex flex-column">
                        <span className="text-dark d-flex align-items-center gap-1">
                          <Globe size={13} /> {guest.country || 'Pakistan'}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <MapPin size={13} /> {guest.address || '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary small">
                        {guest.specialPreferences || 'None'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Guest Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold" style={{ color: 'var(--hotel-navy)' }}>
                  Register New Guest
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
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Full Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Muhammad Usman"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Email Address *</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        placeholder="usman.corp@gmail.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Phone Number *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="+923219876543"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Identity Document *</label>
                      <select 
                        className="form-select"
                        value={formData.idType}
                        onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                      >
                        <option value="CNIC">CNIC</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">ID / Number *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="42101-5678912-3"
                        required
                        value={formData.idNumber}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Country</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Pakistan"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Special Preferences</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Non-smoking room"
                        value={formData.specialPreferences}
                        onChange={(e) => setFormData({ ...formData, specialPreferences: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Address</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Clifton Block 4, Karachi"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
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
                    {submitting ? 'Registering...' : 'Save Guest'}
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