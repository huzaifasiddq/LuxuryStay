import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function SettingsPage() {
  const [form, setForm] = useState({
    hotelName: '',
    contactEmail: '',
    contactPhone: '',
    currency: 'PKR',
    taxRate: 0.16,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    lateCheckoutFee: 0,
    cancellationPolicy: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/settings');
      setForm(res.data);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await API.put('/settings', form);
      setForm(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading settings...</div>;

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--hotel-navy)' }}>
          <SettingsIcon size={24} /> System Settings
        </h3>
        <p className="text-muted mb-0 small">
          Central configuration used across billing, bookings and policies
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="luxury-card p-4 mb-4">
          <h6 className="fw-bold mb-3">Hotel Information</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Hotel Name</label>
              <input className="form-control" value={form.hotelName} onChange={(e) => setForm({ ...form, hotelName: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Contact Email</label>
              <input type="email" className="form-control" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Contact Phone</label>
              <input className="form-control" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="luxury-card p-4 mb-4">
          <h6 className="fw-bold mb-3">Billing & Currency</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Currency Code</label>
              <input className="form-control" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Tax Rate (decimal, e.g. 0.16 = 16%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                className="form-control"
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
              />
              <div className="form-text">Used as the default tax rate on new invoices</div>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Late Checkout Fee</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.lateCheckoutFee}
                onChange={(e) => setForm({ ...form, lateCheckoutFee: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="luxury-card p-4 mb-4">
          <h6 className="fw-bold mb-3">Check-in / Check-out Policy</h6>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Check-in Time</label>
              <input type="time" className="form-control" value={form.checkInTime} onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Check-out Time</label>
              <input type="time" className="form-control" value={form.checkOutTime} onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Cancellation Policy</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.cancellationPolicy}
                onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button type="submit" className="btn btn-luxury d-flex align-items-center gap-2" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && <span className="text-success small fw-semibold">Saved successfully</span>}
        </div>
      </form>
    </div>
  );
}
