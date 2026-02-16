const express = require('express');
const cors = require('cors');
const sequelize = require('./models/database');
const User = require('./models/User');
const Attendance = require('./models/Attendance');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sync database and start server
const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false })
  .then(() => {
    console.log('SQLite Database Connected');
    
    // Routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/attendance', require('./routes/attendance'));
    app.use('/api/dashboard', require('./routes/dashboard'));

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
  });

module.exports = app;
