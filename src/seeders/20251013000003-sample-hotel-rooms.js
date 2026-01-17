/**
 * Seeder - Sample Hotel and Rooms
 * Creates a sample hotel with rooms for testing
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hotelId = uuidv4();

    // Create hotel
    await queryInterface.bulkInsert('hotels', [
      {
        id: hotelId,
        name: 'Yatra Niwas',
        address: 'Main Street, Pilgrimage City, State - 123456',
        map_link: 'https://maps.google.com/?q=yatra+niwas',
        total_floors: 2,
        floors: JSON.stringify([
          {
            floorNumber: '1',
            numberOfRooms: 5,
            roomNumbers: ['101', '102', '103', '104', '105']
          },
          {
            floorNumber: '2',
            numberOfRooms: 5,
            roomNumbers: ['201', '202', '203', '204', '205']
          }
        ]),
        total_rooms: 10,
        occupied_rooms: 0,
        available_rooms: 10,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Create rooms for the hotel
    const rooms = [];
    const floor1Rooms = ['101', '102', '103', '104', '105'];
    const floor2Rooms = ['201', '202', '203', '204', '205'];

    floor1Rooms.forEach(roomNum => {
      rooms.push({
        id: uuidv4(),
        room_number: roomNum,
        floor: '1',
        hotel_id: hotelId,
        is_occupied: false,
        assigned_to_user_id: null,
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    floor2Rooms.forEach(roomNum => {
      rooms.push({
        id: uuidv4(),
        room_number: roomNum,
        floor: '2',
        hotel_id: hotelId,
        is_occupied: false,
        assigned_to_user_id: null,
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    await queryInterface.bulkInsert('rooms', rooms, {});
    
    console.log(`✅ Created hotel 'Yatra Niwas' with ${rooms.length} rooms`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('rooms', null, {});
    await queryInterface.bulkDelete('hotels', {
      name: 'Yatra Niwas'
    }, {});
  }
};

