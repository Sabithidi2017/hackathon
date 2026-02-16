const { Sequelize } = require('sequelize');
const path = require('path');

// Create SQLite database (or connect to existing)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'attendance.db'),
  logging: false
});

module.exports = sequelize;
