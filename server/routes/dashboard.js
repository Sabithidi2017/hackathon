const express = require('express');
const { Op } = require('sequelize');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, manager } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/employee - Employee stats
router.get('/employee', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // Today's attendance
    const todayDate = now.toISOString().split('T')[0];
    const todayAttendance = await Attendance.findOne({
      where: {
        userId: req.user.id,
        date: todayDate
      }
    });

    // This month stats
    const monthAttendance = await Attendance.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.gte]: startOfMonth.toISOString().split('T')[0],
          [Op.lte]: endOfMonth.toISOString().split('T')[0]
        }
      }
    });

    const monthSummary = {
      present: monthAttendance.filter(a => a.status === 'present').length,
      absent: monthAttendance.filter(a => a.status === 'absent').length,
      late: monthAttendance.filter(a => a.status === 'late').length,
      'half-day': monthAttendance.filter(a => a.status === 'half-day').length,
      totalHours: monthAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
    };

    // Recent attendance (last 7 days)
    const recentAttendance = await Attendance.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.gte]: startOfWeek.toISOString().split('T')[0],
          [Op.lte]: endOfMonth.toISOString().split('T')[0]
        }
      },
      order: [['date', 'DESC']],
      limit: 7
    });

    res.json({
      todayStatus: todayAttendance ? {
        status: todayAttendance.status,
        checkedIn: !!todayAttendance.checkInTime,
        checkedOut: !!todayAttendance.checkOutTime,
        checkInTime: todayAttendance.checkInTime,
        checkOutTime: todayAttendance.checkOutTime
      } : { status: 'not-checked-in', checkedIn: false, checkedOut: false },
      monthSummary,
      recentAttendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee dashboard', error: error.message });
  }
});

// GET /api/dashboard/manager - Manager stats
router.get('/manager', auth, manager, async (req, res) => {
  try {
    const now = new Date();
    const todayDate = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // Total employees
    const totalEmployees = await User.count({ where: { role: 'employee' } });

    // Today's attendance
    const employees = await User.findAll({ where: { role: 'employee' } });
    const employeeIds = employees.map(e => e.id);

    const todayAttendance = await Attendance.findAll({
      where: {
        userId: employeeIds,
        date: todayDate
      },
      include: [{
        model: User,
        attributes: ['name', 'email', 'employeeId', 'department']
      }]
    });

    const present = todayAttendance.filter(a => a.status === 'present' || a.status === 'late');
    const absent = todayAttendance.filter(a => a.status === 'absent' || a.status === 'not-checked-in');
    const late = todayAttendance.filter(a => a.status === 'late');

    // Weekly attendance trend
    const weekAttendance = await Attendance.findAll({
      where: {
        userId: employeeIds,
        date: {
          [Op.gte]: startOfWeek.toISOString().split('T')[0],
          [Op.lte]: todayDate
        }
      }
    });

    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayStr = day.toISOString().split('T')[0];
      
      const dayRecords = weekAttendance.filter(a => a.date === dayStr);

      weeklyTrend.push({
        date: dayStr,
        present: dayRecords.filter(a => a.status === 'present').length,
        late: dayRecords.filter(a => a.status === 'late').length,
        absent: dayRecords.filter(a => a.status === 'absent' || a.status === 'not-checked-in').length
      });
    }

    // Department-wise attendance
    const departments = [...new Set(employees.map(e => e.department).filter(d => d))];
    
    const departmentStats = await Promise.all(departments.map(async (dept) => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const deptIds = deptEmployees.map(e => e.id);
      
      const deptAttendance = await Attendance.findAll({
        where: {
          userId: deptIds,
          date: todayDate
        }
      });

      return {
        department: dept,
        total: deptEmployees.length,
        present: deptAttendance.filter(a => a.status === 'present' || a.status === 'late').length,
        absent: deptAttendance.filter(a => a.status === 'absent' || a.status === 'not-checked-in').length
      };
    }));

    // Absent employees today
    const absentEmployees = absent.map(a => ({
      name: a.User ? a.User.name : 'Unknown',
      email: a.User ? a.User.email : '',
      employeeId: a.User ? a.User.employeeId : '',
      department: a.User ? a.User.department : '',
      status: a.status
    }));

    res.json({
      totalEmployees,
      todayAttendance: {
        present: present.length,
        absent: absent.length,
        late: late.length
      },
      weeklyTrend,
      departmentStats,
      absentEmployees
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching manager dashboard', error: error.message });
  }
});

module.exports = router;
