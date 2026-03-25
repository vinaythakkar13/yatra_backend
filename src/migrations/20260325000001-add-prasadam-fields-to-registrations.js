'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'yatra_registrations',
        'prasadam_delivered',
        {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'yatra_registrations',
        'prasadam_delivered_at',
        {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Error in migration 20260325000001-add-prasadam-fields-to-registrations:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('yatra_registrations', 'prasadam_delivered', { transaction });
      await queryInterface.removeColumn('yatra_registrations', 'prasadam_delivered_at', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Error reverting migration 20260325000001-add-prasadam-fields-to-registrations:', error);
      throw error;
    }
  },
};
