import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { 
  LayoutDashboard, 
  BedDouble, 
  Users, 
  CalendarCheck, 
  Receipt, 
  CheckSquare, 
  LogOut, 
  Hotel,
  ShieldCheck,
  UserCog,
  Settings as SettingsIcon,
  MessageSquare,
  Bell as BellIcon,
  BarChart3
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { FRONT_OFFICE, MANAGEMENT, isOperational } from '../utils/roles';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Sidebar is built per role so each department only sees what it needs
  const ALL_NAV = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: FRONT_OFFICE },
    { name: 'Rooms', path: '/rooms', icon: BedDouble, roles: null }, // everyone (view-only for departments)
    { name: 'Guests', path: '/guests', icon: Users, roles: FRONT_OFFICE },
    { name: 'Reservations', path: '/reservations', icon: CalendarCheck, roles: FRONT_OFFICE },
    { name: 'Invoices', path: '/invoices', icon: Receipt, roles: FRONT_OFFICE },
    { name: isOperational(user?.role) ? 'My Tasks' : 'Tasks', path: '/tasks', icon: CheckSquare, roles: null },
    { name: 'Service Requests', path: '/service-requests', icon: BellIcon, roles: [...FRONT_OFFICE, 'Housekeeping', 'Kitchen', 'Laundry'] },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare, roles: FRONT_OFFICE },
    { name: 'Staff', path: '/staff', icon: UserCog, roles: MANAGEMENT },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: MANAGEMENT },
    { name: 'Settings', path: '/settings', icon: SettingsIcon, roles: ['Admin'] },
  ];

  const navItems = ALL_NAV.filter((item) => !item.roles || item.roles.includes(user?.role));

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <aside 
        className="d-flex flex-column flex-shrink-0 p-3 text-white" 
        style={{ width: '260px', backgroundColor: 'var(--hotel-navy)' }}
      >
        {/* Brand Header */}
        <div className="d-flex align-items-center mb-4 ps-2 text-decoration-none text-white">
          <div className="p-2 rounded-3 me-2" style={{ backgroundColor: 'rgba(217, 119, 6, 0.2)' }}>
            <Hotel size={24} color="var(--hotel-gold)" />
          </div>
          <div>
            <div className="fw-bold fs-5 tracking-wide">LuxuryStay</div>
            <div className="text-muted" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              MANAGEMENT SYSTEM
            </div>
          </div>
        </div>

        <hr className="border-secondary opacity-25 my-1" />

        {/* Navigation Links */}
        <ul className="nav nav-pills flex-column mb-auto mt-3 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 ${
                      isActive 
                        ? 'bg-warning text-dark fw-semibold' 
                        : 'text-white-50 hover-light'
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? 'var(--hotel-gold)' : 'transparent',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    transition: 'all 0.2s ease',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        <hr className="border-secondary opacity-25" />

        {/* User Card & Logout */}
        <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-dark bg-opacity-25">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: '36px', height: '36px', backgroundColor: 'var(--hotel-navy-light)' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-truncate">
              <div className="text-white small fw-semibold text-truncate">{user?.name}</div>
              <div className="text-white-50" style={{ fontSize: '11px' }}>
                <ShieldCheck size={12} className="me-1 text-warning inline" />
                {user?.role}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="btn btn-sm btn-link text-white-50 p-1 hover-danger"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="d-flex flex-column flex-grow-1 overflow-auto">
        <header className="navbar navbar-expand bg-white border-bottom px-4 py-3 sticky-top">
          <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 fw-bold" style={{ color: 'var(--hotel-navy)' }}>
                Staff Portal
              </h5>
              <div className="text-muted small">
                Connected as: <strong className="text-dark">{user?.email}</strong>
              </div>
            </div>
            <NotificationBell />
          </div>
        </header>

        <main className="p-4 flex-grow-1">
          {children}
        </main>
      </div>
    </div>
  );
}