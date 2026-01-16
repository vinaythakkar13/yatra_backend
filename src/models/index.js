/**
 * Sequelize Models Index
 * Initializes database connection and imports all models
 */

const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define,
    pool: dbConfig.pool
  }
);

// Import all models
const Hotel = require('./Hotel')(sequelize);
const Room = require('./Room')(sequelize);
const User = require('./User')(sequelize);
const BoardingPoint = require('./BoardingPoint')(sequelize);
const Event = require('./Event')(sequelize);
const EventParticipant = require('./EventParticipant')(sequelize);
const AdminUser = require('./AdminUser')(sequelize);
const AdminSession = require('./AdminSession')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);
const Yatra = require('./yatra')(sequelize);

// Define associations
const db = {
  sequelize,
  Sequelize,
  Hotel,
  Room,
  User,
  BoardingPoint,
  Event,
  EventParticipant,
  AdminUser,
  AdminSession,
  AuditLog,
  Yatra
};

// Yatra <-> Hotel relationships
Yatra.hasMany(Hotel, {
  foreignKey: 'yatra_id',
  as: 'hotels',
  onDelete: 'CASCADE'
});
Hotel.belongsTo(Yatra, {
  foreignKey: 'yatra_id',
  as: 'yatra'
});

// Hotel <-> Room relationships
Hotel.hasMany(Room, {
  foreignKey: 'hotel_id',
  as: 'rooms',
  onDelete: 'CASCADE'
});
Room.belongsTo(Hotel, {
  foreignKey: 'hotel_id',
  as: 'hotel'
});

// Room <-> User relationships (assigned room)
Room.belongsTo(User, {
  foreignKey: 'assigned_to_user_id',
  as: 'assignedUser',
  onDelete: 'SET NULL'
});
User.hasOne(Room, {
  foreignKey: 'assigned_to_user_id',
  as: 'occupiedRoom'
});

// User <-> Room (assigned_room_id)
User.belongsTo(Room, {
  foreignKey: 'assigned_room_id',
  as: 'assignedRoom',
  onDelete: 'SET NULL'
});

// Event <-> EventParticipant <-> User relationships
Event.hasMany(EventParticipant, {
  foreignKey: 'event_id',
  as: 'participants',
  onDelete: 'CASCADE'
});
EventParticipant.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});

User.hasMany(EventParticipant, {
  foreignKey: 'user_id',
  as: 'eventParticipations',
  onDelete: 'CASCADE'
});
EventParticipant.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// AdminUser <-> AdminSession relationships
AdminUser.hasMany(AdminSession, {
  foreignKey: 'admin_id',
  as: 'sessions',
  onDelete: 'CASCADE'
});
AdminSession.belongsTo(AdminUser, {
  foreignKey: 'admin_id',
  as: 'admin'
});

// AdminUser <-> AuditLog relationships
AdminUser.hasMany(AuditLog, {
  foreignKey: 'performed_by_admin_id',
  as: 'auditLogs',
  onDelete: 'SET NULL'
});
AuditLog.belongsTo(AdminUser, {
  foreignKey: 'performed_by_admin_id',
  as: 'performedBy'
});

module.exports = db;

