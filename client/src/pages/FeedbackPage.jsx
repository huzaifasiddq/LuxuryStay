import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Star, MessageSquare, Plus } from 'lucide-react';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [form, setForm] = useState({ guestId: '', rating: 5, comment: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fbRes, guestsRes] = await Promise.all([API.get('/feedback'), API.get('/guests')]);
      setFeedback(fbRes.data?.data || fbRes.data || []);
      const guestsData = guestsRes.data?.data || guestsRes.data || [];
      setGuests(Array.isArray(guestsData) ? guestsData : []);
    } catch (err) {
      console.error('Failed to load feedback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.guestId) return alert('Please select a guest');
    try {
      await API.post('/feedback', form);
      setShowModal(false);
      setForm({ guestId: '', rating: 5, comment: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log feedback');
    }
  };

  const handleRespond = async (id) => {
    try {
      await API.put(`/feedback/${id}/respond`, { response: responseText });
      setRespondingTo(null);
      setResponseText('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save response');
    }
  };

  const renderStars = (n) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={14} fill={i < n ? '#d4af37' : 'none'} color={i < n ? '#d4af37' : '#ccc'} />
    ));

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--hotel-navy)' }}>Guest Feedback</h3>
          <p className="text-muted mb-0 small">Reviews and ratings logged by the front desk</p>
        </div>
        <button className="btn btn-luxury d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Log Feedback
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading feedback...</div>
      ) : feedback.length === 0 ? (
        <div className="luxury-card text-center py-5">
          <MessageSquare size={48} className="text-muted mb-2 opacity-50" />
          <h5 className="fw-semibold">No Feedback Yet</h5>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {feedback.map((f) => (
            <div key={f._id} className="luxury-card p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-bold">{f.guest?.fullName || 'Guest'}</div>
                  <div className="d-flex gap-1 my-1">{renderStars(f.rating)}</div>
                  <p className="mb-1 small">{f.comment}</p>
                </div>
                <span className="text-muted small">{new Date(f.createdAt).toLocaleDateString()}</span>
              </div>

              {f.response ? (
                <div className="bg-light rounded p-2 mt-2 small">
                  <strong>Staff response:</strong> {f.response}
                </div>
              ) : respondingTo === f._id ? (
                <div className="mt-2 d-flex gap-2">
                  <input
                    className="form-control form-control-sm"
                    placeholder="Write a response..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                  <button className="btn btn-sm btn-luxury" onClick={() => handleRespond(f._id)}>Send</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setRespondingTo(null)}>Cancel</button>
                </div>
              ) : (
                <button className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setRespondingTo(f._id)}>
                  Respond
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold" style={{ color: 'var(--hotel-navy)' }}>Log Guest Feedback</h5>
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
                    <label className="form-label small fw-semibold">Rating</label>
                    <select className="form-select" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Comment</label>
                    <textarea className="form-control" rows={3} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-luxury btn-sm">Save Feedback</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
