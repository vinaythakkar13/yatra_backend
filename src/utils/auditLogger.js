/**
 * Audit Logger Utility
 * Helper functions for logging admin actions to audit_logs table
 */

const { AuditLog } = require('../models');

/**
 * Log an action to the audit trail
 * @param {Object} params - Audit log parameters
 * @param {string} params.action - Action performed (CREATE, UPDATE, DELETE, etc.)
 * @param {string} params.entityType - Type of entity affected
 * @param {string} params.entityId - ID of the entity
 * @param {string} params.adminId - ID of admin who performed the action
 * @param {Object} params.oldData - Previous state of the entity
 * @param {Object} params.newData - New state of the entity
 * @param {string} params.ipAddress - IP address of the request
 * @param {string} params.userAgent - User agent string
 */
async function logAction({
  action,
  entityType,
  entityId,
  adminId,
  oldData = null,
  newData = null,
  ipAddress = null,
  userAgent = null
}) {
  try {
    await AuditLog.create({
      action,
      entity_type: entityType,
      entity_id: entityId,
      performed_by_admin_id: adminId,
      old_data: oldData,
      new_data: newData,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } catch (error) {
    console.error('Error logging audit action:', error);
  }
}

/**
 * Get audit logs for a specific entity
 * @param {string} entityType - Type of entity
 * @param {string} entityId - ID of the entity
 * @returns {Promise<Array>} Array of audit log entries
 */
async function getEntityAuditLogs(entityType, entityId) {
  return await AuditLog.findAll({
    where: {
      entity_type: entityType,
      entity_id: entityId
    },
    include: [
      {
        association: 'performedBy',
        attributes: ['id', 'name', 'email', 'role']
      }
    ],
    order: [['created_at', 'DESC']]
  });
}

/**
 * Get audit logs for a specific admin user
 * @param {string} adminId - ID of the admin user
 * @param {number} limit - Number of records to return
 * @returns {Promise<Array>} Array of audit log entries
 */
async function getAdminAuditLogs(adminId, limit = 100) {
  return await AuditLog.findAll({
    where: {
      performed_by_admin_id: adminId
    },
    order: [['created_at', 'DESC']],
    limit
  });
}

module.exports = {
  logAction,
  getEntityAuditLogs,
  getAdminAuditLogs
};

