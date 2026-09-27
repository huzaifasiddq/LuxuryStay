import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Hotel, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
        <div className="luxury-card p-4 p-sm-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-circle bg-warning bg-opacity-10 text-warning mb-2">
              <Hotel size={32} color="var(--hotel-gold)" />
            </div>
            <h4 className="fw-bold" style={{ color: 'var(--hotel-navy)' }}>
              LuxuryStay Portal
            </h4>
            <p className="text-muted small">Enter your staff credentials to continue</p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center py-2 px-3 small rounded-3 mb-3">
              <AlertCircle size={16} className="me-2 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Mail size={16} className="text-muted" />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="admin@luxurystay.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Lock size={16} className="text-muted" />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-luxury w-100 py-2"
              disabled={submitting}
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}