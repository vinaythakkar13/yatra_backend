/**
 * Initial Migration - Create All Tables
 * Yatra Event Management System
 * Version: 1.0
 * Date: October 13, 2025
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create hotels table
    await queryInterface.createTable('hotels', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      map_link: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      total_floors: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      floors: {
        type: Sequelize.JSON,
        allowNull: false
      },
      total_rooms: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      occupied_rooms: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      available_rooms: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for hotels
    await queryInterface.addIndex('hotels', ['name'], { name: 'idx_hotels_name' });
    await queryInterface.addIndex('hotels', ['is_active'], { name: 'idx_hotels_active' });

    // 2. Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      contact_number: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      gender: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      number_of_persons: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      pnr: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
      },
      boarding_state: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      boarding_city: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      boarding_point: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      arrival_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      return_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      assigned_room_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      ticket_images: {
        type: Sequelize.JSON,
        allowNull: true
      },
      registration_status: {
        type: Sequelize.STRING(20),
        defaultValue: 'pending',
        allowNull: false
      },
      is_room_assigned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for users
    await queryInterface.addIndex('users', ['pnr'], { name: 'idx_users_pnr', unique: true });
    await queryInterface.addIndex('users', ['contact_number'], { name: 'idx_users_contact' });
    await queryInterface.addIndex('users', ['email'], { name: 'idx_users_email' });
    await queryInterface.addIndex('users', ['arrival_date'], { name: 'idx_users_arrival_date' });
    await queryInterface.addIndex('users', ['assigned_room_id'], { name: 'idx_users_assigned_room' });
    await queryInterface.addIndex('users', ['registration_status'], { name: 'idx_users_registration_status' });

    // 3. Create rooms table
    await queryInterface.createTable('rooms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      room_number: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      floor: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      hotel_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'hotels',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      is_occupied: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      assigned_to_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for rooms
    await queryInterface.addIndex('rooms', ['hotel_id'], { name: 'idx_rooms_hotel' });
    await queryInterface.addIndex('rooms', ['floor'], { name: 'idx_rooms_floor' });
    await queryInterface.addIndex('rooms', ['is_occupied'], { name: 'idx_rooms_occupied' });
    await queryInterface.addIndex('rooms', ['assigned_to_user_id'], { name: 'idx_rooms_assigned_user' });
    await queryInterface.addIndex('rooms', ['room_number'], { name: 'idx_rooms_room_number' });
    await queryInterface.addIndex('rooms', ['hotel_id', 'room_number'], { 
      name: 'unique_hotel_room', 
      unique: true 
    });

    // Add foreign key constraint to users.assigned_room_id
    await queryInterface.addConstraint('users', {
      fields: ['assigned_room_id'],
      type: 'foreign key',
      name: 'fk_users_assigned_room',
      references: {
        table: 'rooms',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // 4. Create boarding_points table
    await queryInterface.createTable('boarding_points', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      point_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      contact_person: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      contact_number: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for boarding_points
    await queryInterface.addIndex('boarding_points', ['state'], { name: 'idx_boarding_state' });
    await queryInterface.addIndex('boarding_points', ['city'], { name: 'idx_boarding_city' });
    await queryInterface.addIndex('boarding_points', ['is_active'], { name: 'idx_boarding_active' });
    await queryInterface.addIndex('boarding_points', ['state', 'city', 'point_name'], { 
      name: 'unique_state_city_point', 
      unique: true 
    });

    // 5. Create events table
    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      event_type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      event_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      max_participants: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      registered_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'upcoming',
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for events
    await queryInterface.addIndex('events', ['event_date'], { name: 'idx_events_date' });
    await queryInterface.addIndex('events', ['status'], { name: 'idx_events_status' });
    await queryInterface.addIndex('events', ['event_type'], { name: 'idx_events_type' });

    // 6. Create event_participants table
    await queryInterface.createTable('event_participants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      registration_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      attendance_status: {
        type: Sequelize.STRING(20),
        defaultValue: 'registered',
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for event_participants
    await queryInterface.addIndex('event_participants', ['event_id'], { name: 'idx_event_participants_event' });
    await queryInterface.addIndex('event_participants', ['user_id'], { name: 'idx_event_participants_user' });
    await queryInterface.addIndex('event_participants', ['attendance_status'], { name: 'idx_event_participants_status' });
    await queryInterface.addIndex('event_participants', ['event_id', 'user_id'], { 
      name: 'unique_event_user', 
      unique: true 
    });

    // 7. Create admin_users table
    await queryInterface.createTable('admin_users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      contact_number: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      role: {
        type: Sequelize.STRING(20),
        defaultValue: 'admin',
        allowNull: false
      },
      permissions: {
        type: Sequelize.JSON,
        defaultValue: '[]',
        allowNull: false
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      failed_login_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      locked_until: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for admin_users
    await queryInterface.addIndex('admin_users', ['email'], { name: 'idx_admin_email', unique: true });
    await queryInterface.addIndex('admin_users', ['role'], { name: 'idx_admin_role' });
    await queryInterface.addIndex('admin_users', ['is_active'], { name: 'idx_admin_active' });

    // 8. Create admin_sessions table
    await queryInterface.createTable('admin_sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      admin_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'admin_users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      device_info: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      last_activity: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }
    });

    // Create indexes for admin_sessions
    await queryInterface.addIndex('admin_sessions', ['admin_id'], { name: 'idx_sessions_admin' });
    await queryInterface.addIndex('admin_sessions', ['token_hash'], { name: 'idx_sessions_token', unique: true });
    await queryInterface.addIndex('admin_sessions', ['expires_at'], { name: 'idx_sessions_expires' });
    await queryInterface.addIndex('admin_sessions', ['is_active'], { name: 'idx_sessions_active' });

    // 9. Create audit_logs table
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      entity_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      performed_by_admin_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'admin_users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      old_data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      new_data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for audit_logs
    await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id'], { name: 'idx_audit_entity' });
    await queryInterface.addIndex('audit_logs', ['performed_by_admin_id'], { name: 'idx_audit_admin' });
    await queryInterface.addIndex('audit_logs', ['action'], { name: 'idx_audit_action' });
    await queryInterface.addIndex('audit_logs', ['created_at'], { name: 'idx_audit_created' });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to handle foreign key constraints
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('admin_sessions');
    await queryInterface.dropTable('admin_users');
    await queryInterface.dropTable('event_participants');
    await queryInterface.dropTable('events');
    await queryInterface.dropTable('boarding_points');
    await queryInterface.dropTable('rooms');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('hotels');
  }
};

