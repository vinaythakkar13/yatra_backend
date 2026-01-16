/**
 * Seeder - Default Admin User
 * Creates the default system administrator account
 */

'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminId = uuidv4();
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    await queryInterface.bulkInsert('admin_users', [
      {
        id: adminId,
        email: 'admin@yatra.com',
        password_hash: passwordHash,
        name: 'System Administrator',
        contact_number: '+919876543210',
        role: 'super_admin',
        permissions: JSON.stringify([
          'users.read',
          'users.write',
          'users.delete',
          'hotels.read',
          'hotels.write',
          'hotels.delete',
          'rooms.read',
          'rooms.write',
          'rooms.delete',
          'events.read',
          'events.write',
          'events.delete',
          'boarding_points.read',
          'boarding_points.write',
          'boarding_points.delete',
          'admin_users.read',
          'admin_users.write',
          'admin_users.delete',
          'audit_logs.read'
        ]),
        is_active: true,
        email_verified: true,
        failed_login_attempts: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    console.log('\n✅ Default Admin User Created:');
    console.log('   Email: admin@yatra.com');
    console.log('   Password: Admin@123');
    console.log('   ⚠️  IMPORTANT: Change password after first login!\n');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('admin_users', {
      email: 'admin@yatra.com'
    }, {});
  }
};

