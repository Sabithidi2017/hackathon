# Employee Attendance System

A full-stack Employee Attendance System built with React, Node.js, Express, and MongoDB.

## Features

### Employee Features
- Register/Login with JWT authentication
- Mark daily attendance (Check In / Check Out)
- View attendance history with calendar view
- View monthly summary (Present/Absent/Late days)
- Dashboard with personal stats

### Manager Features
- Login with manager role
- View all employees attendance
- Filter by employee, date, status, department
- View team attendance summary
- Export attendance reports to CSV
- Dashboard with team stats and charts

## Tech Stack

- **Frontend**: React, Zustand (state management), Recharts (charts)
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
hackathon2/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Layout component
│   │   ├── pages/         # Page components
│   │   │   ├── employee/  # Employee pages
│   │   │   └── manager/   # Manager pages
│   │   ├── services/      # API service
│   │   ├── store/         # Zustand store
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                 # Express backend
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── seed.js          # Database seeder
│   ├── index.js         # Server entry point
│   └── package.json
├── package.json          # Root package.json
└── README.md            # This file
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
cd hackathon2
```

### 2. Install Dependencies

Install all dependencies (root, client, and server):

```bash
npm run install-all
```

Or install separately:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendanceDB
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:3000
```

### 4. Start MongoDB

Make sure MongoDB is running locally or use a cloud MongoDB Atlas connection string.

### 5. Seed the Database (Optional)

Run the seed script to create sample data:

```bash
npm run seed
```

This will create:
- 1 Manager account
- 5 Employee accounts
- 30 days of attendance records

### 6. Run the Application

#### Development Mode

Run both client and server concurrently:

```bash
# Terminal 1 - Start server
cd server && npm run dev

# Terminal 2 - Start client
cd client && npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Login Credentials

After running the seed script, you can use these accounts:

### Manager Account
- Email: manager@example.com
- Password: password123

### Employee Accounts
- Email: alice@example.com / password123
- Email: bob@example.com / password123
- Email: charlie@example.com / password123
- Email: diana@example.com / password123
- Email: eve@example.com / password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Attendance (Employee)
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/my-history` - Get attendance history
- `GET /api/attendance/my-summary` - Get monthly summary
- `GET /api/attendance/today` - Get today's status

### Attendance (Manager)
- `GET /api/attendance/all` - Get all employees attendance
- `GET /api/attendance/employee/:id` - Get specific employee attendance
- `GET /api/attendance/summary` - Get team summary
- `GET /api/attendance/export` - Export to CSV
- `GET /api/attendance/today-status` - Get today's status

### Dashboard
- `GET /api/dashboard/employee` - Get employee dashboard data
- `GET /api/dashboard/manager` - Get manager dashboard data

## Screenshots

### Employee Dashboard
- Today's attendance status
- Monthly summary (present, absent, late days)
- Total hours worked
- Recent attendance records

### Manager Dashboard
- Total employees count
- Today's attendance overview
- Weekly attendance trend chart
- Department-wise attendance chart
- List of absent employees

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/attendanceDB |
| JWT_SECRET | JWT secret key | attendance_secret_key_2024 |
| CLIENT_URL | Frontend URL | http://localhost:3000 |

## License

MIT
