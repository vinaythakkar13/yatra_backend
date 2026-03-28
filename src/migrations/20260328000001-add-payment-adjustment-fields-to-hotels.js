'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('hotels', 'adjustment_amount', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
      after: 'full_payment_paid'
    });

    await queryInterface.addColumn('hotels', 'adjustment_type', {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: 'adjustment_amount'
    });

    await queryInterface.addColumn('hotels', 'payment_comment', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'adjustment_type'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('hotels', 'payment_comment');
    await queryInterface.removeColumn('hotels', 'adjustment_type');
    await queryInterface.removeColumn('hotels', 'adjustment_amount');
  }
};
