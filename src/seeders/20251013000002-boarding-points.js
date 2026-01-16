/**
 * Seeder - Boarding Points
 * Creates initial boarding/pickup points across India
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const boardingPoints = [
      {
        id: uuidv4(),
        state: 'Maharashtra',
        city: 'Mumbai',
        point_name: 'Dadar Station',
        address: 'Dadar East, Mumbai - 400014',
        contact_person: 'Ramesh Kumar',
        contact_number: '+919876543211',
        latitude: 19.0176,
        longitude: 72.8481,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        state: 'Maharashtra',
        city: 'Mumbai',
        point_name: 'Bandra Station',
        address: 'Bandra West, Mumbai - 400050',
        contact_person: 'Suresh Patil',
        contact_number: '+919876543212',
        latitude: 19.0544,
        longitude: 72.8410,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        state: 'Maharashtra',
        city: 'Pune',
        point_name: 'Shivajinagar',
        address: 'Shivajinagar Bus Stand, Pune - 411005',
        contact_person: 'Prakash Joshi',
        contact_number: '+919876543213',
        latitude: 18.5308,
        longitude: 73.8475,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        state: 'Gujarat',
        city: 'Ahmedabad',
        point_name: 'Central Bus Stand',
        address: 'Geeta Mandir, Ahmedabad - 380022',
        contact_person: 'Jignesh Shah',
        contact_number: '+919876543214',
        latitude: 23.0225,
        longitude: 72.5714,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        state: 'Gujarat',
        city: 'Surat',
        point_name: 'Railway Station',
        address: 'Surat Railway Station - 395003',
        contact_person: 'Bhavesh Patel',
        contact_number: '+919876543215',
        latitude: 21.2051,
        longitude: 72.8410,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        state: 'Rajasthan',
        city: 'Jaipur',
        point_name: 'Sindhi Camp',
        address: 'Sindhi Camp Bus Stand, Jaipur - 302001',
        contact_person: 'Vikram Singh',
        contact_number: '+919876543216',
        latitude: 26.9124,
        longitude: 75.7873,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        state: 'Delhi',
        city: 'New Delhi',
        point_name: 'ISBT Kashmere Gate',
        address: 'Kashmere Gate, Delhi - 110006',
        contact_person: 'Rajesh Verma',
        contact_number: '+919876543217',
        latitude: 28.6692,
        longitude: 77.2281,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        state: 'Uttar Pradesh',
        city: 'Lucknow',
        point_name: 'Charbagh',
        address: 'Charbagh Railway Station, Lucknow - 226004',
        contact_person: 'Amit Mishra',
        contact_number: '+919876543218',
        latitude: 26.8381,
        longitude: 80.9216,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('boarding_points', boardingPoints, {});
    console.log(`✅ Inserted ${boardingPoints.length} boarding points`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('boarding_points', null, {});
  }
};

