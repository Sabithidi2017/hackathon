const express = require('express');
const { Op } = require('sequelize');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, manager } = require('../middleware/auth');

const router = express.Router();

// Helper function to determine status based on check-in time
const determineStatus = (checkInTime) => {
  if (!checkInTime) return 'not-checked-in';
  const hour = checkInTime.getHours();
  const minute = checkInTime.getMinutes();
  const totalMinutes = hour * 60 + minute;
  // Late after 9:15 AM (555 minutes)
  if (totalMinutes > 555) return 'late';
  return 'present';
};

// ==================== EMPLOYEE ROUTES ====================

// POST /api/attendance/checkin - Check in
router.post('/checkin', auth, async (req, res) => {
  try {
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      where: {
        userId: req.user.id,
        date: todayDate
      }
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInTime = new Date();
    
    if (existingAttendance) {
      // Update existing record
      existingAttendance.checkInTime = checkInTime;
      existingAttendance.status = determineStatus(checkInTime);
      await existingAttendance.save();
      return res.json(existingAttendance);
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      userId: req.user.id,
      date: todayDate,
      checkInTime,
      status: determineStatus(checkInTime)
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error checking in', error: error.message });
  }
});

// POST /api/attendance/checkout - Check out
router.post('/checkout', auth, async (req, res) => {
  try {
    const todayDate = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      where: {
        userId: req.user.id,
        date: todayDate
      }
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'You have not checked in today' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const checkOutTime = new Date();
    const totalHours = (checkOutTime - new Date(attendance.checkInTime)) / (1000 * 60 * 60);

    attendance.checkOutTime = checkOutTime;
    attendance.totalHours = Math.round(totalHours * 100) / 100;
    
    // Update status based on hours for half-day
    if (attendance.totalHours < 4) {
      attendance.status = 'half-day';
    }

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error checking out', error: error.message });
  }
});

// GET /api/attendance/my-history - My attendance history
router.get('/my-history', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    let startDate, endDate;

    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const attendance = await Attendance.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.gte]: startDate.toISOString().split('T')[0],
          [Op.lte]: endDate.toISOString().split('T')[0]
        }
      },
      order: [['date', 'DESC']]
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance history', error: error.message });
  }
});

// GET /api/attendance/my-summary - Monthly summary
router.get('/my-summary', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const attendance = await Attendance.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.gte]: startDate.toISOString().split('T')[0],
          [Op.lte]: endDate.toISOString().split('T')[0]
        }
      }
    });

    const summary = {
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      'half-day': attendance.filter(a => a.status === 'half-day').length,
      'not-checked-in': attendance.filter(a => a.status === 'not-checked-in').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
});

// GET /api/attendance/today - Today's status
router.get('/today', auth, async (req, res) => {
  try {
    const todayDate = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      where: {
        userId: req.user.id,
        date: todayDate
      }
    });

    if (!attendance) {
      return res.json({ status: 'not-checked-in', checkedIn: false, checkedOut: false });
    }

    res.json({
      status: attendance.status,
      checkedIn: !!attendance.checkInTime,
      checkedOut: !!attendance.checkOutTime,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      totalHours: attendance.totalHours
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today status', error: error.message });
  }
});

// ==================== MANAGER ROUTES ====================

// GET /api/attendance/all - All employees attendance
router.get('/all', auth, manager, async (req, res) => {
  try {
    const { date, status, employeeId, department } = req.query;
    let where = {};

    if (date) {
      where.date = date;
    }

    if (status) {
      where.status = status;
    }

    let attendance = await Attendance.findAll({
      where,
      include: [{
        model: User,
        attributes: ['name', 'email', 'employeeId', 'department']
      }],
      order: [['date', 'DESC']]
    });

    // Filter by employee ID
    if (employeeId) {
      attendance = attendance.filter(a => a.User && a.User.employeeId === employeeId);
    }

    // Filter by department
    if (department) {
      attendance = attendance.filter(a => a.User && a.User.department === department);
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all attendance', error: error.message });
  }
});

// GET /api/attendance/employee/:id - Specific employee attendance
router.get('/employee/:id', auth, manager, async (req, res) => {
  try {
    const { month, year } = req.query;
    let startDate, endDate;

    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const attendance = await Attendance.findAll({
      where: {
        userId: req.params.id,
        date: {
          [Op.gte]: startDate.toISOString().split('T')[0],
          [Op.lte]: endDate.toISOString().split('T')[0]
        }
      },
      order: [['date', 'DESC']]
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee attendance', error: error.message });
  }
});

// GET /api/attendance/summary - Team summary
router.get('/summary', auth, manager, async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const employees = await User.findAll({ where: { role: 'employee' } });
    const employeeIds = employees.map(e => e.id);

    const attendance = await Attendance.findAll({
      where: {
        userId: employeeIds,
        date: {
          [Op.gte]: startDate.toISOString().split('T')[0],
          [Op.lte]: endDate.toISOString().split('T')[0]
        }
      }
    });

    const summary = {
      totalEmployees: employees.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      'half-day': attendance.filter(a => a.status === 'half-day').length,
      'not-checked-in': attendance.filter(a => a.status === 'not-checked-in').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team summary', error: error.message });
  }
});

// GET /api/attendance/export - Export CSV
router.get('/export', auth, manager, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    let where = {};
    
    if (startDate && endDate) {
      where.date = {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      };
    }

    let attendance = await Attendance.findAll({
      where,
      include: [{
        model: User,
        attributes: ['name', 'email', 'employeeId', 'department']
      }],
      order: [['date', 'DESC']]
    });

    if (employeeId) {
      const user = await User.findOne({ where: { employeeId } });
      if (user) {
        attendance = attendance.filter(a => a.userId === user.id);
      }
    }

    // Create CSV
    const headers = ['Date', 'Employee Name', 'Employee ID', 'Department', 'Check In', 'Check Out', 'Status', 'Total Hours'];
    const rows = attendance.map(a => [
      a.date || '',
      a.User ? a.User.name : '',
      a.User ? a.User.employeeId : '',
      a.User ? a.User.department : '',
      a.checkInTime ? new Date(a.checkInTime).toISOString() : '',
      a.checkOutTime ? new Date(a.checkOutTime).toISOString() : '',
      a.status,
      a.totalHours || 0
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting data', error: error.message });
  }
});

// GET /api/attendance/today-status - Who's present today
router.get('/today-status', auth, manager, async (req, res) => {
  try {
    const todayDate = new Date().toISOString().split('T')[0];

    const employees = await User.findAll({ where: { role: 'employee' } });
    const employeeIds = employees.map(e => e.id);

    const attendance = await Attendance.findAll({
      where: {
        userId: employeeIds,
        date: todayDate
      },
      include: [{
        model: User,
        attributes: ['name', 'email', 'employeeId', 'department']
      }]
    });

    const present = attendance.filter(a => a.status === 'present' || a.status === 'late');
    const absent = attendance.filter(a => a.status === 'absent' || a.status === 'not-checked-in');
    const late = attendance.filter(a => a.status === 'late');

    res.json({
      total: employees.length,
      present: present.length,
      absent: absent.length,
      late: late.length,
      employees: attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today status', error: error.message });
  }
});

module.exports = router;
