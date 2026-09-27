import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { 
  BedDouble, 
  Users, 
  CalendarCheck, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    cleaningRooms: 0,
    totalGuests: 0,
    activeBookings: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    pendingTasks: 0,
  });

  const [recentReservations, setRecentReservations] = useState([]);
  const [pendingTasksList, setPendingTasksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resRooms, resGuests, resBookings, resInvoices, resTasks] = await Promise.all([
        API.get('/rooms'),
        API.get('/guests'),
        API.get('/reservations'),
        API.get('/invoices'),
        API.get('/tasks'),
      ]);

      const rooms = resRooms.data?.data || resRooms.data?.rooms || resRooms.data || [];
      const guests = resGuests.data?.data || resGuests.data?.guests || resGuests.data || [];
      const bookings = resBookings.data?.data || resBookings.data?.reservations || resBookings.data || [];
      const invoices = resInvoices.data?.data || resInvoices.data?.invoices || resInvoices.data || [];
      const tasks = resTasks.data?.data || resTasks.data?.tasks || resTasks.data || [];

      // Calculate room metrics
      const availableRooms = rooms.filter((r) => r.status === 'Available').length;
      const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
      const cleaningRooms = rooms.filter((r) => r.status === 'Cleaning' || r.status === 'Maintenance').length;

      // Calculate active reservations (Confirmed or CheckedIn)
      const activeBookings = bookings.filter(
        (b) => b.status === 'Confirmed' || b.status === 'CheckedIn' || b.bookingStatus === 'Booked' || b.bookingStatus === 'Checked-In'
      ).length;

      // Calculate Revenue & Pending Bills
      const totalRevenue = invoices
        .filter((inv) => inv.paymentStatus === 'Paid')
        .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

      const pendingInvoices = invoices.filter((inv) => inv.paymentStatus !== 'Paid').length;

      // Pending Tasks
      const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;

      setStats({
        totalRooms: rooms.length,
        availableRooms,
        occupiedRooms,
        cleaningRooms,
        totalGuests: guests.length,
        activeBookings,
        totalRevenue,
        pendingInvoices,
        pendingTasks,
      });

      setRecentReservations(Array.isArray(bookings) ? bookings.slice(0, 5) : []);
      setPendingTasksList(Array.isArray(tasks) ? tasks.filter((t) => t.status !== 'Completed').slice(0, 4) : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const occupancyRate = stats.totalRooms > 0 
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) 
    : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--hotel-navy)' }}>
            Hospitality Executive Dashboard
          </h3>
          <p className="text-muted mb-0 small">
            Live operations overview, room occupancy rates, and revenue performance
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/reservations" className="btn btn-luxury d-flex align-items-center gap-2">
            <CalendarCheck size={16} /> New Booking
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Stats Cards */}
      <div className="row g-3 mb-4">
        {/* Total Revenue */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="luxury-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Settled Revenue</span>
                <h3 className="fw-bold my-1 text-dark">${stats.totalRevenue.toLocaleString()}</h3>
                <span className="text-success small fw-medium d-flex align-items-center gap-1">
                  <TrendingUp size={14} /> Total Paid Folios
                </span>
              </div>
              <div 
                className="rounded-3 p-2 text-white" 
                style={{ backgroundColor: 'var(--hotel-gold, #c5a880)' }}
              >
                <DollarSign size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Room Occupancy */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="luxury-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Room Occupancy</span>
                <h3 className="fw-bold my-1 text-dark">{occupancyRate}%</h3>
                <span className="text-muted small">
                  {stats.occupiedRooms} of {stats.totalRooms} rooms booked
                </span>
              </div>
              <div 
                className="rounded-3 p-2 text-white" 
                style={{ backgroundColor: 'var(--hotel-navy, #1e293b)' }}
              >
                <BedDouble size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Active Reservations */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="luxury-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Active Bookings</span>
                <h3 className="fw-bold my-1 text-dark">{stats.activeBookings}</h3>
                <span className="text-primary small fw-medium">
                  {stats.totalGuests} registered guests
                </span>
              </div>
              <div className="rounded-3 p-2 bg-primary text-white">
                <CalendarCheck size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Maintenance / Tasks */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="luxury-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Pending Tasks</span>
                <h3 className="fw-bold my-1 text-dark">{stats.pendingTasks}</h3>
                <span className="text-warning small fw-medium">
                  {stats.cleaningRooms} rooms being serviced
                </span>
              </div>
              <div className="rounded-3 p-2 bg-warning text-dark">
                <Sparkles size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Status Progress Bar Widget */}
      <div className="luxury-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0 text-dark">Room Inventory Allocation</h6>
          <span className="text-muted small">Total: {stats.totalRooms} Inventory Units</span>
        </div>
        <div className="progress" style={{ height: '14px', borderRadius: '8px' }}>
          <div 
            className="progress-bar bg-success" 
            style={{ width: `${stats.totalRooms ? (stats.availableRooms / stats.totalRooms) * 100 : 0}%` }}
            title={`Available: ${stats.availableRooms}`}
          />
          <div 
            className="progress-bar bg-primary" 
            style={{ width: `${stats.totalRooms ? (stats.occupiedRooms / stats.totalRooms) * 100 : 0}%` }}
            title={`Occupied: ${stats.occupiedRooms}`}
          />
          <div 
            className="progress-bar bg-warning" 
            style={{ width: `${stats.totalRooms ? (stats.cleaningRooms / stats.totalRooms) * 100 : 0}%` }}
            title={`Cleaning / Maintenance: ${stats.cleaningRooms}`}
          />
        </div>
        <div className="d-flex flex-wrap gap-4 mt-3 small">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success rounded-circle p-1" />
            <span>Available ({stats.availableRooms})</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary rounded-circle p-1" />
            <span>Occupied ({stats.occupiedRooms})</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-warning rounded-circle p-1" />
            <span>Maintenance / Cleaning ({stats.cleaningRooms})</span>
          </div>
        </div>
      </div>

      {/* Bottom Grids: Recent Reservations + Urgent Tasks */}
      <div className="row g-4">
        {/* Recent Reservations */}
        <div className="col-12 col-lg-8">
          <div className="luxury-card h-100 overflow-hidden">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark">Recent Bookings & Check-ins</h6>
              <Link to="/reservations" className="small text-decoration-none fw-semibold d-flex align-items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            {recentReservations.length === 0 ? (
              <div className="p-4 text-center text-muted small">No recent bookings found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-muted">
                    <tr>
                      <th className="ps-3">Guest</th>
                      <th>Room</th>
                      <th>Check-in</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {recentReservations.map((res) => (
                      <tr key={res._id}>
                        <td className="ps-3 fw-semibold">{res.guest?.fullName || 'Guest'}</td>
                        <td>Room {res.room?.roomNumber || 'N/A'}</td>
                        <td>{new Date(res.checkInDate).toLocaleDateString()}</td>
                        <td className="fw-bold">${res.totalAmount}</td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {res.status || res.bookingStatus || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pending Housekeeping Tasks */}
        <div className="col-12 col-lg-4">
          <div className="luxury-card h-100 p-3">
            <div className="border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark">Housekeeping Queue</h6>
              <Link to="/tasks" className="small text-decoration-none fw-semibold d-flex align-items-center gap-1">
                All Tasks <ArrowRight size={14} />
              </Link>
            </div>
            {pendingTasksList.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <CheckCircle2 size={32} className="text-success mb-2 opacity-50" />
                <div>All tasks completed!</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {pendingTasksList.map((t) => (
                  <div key={t._id} className="p-2 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-start">
                      <span className="fw-semibold small text-dark">{t.title}</span>
                      <span className={`badge ${t.priority === 'Urgent' ? 'bg-danger' : t.priority === 'High' ? 'bg-warning text-dark' : 'bg-secondary'} small`} style={{ fontSize: '10px' }}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="text-muted small mt-1" style={{ fontSize: '11px' }}>
                      Room {t.room?.roomNumber || 'N/A'} • {t.taskType}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}