# Yatra Event Management System - Backend

A comprehensive backend system for managing pilgrimage events, accommodations, and participant registrations using Node.js, Express, and MySQL with Sequelize ORM.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Models Overview](#models-overview)
- [Utilities](#utilities)
- [Development](#development)
- [Production Deployment](#production-deployment)

## ✨ Features

- **Hotel Management**: Manage hotels with multiple floors and rooms
- **Room Assignment**: Automatic room allocation and tracking
- **User Registration**: Pilgrim registration with PNR tracking
- **Boarding Points**: Manage pickup/drop-off locations across India
- **Event Management**: Create and manage religious, cultural, and tour events
- **Event Participation**: Track event registrations and attendance
- **Admin System**: Role-based access control (Super Admin, Admin, Staff)
- **Session Management**: Secure JWT-based authentication
- **Audit Logging**: Complete audit trail of all admin actions
- **Statistics**: Real-time hotel occupancy and event participation stats
- **CORS Support**: Secure cross-origin requests configuration 🆕
- **Request Logging**: Formatted console logs for all API requests 🆕

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **CORS**: Configured for cross-origin requests
- **Environment**: dotenv
- **Logging**: morgan + custom request logger

## 🗄 Database Schema

The system includes 9 main tables:

1. **hotels** - Hotel/accommodation information
2. **rooms** - Individual room details
3. **users** - Pilgrim/traveler registrations
4. **boarding_points** - Pickup/drop-off locations
5. **events** - Event information
6. **event_participants** - Event participation tracking
7. **admin_users** - Admin user accounts
8. **admin_sessions** - Authentication sessions
9. **audit_logs** - Complete audit trail

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

> 💡 **Quick Start?** See [QUICK_API_REFERENCE.md](QUICK_API_REFERENCE.md) for a condensed reference of all API endpoints and usage.

### Step 1: Clone/Navigate to Project

```bash
cd /home/vinay/Documents/yatra_backend
```

### Step 2: Install Dependencies

```bash
npm install
```

## ⚙️ Configuration

### Step 1: Create Environment File

Copy the example environment file and configure it:

```bash
cp env.example .env
```

### Step 2: Configure Environment Variables

Edit the `.env` file with your settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=yatra_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DIALECT=mysql

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
# Comma-separated list of allowed frontend origins
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Admin Default Credentials
DEFAULT_ADMIN_EMAIL=admin@yatra.com
DEFAULT_ADMIN_PASSWORD=Admin@123
```

⚠️ **Important**: Change `JWT_SECRET` and admin credentials in production!

## 🗃 Database Setup

### Step 1: Create Database

Login to MySQL and create the database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE yatra_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### Step 2: Run Migrations

Create all database tables:

```bash
npm run db:migrate
```

### Step 3: Seed Initial Data

Populate database with initial data:

```bash
npm run db:seed
```

This will create:
- Default admin user (admin@yatra.com / Admin@123)
- 8 sample boarding points across India
- Sample hotel "Yatra Niwas" with 10 rooms

### Alternative: One-Step Setup

```bash
npm run db:setup
```

This runs: create database → migrations → seeders

## 🚀 Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

### Verify Installation

Visit: `http://localhost:5000/health`

Expected response:
```json
{
  "success": true,
  "message": "Yatra Backend Server is running",
  "timestamp": "2025-10-13T...",
  "environment": "development"
}
```

## 📁 Project Structure

```
yatra_backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   └── swagger.js           # Swagger/OpenAPI configuration
│   ├── models/
│   │   ├── index.js             # Models initialization
│   │   ├── Hotel.js             # Hotel model
│   │   ├── Room.js              # Room model
│   │   ├── User.js              # User/Pilgrim model
│   │   ├── BoardingPoint.js     # Boarding point model
│   │   ├── Event.js             # Event model
│   │   ├── EventParticipant.js  # Event participant model
│   │   ├── AdminUser.js         # Admin user model
│   │   ├── AdminSession.js      # Admin session model
│   │   └── AuditLog.js          # Audit log model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── hotels.js            # Hotel routes
│   │   └── users.js             # User/Pilgrim routes
│   ├── migrations/
│   │   └── 20251013000001-create-all-tables.js
│   ├── seeders/
│   │   ├── 20251013000001-admin-user.js
│   │   ├── 20251013000002-boarding-points.js
│   │   └── 20251013000003-sample-hotel-rooms.js
│   ├── utils/
│   │   ├── auditLogger.js       # Audit logging utilities
│   │   ├── jwtHelper.js         # JWT utilities
│   │   ├── responseHelper.js    # API response helpers
│   │   └── databaseHelpers.js   # Database helper functions
│   └── server.js                # Application entry point
├── .sequelizerc                 # Sequelize CLI configuration
├── .gitignore
├── package.json
├── env.example
├── README.md
├── SETUP_GUIDE.md               # Quick setup guide
├── SWAGGER_POSTMAN_GUIDE.md     # API documentation guide
├── SWAGGER_SETUP_SUMMARY.md     # Swagger setup summary
├── QUICK_API_REFERENCE.md       # Quick API reference
├── USER_LOGIN_API.md            # User login with PNR guide
└── USER_API_UPDATE_SUMMARY.md   # User API update summary
```

## 🔌 API Endpoints

### Interactive Documentation

**Swagger UI (Interactive):**  
🌐 `http://localhost:5000/api-docs`

**Swagger JSON (Postman Import):**  
📥 `http://localhost:5000/api-docs.json`

### Health & Info

- `GET /health` - Health check
- `GET /api` - API information
- `GET /api-docs` - Swagger UI documentation
- `GET /api-docs.json` - OpenAPI JSON spec

### Authentication (Admin)

- `POST /api/auth/create-super-admin` - Create super admin account ✅ 🆕
- `POST /api/auth/login` - Admin login ✅
- `POST /api/auth/logout` - Admin logout ✅
- `GET /api/auth/me` - Get current admin ✅

### Hotels

- `GET /api/hotels` - List hotels ✅
- `GET /api/hotels/:id` - Get hotel by ID ✅
- `POST /api/hotels` - Create hotel ✅
- `PUT /api/hotels/:id` - Update hotel ✅
- `DELETE /api/hotels/:id` - Delete hotel ✅

### Users/Pilgrims

- `POST /api/users/login` - User login with PNR (returns details + hotel) ✅
- `POST /api/users` - Register new pilgrim ✅
- `GET /api/users` - List all users (admin) ✅
- `GET /api/users/:pnr` - Get user by PNR (admin) ✅
- `PUT /api/users/:id` - Update user details (admin) ✅
- `DELETE /api/users/:id` - Delete user (admin) ✅

### Future Endpoints (To be implemented)

- `GET /api/rooms/available` - Get available rooms
- `POST /api/rooms/assign` - Assign room to user
- `GET /api/events` - List events
- `POST /api/events/:id/register` - Register for event
- `GET /api/boarding-points` - List boarding points
- `GET /api/audit-logs` - View audit logs

> 📖 **Documentation:**  
> - [SWAGGER_POSTMAN_GUIDE.md](SWAGGER_POSTMAN_GUIDE.md) - Complete API documentation and Postman integration  
> - [USER_LOGIN_API.md](USER_LOGIN_API.md) - User/Pilgrim login with PNR documentation  
> - [SUPER_ADMIN_QUICK_START.md](SUPER_ADMIN_QUICK_START.md) - Quick start guide for super admin setup 🆕  
> - [SUPER_ADMIN_API.md](SUPER_ADMIN_API.md) - Complete super admin API documentation 🆕  
> - [CORS_SETUP_GUIDE.md](CORS_SETUP_GUIDE.md) - Complete CORS configuration guide 🆕  
> - [CORS_QUICK_REFERENCE.md](CORS_QUICK_REFERENCE.md) - Quick CORS reference 🆕  
> - [QUICK_API_REFERENCE.md](QUICK_API_REFERENCE.md) - Quick API reference card

## 📊 Models Overview

### Hotel Model
- Manages hotel information with floors and rooms
- Tracks total, occupied, and available rooms
- JSON field for floor structure

### Room Model
- Individual room management
- Tracks occupancy status
- Links to hotel and assigned user
- Auto-updates hotel statistics

### User Model
- Pilgrim/traveler registration
- PNR-based tracking
- Boarding point information
- Arrival/return date management
- Room assignment tracking

### BoardingPoint Model
- Pickup/drop-off locations
- GPS coordinates support
- Contact person details
- State and city organization

### Event Model
- Event details (religious, cultural, tour, other)
- Date, time, location tracking
- Participant capacity management
- Status tracking (upcoming, ongoing, completed, cancelled)

### EventParticipant Model
- Many-to-many relationship between events and users
- Attendance tracking
- Registration date logging

### AdminUser Model
- Role-based access (super_admin, admin, staff)
- Password hashing with bcrypt
- Permission management (JSON field)
- Account locking mechanism

### AdminSession Model
- JWT token management
- Device and IP tracking
- Session expiration
- Activity tracking

### AuditLog Model
- Complete action logging
- Before/after data snapshots (JSON)
- Admin action tracking
- IP and user agent logging

## 🛠 Utilities

### Audit Logger (`utils/auditLogger.js`)
```javascript
const { logAction } = require('./utils/auditLogger');

await logAction({
  action: 'CREATE',
  entityType: 'User',
  entityId: user.id,
  adminId: req.admin.id,
  newData: user,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

### JWT Helper (`utils/jwtHelper.js`)
```javascript
const { generateToken, verifyToken } = require('./utils/jwtHelper');

const token = generateToken(adminUser);
const decoded = verifyToken(token);
```

### Response Helper (`utils/responseHelper.js`)
```javascript
const { successResponse, errorResponse } = require('./utils/responseHelper');

return successResponse(res, data, 'User created successfully', 201);
return errorResponse(res, 'User not found', 404);
```

### Database Helpers (`utils/databaseHelpers.js`)
```javascript
const { getAvailableRoomsWithHotel, getHotelOccupancyStats } = require('./utils/databaseHelpers');

const availableRooms = await getAvailableRoomsWithHotel();
const stats = await getHotelOccupancyStats();
```

## 👨‍💻 Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:undo

# Rollback all migrations
npm run db:migrate:undo:all

# Run all seeders
npm run db:seed

# Undo all seeders
npm run db:seed:undo

# Reset database (undo migrations, migrate, seed)
npm run db:reset

# Full setup (create DB, migrate, seed)
npm run db:setup
```

### Creating Your First Super Admin

You have two options:

#### Option 1: Use Seeder (Quick Setup)
After running seeders, a default admin is created:
- **Email**: admin@yatra.com
- **Password**: Admin@123

⚠️ **Change these credentials immediately in production!**

#### Option 2: Use Super Admin API (Recommended) 🆕
Create a super admin via API with your custom credentials:

```bash
curl -X POST http://localhost:5000/api/auth/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "youradmin@yatra.com",
    "password": "YourSecure@Pass123",
    "name": "Your Name"
  }'
```

**See detailed guide:** [SUPER_ADMIN_QUICK_START.md](SUPER_ADMIN_QUICK_START.md)

### Creating New Migration

```bash
npx sequelize-cli migration:generate --name migration-name
```

### Creating New Seeder

```bash
npx sequelize-cli seed:generate --name seeder-name
```

## 🚢 Production Deployment

### 1. Environment Setup

- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Change default admin credentials
- Use secure database credentials
- Enable HTTPS/SSL

### 2. Database

- Use managed MySQL service (AWS RDS, Google Cloud SQL, etc.)
- Enable automated backups
- Set up connection pooling
- Use read replicas for scaling

### 3. Security

- Enable rate limiting
- Add helmet.js for security headers
- Implement CORS properly
- Use environment-specific configs
- Enable SQL injection protection (Sequelize provides this)
- Implement request validation

### 4. Monitoring

- Set up logging service (Winston, Papertrail)
- Enable error tracking (Sentry)
- Monitor database performance
- Set up health check endpoints
- Implement alerting

### 5. Optimization

- Enable compression
- Implement caching (Redis)
- Use CDN for static assets
- Optimize database queries
- Enable query logging in development only

## 📝 Notes

### MySQL-Specific Features

This project uses MySQL-compatible features instead of PostgreSQL:
- `UUID` with UUIDV4 default
- `JSON` type instead of JSONB
- JSON arrays instead of PostgreSQL arrays
- Sequelize hooks instead of database triggers
- Model-level validations instead of CHECK constraints

### Data Validation

Validations are implemented at:
1. **Model level** - Sequelize validators
2. **Application level** - express-validator (to be implemented)
3. **Database level** - Foreign key constraints

### Circular Dependencies

The `users` and `rooms` tables have circular foreign key references:
- `users.assigned_room_id` → `rooms.id`
- `rooms.assigned_to_user_id` → `users.id`

This is handled properly in migrations with separate constraint addition.

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests (when implemented)
4. Submit pull request

## 📄 License

ISC

## 👥 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ for Yatra Event Management System**

