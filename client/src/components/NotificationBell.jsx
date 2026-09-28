import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (n) => {
    try {
      if (!n.isRead) await API.put(`/notifications/${n._id}/read`);
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
    setOpen(false);
    if (n.link) navigate(n.link);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-light position-relative rounded-circle p-2"
        onClick={() => setOpen(!open)}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: '10px' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="position-absolute end-0 mt-2 bg-white rounded-3 shadow border"
          style={{ width: '340px', zIndex: 1050, maxHeight: '400px', overflowY: 'auto' }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <span className="fw-bold small">Notifications</span>
            {unreadCount > 0 && (
              <button className="btn btn-sm btn-link p-0 small" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="text-center text-muted small py-4">No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3 border-bottom small ${n.isRead ? '' : 'bg-light'}`}
                style={{ cursor: 'pointer' }}
              >
                <div className={n.isRead ? 'text-muted' : 'fw-semibold'}>{n.message}</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
