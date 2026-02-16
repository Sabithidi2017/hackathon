const sequelize = require('./models/database');
const User = require('./models/User');
const Attendance = require('./models/Attendance');

const seedData = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create Manager
    const manager = await User.create({
      name: 'John Manager',
      email: 'manager@example.com',
      password: 'password123',
      role: 'manager',
      department: 'Management'
    });
    console.log('Created Manager:', manager.email);

    // Create Employees
    const employees = await User.bulkCreate([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP001',
        department: 'Engineering'
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP002',
        department: 'Engineering'
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP003',
        department: 'Marketing'
      },
      {
        name: 'Diana Prince',
        email: 'diana@example.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP004',
        department: 'Marketing'
      },
      {
        name: 'Eve Williams',
        email: 'eve@example.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP005',
        department: 'HR'
      }
    ]);
    console.log('Created 5 employees');

    // Generate attendance for the past 30 days
    const today = new Date();
    const attendanceRecords = [];

    for (const employee of employees) {
      for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Skip weekends (Saturday = 6, Sunday = 0)
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // Randomize attendance (80% chance of being present)
        const isPresent = Math.random() < 0.8;
        
        if (!isPresent) {
          attendanceRecords.push({
            userId: employee.id,
            date: dateStr,
            status: 'absent',
            checkInTime: null,
            checkOutTime: null,
            totalHours: 0
          });
          continue;
        }

        // Generate check-in time (between 8:30 AM and 10:00 AM)
        const checkInHour = 8 + Math.floor(Math.random() * 2);
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkInTime = new Date(date);
        checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

        // Determine status based on check-in time
        let status = 'present';
        if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 15)) {
          status = 'late';
        }

        // Generate check-out time (between 5:00 PM and 7:00 PM)
        const checkOutHour = 17 + Math.floor(Math.random() * 2);
        const checkOutMinute = Math.floor(Math.random() * 60);
        const checkOutTime = new Date(date);
        checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);

        // Calculate total hours
        const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

        // Check for half-day (less than 4 hours)
        if (totalHours < 4) {
          status = 'half-day';
        }

        attendanceRecords.push({
          userId: employee.id,
          date: dateStr,
          checkInTime,
          checkOutTime,
          status,
          totalHours: Math.round(totalHours * 100) / 100
        });
      }
    }

    await Attendance.bulkCreate(attendanceRecords);
    console.log(`Created ${attendanceRecords.length} attendance records`);

    console.log('\n=== Seed Data Created Successfully ===');
    console.log('\nLogin Credentials:');
    console.log('Manager: manager@example.com / password123');
    console.log('Employee: alice@example.com / password123');
    console.log('Employee: bob@example.com / password123');
    console.log('Employee: charlie@example.com / password123');
    console.log('Employee: diana@example.com / password123');
    console.log('Employee: eve@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
