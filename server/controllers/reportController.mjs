import Invoice from '../models/Invoice.mjs';
import Reservation from '../models/Reservation.mjs';
import Room from '../models/Room.mjs';

const parseDateRange = (req) => {
  const { from, to } = req.query;
  const start = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 29));
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Revenue report — daily revenue totals within a date range
// @route   GET /api/reports/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD
// @access  Private (Admin, Manager)
export const getRevenueReport = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req);

    const invoices = await Invoice.find({
      createdAt: { $gte: start, $lte: end },
      paymentStatus: 'Paid',
    }).sort({ createdAt: 1 });

    // Group by day
    const dailyMap = {};
    invoices.forEach((inv) => {
      const day = inv.createdAt.toISOString().slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + inv.totalAmount;
    });

    const daily = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }));
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    res.json({
      range: { from: start, to: end },
      totalRevenue,
      invoiceCount: invoices.length,
      daily,
    });
  } catch (error) {
    console.error('Error generating revenue report:', error.message);
    res.status(500).json({ message: 'Server error generating revenue report' });
  }
};

// @desc    Occupancy report — daily occupancy % within a date range
// @route   GET /api/reports/occupancy?from=YYYY-MM-DD&to=YYYY-MM-DD
// @access  Private (Admin, Manager)
export const getOccupancyReport = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req);
    const totalRooms = await Room.countDocuments();

    const reservations = await Reservation.find({
      status: { $in: ['Confirmed', 'CheckedIn', 'CheckedOut'] },
      checkInDate: { $lte: end },
      checkOutDate: { $gte: start },
    });

    // Build day-by-day occupancy count
    const daily = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const dayStart = new Date(cursor);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(cursor);
      dayEnd.setHours(23, 59, 59, 999);

      const occupiedCount = reservations.filter(
        (r) => r.checkInDate <= dayEnd && r.checkOutDate >= dayStart
      ).length;

      daily.push({
        date: dayStart.toISOString().slice(0, 10),
        occupiedRooms: occupiedCount,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    const avgOccupancy =
      daily.length > 0 ? Math.round(daily.reduce((s, d) => s + d.occupancyRate, 0) / daily.length) : 0;

    res.json({ range: { from: start, to: end }, totalRooms, avgOccupancy, daily });
  } catch (error) {
    console.error('Error generating occupancy report:', error.message);
    res.status(500).json({ message: 'Server error generating occupancy report' });
  }
};

// @desc    Simple demand forecast — projects next 7 days' bookings using a
//          moving-average of the last 30 days of new reservations. This is a
//          lightweight heuristic (not a full ML model) intended to give
//          management a directional signal, per the "forecast demand" NFR.
// @route   GET /api/reports/forecast
// @access  Private (Admin, Manager)
export const getDemandForecast = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentReservations = await Reservation.find({
      createdAt: { $gte: thirtyDaysAgo },
      status: { $in: ['Confirmed', 'CheckedIn', 'CheckedOut'] },
    });

    const dailyCounts = {};
    recentReservations.forEach((r) => {
      const day = r.createdAt.toISOString().slice(0, 10);
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    const counts = Object.values(dailyCounts);
    const avgPerDay = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / 30 : 0;

    const forecast = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString().slice(0, 10),
        projectedBookings: Math.round(avgPerDay),
      });
    }

    res.json({
      basis: '30-day moving average of new reservations',
      avgBookingsPerDay: Math.round(avgPerDay * 10) / 10,
      forecast,
    });
  } catch (error) {
    console.error('Error generating demand forecast:', error.message);
    res.status(500).json({ message: 'Server error generating demand forecast' });
  }
};

// @desc    Export revenue report as CSV
// @route   GET /api/reports/revenue/export?from=&to=
// @access  Private (Admin, Manager)
export const exportRevenueCsv = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req);

    const invoices = await Invoice.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate('guest', 'fullName')
      .sort({ createdAt: 1 });

    const header = 'Invoice Number,Guest,Date,Room Charges,Tax,Total,Payment Status\n';
    const rows = invoices
      .map((inv) =>
        [
          inv.invoiceNumber,
          inv.guest?.fullName || 'N/A',
          inv.createdAt.toISOString().slice(0, 10),
          inv.roomCharges,
          inv.taxAmount,
          inv.totalAmount,
          inv.paymentStatus,
        ].join(',')
      )
      .join('\n');

    const csv = header + rows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting revenue CSV:', error.message);
    res.status(500).json({ message: 'Server error exporting report' });
  }
};
