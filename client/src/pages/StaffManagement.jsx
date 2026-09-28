import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  Edit2,
  Power,
  Trash2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

const ROLES = ['Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Maintenance', 'Laundry', 'Kitchen'];

export default function StaffManagement() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Receptionist',
    phone: '',
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await API.get('/staff', { params });
      const data = res.data?.data || res.data || [];
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', password: '', role: 'Receptionist', phone: '' });
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      password: '',
      role: member.role,
      phone: member.phone || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStaff) {
        await API.put(`/staff/${editingStaff._id}`, {
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
        });
      } else {
        await API.post('/staff', formData);
      }
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (member) => {
    if (!window.confirm(`${member.isActive ? 'Deactivate' : 'Activate'} ${member.name}?`)) return;
    try {
      await API.put(`/staff/${member._id}/status`);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleResetPassword = async (member) => {
    const newPassword = window.prompt(`Enter new password for ${member.name} (min 6 characters):`);
    if (!newPassword) return;
    try {
      await API.put(`/staff/${member._id}/password`, { newPassword });
      alert('Password reset successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Permanently delete ${member.name}? This cannot be undone.`)) return;
    try {
      await API.delete(`/staff/${member._id}`);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete staff member');
    }
  };

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--hotel-navy)' }}>
            Staff Management
          </h3>
          <p className="text-muted mb-0 small">
            Manage staff accounts, roles, and access permissions
          </p>
        </div>
        <button
          className="btn btn-luxury d-flex align-items-center gap-2"
          onClick={openCreateModal}
        >
          <UserPlus size={16} /> Add Staff
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="luxury-card p-3 mb-4">
        <div className="row g-2">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search staff by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading staff accounts...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : staff.length === 0 ? (
        <div className="luxury-card text-center py-5">
          <Users size={48} className="text-muted mb-2 opacity-50" />
          <h5 className="fw-semibold">No Staff Found</h5>
          <p className="text-muted small">Add your first staff member using the button above.</p>
        </div>
      ) : (
        <div className="luxury-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase text-muted">
                  <th className="ps-4">Staff Member</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: '38px', height: '38px', backgroundColor: 'var(--hotel-navy)' }}
                        >
                          {member.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{member.name}</div>
                          <div className="text-muted small" style={{ fontSize: '11px' }}>
                            ID: {member._id?.slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small d-flex flex-column gap-1">
                        <span className="text-muted d-flex align-items-center gap-1">
                          <Mail size={13} /> {member.email}
                        </span>
                        <span className="text-dark d-flex align-items-center gap-1">
                          <Phone size={13} /> {member.phone || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        <ShieldCheck size={12} className="me-1 inline" />
                        {member.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${member.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-sm btn-outline-secondary me-1"
                        title="Edit"
                        onClick={() => openEditModal(member)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary me-1"
                        title="Reset Password"
                        onClick={() => handleResetPassword(member)}
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-warning me-1"
                        title="Toggle Status"
                        onClick={() => handleToggleStatus(member)}
                      >
                        <Power size={14} />
                      </button>
                      {isAdmin && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() => handleDelete(member)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold" style={{ color: 'var(--hotel-navy)' }}>
                  {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        disabled={!!editingStaff}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    {!editingStaff && (
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Password *</label>
                        <input
                          type="password"
                          className="form-control"
                          required
                          minLength={6}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Role *</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
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
                  <button type="submit" className="btn btn-luxury btn-sm" disabled={submitting}>
                    {submitting ? 'Saving...' : editingStaff ? 'Save Changes' : 'Create Staff'}
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
