# Student Management System (MERN Stack)

A comprehensive Student Management System built with MongoDB, Express.js, React.js, and Node.js featuring role-based access control, attendance tracking, grade management, fee management, and more.

## Features

### 🔐 Authentication & Authorization
- Role-based access control (Admin, Teacher, Student, Parent)
- JWT-based authentication
- Password reset & recovery
- Profile management

### 👨‍💼 Admin Dashboard
- Overview of students, teachers, and classes
- User management with role assignments
- System analytics and reports
- Comprehensive data management

### 👨‍🎓 Student Management
- Student registration and profile creation
- Class enrollment
- Attendance and performance tracking
- Parent-student relationships

### 👨‍🏫 Teacher Management
- Teacher assignment to courses/classes
- Workload and schedule management
- Grade and attendance input capabilities
- Student communication tools

### 📋 Attendance Management
- Daily attendance marking (Present/Absent/Late/Excused)
- Attendance reports and analytics
- Automated notifications for absences

### 🏫 Course & Class Management
- Course and subject creation
- Class scheduling and timetable management
- Teacher-subject assignments
- Progress tracking

### 📊 Exam & Grade Management
- Grade recording and management
- Report card generation
- GPA calculation
- Performance analytics

### 💰 Fee Management
- Fee tracking and payment recording
- Invoice generation
- Payment history and reminders
- Multiple payment methods support

### 📱 Communication & Notifications
- Announcements and notices
- Email/SMS notifications
- Event calendar
- In-app messaging system

### 📈 Reporting & Analytics
- Comprehensive dashboard with charts
- PDF/Excel report generation
- Attendance and performance trends
- Data export capabilities

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware
- **express-rate-limit** - Rate limiting

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Context API** - State management
- **CSS3** - Styling

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd student-management-system
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env file with your configuration:
# - MongoDB connection string
# - JWT secret key
# - Email configuration (optional)

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm start
```

The frontend will run on `http://localhost:3000`

### 4. Database Setup

The application will automatically create the necessary collections when you first run it. You can manually create some initial data:

#### Sample Admin User
```javascript
// You can register an admin user through the API or create one directly in MongoDB
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@school.com",
  "password": "admin123",
  "role": "admin"
}
```

## Demo Credentials

For testing purposes, you can create these users:

- **Admin**: admin@school.com / admin123
- **Teacher**: teacher@school.com / teacher123  
- **Student**: student@school.com / student123

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Class Management
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class
- `GET /api/classes/:id` - Get class by ID
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Attendance Management
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/class/:classId` - Get class attendance
- `GET /api/attendance/student/:studentId` - Get student attendance

### Grade Management
- `POST /api/grades` - Add grade
- `GET /api/grades/student/:studentId` - Get student grades
- `GET /api/grades/class/:classId` - Get class grades
- `PUT /api/grades/:id` - Update grade

### And more endpoints for subjects, fees, events, notifications...

## Project Structure

```
student-management-system/
├── backend/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── services/     # API services
│   │   └── App.js        # Main app component
│   └── package.json
└── README.md
```

## Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Student Management System
```

## Security Features

- JWT authentication with secure token storage
- Password hashing with bcrypt
- Role-based access control
- Request rate limiting
- Input validation and sanitization
- CORS protection
- Helmet.js security headers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@studentmanagement.com or create an issue in the repository.

## Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics and reporting
- [ ] Integration with external systems
- [ ] Multi-language support
- [ ] Advanced messaging system
- [ ] Video conferencing integration
- [ ] Library management system
- [ ] Transportation management
- [ ] Hostel management
- [ ] Examination scheduling automation
