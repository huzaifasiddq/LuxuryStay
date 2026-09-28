import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import { 
  BedDouble, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Sparkles,
  Edit2,
  Trash2
} from 'lucide-react';

export default function Rooms() {
  const { user } = useAuth();
  const canAddRoom = ['Admin', 'Manager'].includes(user?.role); // add + edit details
  const canDeleteRoom = user?.role === 'Admin';
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const EMPTY_FORM = {
    roomNumber: '',
    roomType: 'Deluxe',
    pricePerNight: '',
    capacity: 2,
    floor: 1,
    status: 'Available',
    features: 'WiFi, TV, AC, Mini Bar',
  };
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await API.get('/rooms');
      const data = res.data?.data || res.data?.rooms || res.data || [];
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomType: room.roomType || 'Single',
      pricePerNight: room.pricePerNight,
      capacity: room.capacity || 2,
      floor: room.floor || 1,
      status: room.status || 'Available',
      features: Array.isArray(room.features) ? room.features.join(', ') : '',
    });
    setShowModal(true);
  };

  // Handle Create / Update Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        pricePerNight: Number(formData.pricePerNight),
        capacity: Number(formData.capacity),
        floor: Number(formData.floor),
        status: formData.status,
        features: String(formData.features || '')
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
      };

      if (editingRoom) {
        await API.put(`/rooms/${editingRoom._id}`, payload);
      } else {
        await API.post('/rooms', payload);
      }
      setShowModal(false);
      setEditingRoom(null);
      setFormData(EMPTY_FORM);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Delete Room ${room.roomNumber} permanently?`)) return;
    try {
      await API.delete(`/rooms/${room._id}`);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room');
    }
  };

  // Filtered rooms logic
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch = r.roomNumber?.toString().toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || r.roomType === typeFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><CheckCircle2 size={12} className="me-1 inline" />Available</span>;
      case 'occupied':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1"><Clock size={12} className="me-1 inline" />Occupied</span>;
      case 'maintenance':
      case 'cleaning':
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1"><Sparkles size={12} className="me-1 inline" />{status}</span>;
      default:
        return <span className="badge bg-secondary-subtle text-secondary px-2 py-1">{status || 'Unknown'}</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--hotel-navy)' }}>
            Room Management
          </h3>
          <p className="text-muted mb-0 small">
            Configure hotel inventory, pricing, and live room states
          </p>
        </div>
        {canAddRoom && (
        <button 
          className="btn btn-luxury d-flex align-items-center gap-2"
          onClick={openCreateModal}
        >
          <Plus size={16} /> Add New Room
        </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="luxury-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by Room Number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select 
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
              <option value="Executive Suite">Executive Suite</option>
              <option value="Presidential Suite">Presidential Suite</option>
            </select>
          </div>
          <div className="col-6 col-md-4">
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading hotel inventory...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredRooms.length === 0 ? (
        <div className="luxury-card text-center py-5">
          <BedDouble size={48} className="text-muted mb-2 opacity-50" />
          <h5 className="fw-semibold">No Rooms Found</h5>
          <p className="text-muted small">Add your first hotel room to initialize inventory.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredRooms.map((room) => (
            <div key={room._id || room.roomNumber} className="col-12 col-md-6 col-lg-4 col-xl-3">
              <div className="luxury-card p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fs-5 fw-bold" style={{ color: 'var(--hotel-navy)' }}>
                      Room {room.roomNumber}
                    </span>
                    {getStatusBadge(room.status)}
                  </div>
                  <div className="text-muted small mb-2">{room.roomType}{room.floor ? ` · Floor ${room.floor}` : ''}</div>
                  <div className="d-flex align-items-baseline gap-1 mb-3">
                    <span className="fs-4 fw-bold text-dark">${room.pricePerNight}</span>
                    <span className="text-muted small">/ night</span>
                  </div>
                </div>

                <div className="pt-2 border-top d-flex justify-content-between text-muted small">
                  <span>Capacity: {room.capacity || 2} Guests</span>
                  <span className="text-truncate ps-2" style={{ maxWidth: '140px' }}>
                    {Array.isArray(room.features) ? room.features.join(', ') : ''}
                  </span>
                </div>

                {(canAddRoom || canDeleteRoom) && (
                  <div className="d-flex gap-2 mt-3">
                    {canAddRoom && (
                      <button
                        className="btn btn-sm btn-outline-secondary flex-fill d-flex align-items-center justify-content-center gap-1"
                        onClick={() => openEditModal(room)}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    )}
                    {canDeleteRoom && (
                      <button
                        className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                        title="Delete room"
                        onClick={() => handleDelete(room)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold" style={{ color: 'var(--hotel-navy)' }}>
                  {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Room'}
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
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Room Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. 101"
                        required
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Room Type</label>
                      <select
                        className="form-select"
                        value={formData.roomType}
                        onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                      >
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Standard">Standard</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Suite">Suite</option>
                        <option value="Executive Suite">Executive Suite</option>
                        <option value="Presidential Suite">Presidential Suite</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Price per Night ($)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="150"
                        required
                        value={formData.pricePerNight}
                        onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Capacity (Guests)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        min="1"
                        max="10"
                        required
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Floor</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Amenities (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="WiFi, Balcony, King Bed, Mini Bar"
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
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
                    {submitting ? 'Saving...' : editingRoom ? 'Save Changes' : 'Create Room'}
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