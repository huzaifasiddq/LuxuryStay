import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  Calendar, 
  BedDouble,
  ShieldCheck,
  Play
} from 'lucide-react';

export default function Housekeeping() {
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  // Modal State strictly aligned with Task.mjs
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    room: '',
    taskType: 'Housekeeping',
    priority: 'Medium',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch Tasks & Rooms
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTasks, resRooms] = await Promise.all([
        API.get('/tasks'),
        API.get('/rooms'),
      ]);

      const tData = resTasks.data?.data || resTasks.data?.tasks || resTasks.data || [];
      const rData = resRooms.data?.data || resRooms.data?.rooms || resRooms.data || [];

      setTasks(Array.isArray(tData) ? tData : []);
      setRooms(Array.isArray(rData) ? rData : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create Task
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.room) {
      alert('Task title aur Room select karna lazmi hai');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/tasks', {
        title: formData.title,
        description: formData.description,
        room: formData.room,
        taskType: formData.taskType,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
      });

      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        room: '',
        taskType: 'Housekeeping',
        priority: 'Medium',
        dueDate: '',
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Task create karne mein masla hua');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Status Update via PATCH /api/tasks/:id/status
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update fail ho gaya');
    }
  };

  // Badges & styling
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="badge bg-danger text-white px-2 py-1"><AlertTriangle size={12} className="me-1 inline" />Urgent</span>;
      case 'High':
        return <span className="badge bg-warning text-dark px-2 py-1">High</span>;
      case 'Medium':
        return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">Medium</span>;
      default:
        return <span className="badge bg-secondary-subtle text-secondary px-2 py-1">Low</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><CheckCircle size={12} className="me-1 inline" />Completed</span>;
      case 'In Progress':
        return <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1"><Clock size={12} className="me-1 inline" />In Progress</span>;
      default:
        return <span className="badge bg-secondary-subtle text-muted px-2 py-1">Pending</span>;
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter((t) => {
    const q = search.toLowerCase();
    const titleMatch = t.title?.toLowerCase().includes(q);
    const roomMatch = t.room?.roomNumber?.toString().includes(q);
    const matchesSearch = titleMatch || roomMatch;

    const matchesType = filterType === 'All' || t.taskType === filterType;
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;

    return matchesSearch && matchesType && matchesPriority;
  });

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--hotel-navy)' }}>
            Housekeeping & Maintenance
          </h3>
          <p className="text-muted mb-0 small">
            Assign room cleanings, inspections, maintenance tickets, and track room readiness
          </p>
        </div>
        <button 
          className="btn btn-luxury d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filter Row */}
      <div className="luxury-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search task or room number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select 
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Task Types</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Maintenance">Maintenance</option>
              <option value="RoomService">Room Service</option>
              <option value="Inspection">Inspection</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select 
              className="form-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading housekeeping tasks...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredTasks.length === 0 ? (
        <div className="luxury-card text-center py-5">
          <Sparkles size={48} className="text-muted mb-2 opacity-50" />
          <h5 className="fw-semibold">No Tasks Found</h5>
          <p className="text-muted small">All rooms are in order. Create a task when a room requires servicing.</p>
        </div>
      ) : (
        <div className="luxury-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase text-muted">
                  <th className="ps-4">Task Details</th>
                  <th>Room</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task._id}>
                    <td className="ps-4">
                      <div>
                        <span className="fw-bold text-dark">{task.title}</span>
                        {task.description && (
                          <div className="text-muted small text-truncate" style={{ maxWidth: '240px' }}>
                            {task.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <BedDouble size={16} className="text-muted" />
                        <span className="fw-semibold">
                          Room {task.room?.roomNumber || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {task.taskType}
                      </span>
                    </td>
                    <td>{getPriorityBadge(task.priority)}</td>
                    <td>
                      <span className="small text-muted d-flex align-items-center gap-1">
                        <Calendar size={13} />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Today'}
                      </span>
                    </td>
                    <td>{getStatusBadge(task.status)}</td>
                    <td className="text-end pe-4">
                      <div className="d-inline-flex gap-2">
                        {task.status === 'Pending' && (
                          <button
                            className="btn btn-outline-info btn-sm d-inline-flex align-items-center gap-1"
                            onClick={() => handleUpdateStatus(task._id, 'In Progress')}
                            title="Start Task"
                          >
                            <Play size={13} /> Start
                          </button>
                        )}
                        {task.status !== 'Completed' && (
                          <button
                            className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-1"
                            onClick={() => handleUpdateStatus(task._id, 'Completed')}
                            title="Complete & Release Room"
                          >
                            <ShieldCheck size={13} /> Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold" style={{ color: 'var(--hotel-navy)' }}>
                  Assign Housekeeping / Maintenance Task
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
                    {/* Task Title */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Task Title *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Deep Clean & Linen Refresh"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    {/* Room Select */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Target Room *</label>
                      <select 
                        className="form-select"
                        required
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      >
                        <option value="">-- Select Room --</option>
                        {rooms.map((r) => (
                          <option key={r._id} value={r._id}>
                            Room {r.roomNumber} ({r.type}) — Status: [{r.status}]
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category / Task Type */}
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Task Category</label>
                      <select 
                        className="form-select"
                        value={formData.taskType}
                        onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                      >
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="RoomService">Room Service</option>
                        <option value="Inspection">Inspection</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Priority Level</label>
                      <select 
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    {/* Due Date */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Due Date</label>
                      <input 
                        type="date" 
                        className="form-control"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Instructions / Notes</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        placeholder="Add specific instructions for housekeeping staff..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    {submitting ? 'Assigning...' : 'Assign Task'}
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