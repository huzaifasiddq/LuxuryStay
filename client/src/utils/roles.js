// Central role helpers shared by routing, sidebar and pages

export const OPERATIONAL_ROLES = ['Housekeeping', 'Maintenance', 'Laundry', 'Kitchen'];
export const FRONT_OFFICE = ['Admin', 'Manager', 'Receptionist'];
export const MANAGEMENT = ['Admin', 'Manager'];

// Where each role lands after login / when hitting a page they can't access
export const getDefaultRoute = (role) =>
  OPERATIONAL_ROLES.includes(role) ? '/tasks' : '/dashboard';

export const isOperational = (role) => OPERATIONAL_ROLES.includes(role);
export const canManageBookings = (role) => FRONT_OFFICE.includes(role);
