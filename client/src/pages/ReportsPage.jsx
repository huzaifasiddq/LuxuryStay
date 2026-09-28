import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { BarChart3, Download, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export default function ReportsPage() {
  const [from, setFrom] = useState(daysAgoISO(29));
  const [to, setTo] = useState(todayISO());
  const [revenue, setRevenue] = useState(null);
  const [occupancy, setOccupancy] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = { from, to };
      const [revRes, occRes, forecastRes] = await Promise.all([
        API.get('/reports/revenue', { params }),
        API.get('/reports/occupancy', { params }),
        API.get('/reports/forecast'),
      ]);
      setRevenue(revRes.data);
      setOccupancy(occRes.data);
      setForecast(forecastRes.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async () => {
    try {
      const res = await API.get('/reports/revenue/export', {
        params: { from, to },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revenue-report-${from}-to-${to}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export report');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--hotel-navy)' }}>
            <BarChart3 size={24} /> Reports & Analytics
          </h3>
          <p className="text-muted mb-0 small">Revenue, occupancy trends & demand forecast</p>
        </div>
        <button className="btn btn-outline-dark d-flex align-items-center gap-2" onClick={handleExport}>
          <Download size={16} /> Export Revenue CSV
        </button>
      </div>

      <div className="luxury-card p-3 mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label small fw-semibold">From</label>
            <input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">To</label>
            <input type="date" className="form-control" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="col-md-4">
            <button className="btn btn-luxury w-100" onClick={fetchReports}>Apply Range</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading reports...</div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="luxury-card p-3 text-center">
                <div className="text-muted small">Total Revenue</div>
                <div className="fs-4 fw-bold" style={{ color: 'var(--hotel-navy)' }}>
                  {occupancy && revenue ? `${revenue.totalRevenue?.toLocaleString()}` : '—'}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="luxury-card p-3 text-center">
                <div className="text-muted small">Avg Occupancy</div>
                <div className="fs-4 fw-bold" style={{ color: 'var(--hotel-navy)' }}>
                  {occupancy?.avgOccupancy ?? '—'}%
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="luxury-card p-3 text-center">
                <div className="text-muted small">Forecast Avg Bookings/Day (next 7d)</div>
                <div className="fs-4 fw-bold" style={{ color: 'var(--hotel-navy)' }}>
                  {forecast?.avgBookingsPerDay ?? '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="luxury-card p-4 mb-4">
            <h6 className="fw-bold mb-3">Daily Revenue</h6>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenue?.daily || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="luxury-card p-4 mb-4">
            <h6 className="fw-bold mb-3">Daily Occupancy Rate (%)</h6>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={occupancy?.daily || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="occupancyRate" fill="#1e3a5f" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="luxury-card p-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <TrendingUp size={18} /> 7-Day Demand Forecast
            </h6>
            <p className="text-muted small mb-3">Basis: {forecast?.basis}</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={forecast?.forecast || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="projectedBookings" fill="#d4af37" name="Projected Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
