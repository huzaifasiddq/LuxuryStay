import Task from '../models/Task.mjs';
import Room from '../models/Room.mjs';
import { notifyRole } from './notificationController.mjs';

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks
// @access  Private (Admin, Manager, Housekeeping, Maintenance)
export const getTasks = async (req, res) => {
  try {
    const { status, taskType, priority, assignedTo } = req.query;
    const filter = {};

    const OPERATIONAL_ROLES = ['Housekeeping', 'Maintenance', 'Laundry', 'Kitchen'];

    if (OPERATIONAL_ROLES.includes(req.user.role)) {
      // Department staff only see tasks matching their own department,
      // and only ones assigned to them or not yet assigned to anyone.
      filter.taskType = req.user.role;
      filter.$or = [{ assignedTo: req.user._id }, { assignedTo: null }];
    } else {
      // Admin / Manager / Receptionist see everything, with optional filters
      if (taskType) filter.taskType = taskType;
      if (assignedTo) filter.assignedTo = assignedTo;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('room', 'roomNumber roomType status floor')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('room')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task details:', error.message);
    res.status(500).json({ message: 'Server error fetching task details' });
  }
};

// @desc    Create and assign a task
// @route   POST /api/tasks
// @access  Private (Admin, Manager, Receptionist)
export const createTask = async (req, res) => {
  try {
    const { title, description, room, assignedTo, taskType, priority, dueDate } = req.body;

    if (!title || !room) {
      return res.status(400).json({ message: 'Title and room ID are required' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      room,
      assignedTo: assignedTo || null,
      assignedBy: req.user?._id || null,
      taskType: taskType || 'Housekeeping',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      status: 'Pending',
    });

    await notifyRole(
      task.taskType === 'Maintenance' ? 'Maintenance' : 'Housekeeping',
      `New ${task.taskType} task: ${task.title}`,
      'Maintenance',
      '/tasks'
    );

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error.message);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

// @desc    Update task status & sync room state
// @route   PATCH /api/tasks/:id/status
// @access  Private (Admin, Manager, Housekeeping, Maintenance)
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const updateFields = { status };
    if (status === 'Completed') {
      updateFields.completedAt = new Date();
    }

    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Department staff may only update tasks in their own department, and
    // only if it's assigned to them or still unassigned.
    const OPERATIONAL_ROLES = ['Housekeeping', 'Maintenance', 'Laundry', 'Kitchen'];
    if (OPERATIONAL_ROLES.includes(req.user.role)) {
      const isOwnDepartment = existingTask.taskType === req.user.role;
      const isOwnOrUnassigned =
        !existingTask.assignedTo || String(existingTask.assignedTo) === String(req.user._id);

      if (!isOwnDepartment || !isOwnOrUnassigned) {
        return res.status(403).json({ message: 'You can only update tasks assigned to your department' });
      }

      // Claim the task on first interaction if it was unassigned
      if (!existingTask.assignedTo) {
        updateFields.assignedTo = req.user._id;
      }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: false,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Auto-release room back to Available upon task completion
    if (status === 'Completed' && task.room) {
      await Room.findByIdAndUpdate(task.room, { status: 'Available' });
    }

    res.json({ message: `Task status updated to ${status}`, task });
  } catch (error) {
    console.error('Error updating task status:', error.message);
    res.status(500).json({ message: 'Server error updating task status' });
  }
};