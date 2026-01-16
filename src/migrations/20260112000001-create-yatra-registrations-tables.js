'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Create yatra_registrations table
            await queryInterface.createTable(
                'yatra_registrations',
                {
                    id: {
                        type: DataTypes.UUID,
                        defaultValue: DataTypes.UUIDV4,
                        primaryKey: true,
                        allowNull: false,
                    },
                    user_id: {
                        type: DataTypes.UUID,
                        allowNull: false,
                        references: {
                            model: 'users',
                            key: 'id',
                        },
                        onDelete: 'CASCADE',
                        onUpdate: 'CASCADE',
                    },
                    yatra_id: {
                        type: DataTypes.UUID,
                        allowNull: false,
                        references: {
                            model: 'yatra',
                            key: 'id',
                        },
                        onDelete: 'CASCADE',
                        onUpdate: 'CASCADE',
                    },
                    pnr: {
                        type: DataTypes.STRING(10),
                        allowNull: false,
                    },
                    name: {
                        type: DataTypes.STRING(255),
                        allowNull: false,
                    },
                    whatsapp_number: {
                        type: DataTypes.STRING(15),
                        allowNull: false,
                    },
                    number_of_persons: {
                        type: DataTypes.INTEGER,
                        allowNull: false,
                        validate: {
                            min: 1,
                        },
                    },
                    boarding_city: {
                        type: DataTypes.STRING(100),
                        allowNull: false,
                    },
                    boarding_state: {
                        type: DataTypes.STRING(100),
                        allowNull: false,
                    },
                    arrival_date: {
                        type: DataTypes.DATEONLY,
                        allowNull: false,
                    },
                    return_date: {
                        type: DataTypes.DATEONLY,
                        allowNull: false,
                    },
                    ticket_images: {
                        type: DataTypes.JSON,
                        allowNull: true,
                        defaultValue: [],
                    },
                    status: {
                        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
                        allowNull: false,
                        defaultValue: 'pending',
                    },
                    cancellation_reason: {
                        type: DataTypes.TEXT,
                        allowNull: true,
                    },
                    admin_comments: {
                        type: DataTypes.TEXT,
                        allowNull: true,
                    },
                    rejection_reason: {
                        type: DataTypes.TEXT,
                        allowNull: true,
                    },
                    approved_by_admin_id: {
                        type: DataTypes.UUID,
                        allowNull: true,
                        references: {
                            model: 'admin_users',
                            key: 'id',
                        },
                        onDelete: 'SET NULL',
                        onUpdate: 'CASCADE',
                    },
                    rejected_by_admin_id: {
                        type: DataTypes.UUID,
                        allowNull: true,
                        references: {
                            model: 'admin_users',
                            key: 'id',
                        },
                        onDelete: 'SET NULL',
                        onUpdate: 'CASCADE',
                    },
                    approved_at: {
                        type: DataTypes.DATE,
                        allowNull: true,
                    },
                    rejected_at: {
                        type: DataTypes.DATE,
                        allowNull: true,
                    },
                    cancelled_at: {
                        type: DataTypes.DATE,
                        allowNull: true,
                    },
                    created_at: {
                        type: DataTypes.DATE,
                        allowNull: false,
                        defaultValue: DataTypes.NOW,
                    },
                    updated_at: {
                        type: DataTypes.DATE,
                        allowNull: false,
                        defaultValue: DataTypes.NOW,
                    },
                },
                { transaction },
            );

            // Create indexes for yatra_registrations
            await queryInterface.addIndex('yatra_registrations', ['user_id'], {
                name: 'idx_registration_user',
                transaction,
            });
            await queryInterface.addIndex('yatra_registrations', ['yatra_id'], {
                name: 'idx_registration_yatra',
                transaction,
            });
            await queryInterface.addIndex('yatra_registrations', ['status'], {
                name: 'idx_registration_status',
                transaction,
            });
            await queryInterface.addIndex('yatra_registrations', ['pnr'], {
                name: 'idx_registration_pnr',
                transaction,
            });
            await queryInterface.addIndex('yatra_registrations', ['whatsapp_number'], {
                name: 'idx_registration_whatsapp',
                transaction,
            });

            // Create persons table
            await queryInterface.createTable(
                'persons',
                {
                    id: {
                        type: DataTypes.UUID,
                        defaultValue: DataTypes.UUIDV4,
                        primaryKey: true,
                        allowNull: false,
                    },
                    registration_id: {
                        type: DataTypes.UUID,
                        allowNull: false,
                        references: {
                            model: 'yatra_registrations',
                            key: 'id',
                        },
                        onDelete: 'CASCADE',
                        onUpdate: 'CASCADE',
                    },
                    name: {
                        type: DataTypes.STRING(255),
                        allowNull: false,
                    },
                    age: {
                        type: DataTypes.INTEGER,
                        allowNull: true,
                        validate: {
                            min: 1,
                            max: 120,
                        },
                    },
                    gender: {
                        type: DataTypes.ENUM('male', 'female', 'other'),
                        allowNull: false,
                    },
                    is_handicapped: {
                        type: DataTypes.BOOLEAN,
                        allowNull: false,
                        defaultValue: false,
                    },
                    created_at: {
                        type: DataTypes.DATE,
                        allowNull: false,
                        defaultValue: DataTypes.NOW,
                    },
                    updated_at: {
                        type: DataTypes.DATE,
                        allowNull: false,
                        defaultValue: DataTypes.NOW,
                    },
                },
                { transaction },
            );

            // Create index for persons
            await queryInterface.addIndex('persons', ['registration_id'], {
                name: 'idx_person_registration',
                transaction,
            });

            // Create registration_logs table
            await queryInterface.createTable(
                'registration_logs',
                {
                    id: {
                        type: DataTypes.UUID,
                        defaultValue: DataTypes.UUIDV4,
                        primaryKey: true,
                        allowNull: false,
                    },
                    registration_id: {
                        type: DataTypes.UUID,
                        allowNull: false,
                        references: {
                            model: 'yatra_registrations',
                            key: 'id',
                        },
                        onDelete: 'CASCADE',
                        onUpdate: 'CASCADE',
                    },
                    action: {
                        type: DataTypes.ENUM('created', 'updated', 'cancelled', 'approved', 'rejected'),
                        allowNull: false,
                    },
                    changed_by: {
                        type: DataTypes.UUID,
                        allowNull: true,
                        references: {
                            model: 'admin_users',
                            key: 'id',
                        },
                        onDelete: 'SET NULL',
                        onUpdate: 'CASCADE',
                    },
                    changed_by_type: {
                        type: DataTypes.ENUM('admin', 'user'),
                        allowNull: true,
                    },
                    old_values: {
                        type: DataTypes.JSON,
                        allowNull: true,
                    },
                    new_values: {
                        type: DataTypes.JSON,
                        allowNull: true,
                    },
                    reason: {
                        type: DataTypes.TEXT,
                        allowNull: true,
                    },
                    comments: {
                        type: DataTypes.TEXT,
                        allowNull: true,
                    },
                    ip_address: {
                        type: DataTypes.STRING(45),
                        allowNull: true,
                    },
                    user_agent: {
                        type: DataTypes.TEXT,
                        allowNull: true,
                    },
                    created_at: {
                        type: DataTypes.DATE,
                        allowNull: false,
                        defaultValue: DataTypes.NOW,
                    },
                },
                { transaction },
            );

            // Create indexes for registration_logs
            await queryInterface.addIndex('registration_logs', ['registration_id'], {
                name: 'idx_log_registration',
                transaction,
            });
            await queryInterface.addIndex('registration_logs', ['action'], {
                name: 'idx_log_action',
                transaction,
            });
            await queryInterface.addIndex('registration_logs', ['created_at'], {
                name: 'idx_log_created',
                transaction,
            });
            await queryInterface.addIndex('registration_logs', ['changed_by'], {
                name: 'idx_log_changed_by',
                transaction,
            });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error in migration 20260112000001-create-yatra-registrations-tables:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Drop tables in reverse order (due to foreign key constraints)
            await queryInterface.dropTable('registration_logs', { transaction });
            await queryInterface.dropTable('persons', { transaction });
            await queryInterface.dropTable('yatra_registrations', { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error reverting migration 20260112000001-create-yatra-registrations-tables:', error);
            throw error;
        }
    },
};
