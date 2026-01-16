# Hotel Creation API - Complete Documentation

## Endpoint
**POST** `/api/hotels`

**Base URL:** `http://localhost:5000`

**Authentication:** Bearer Token (Optional but recommended)

---

## Complete Request Payload

### All Supported Fields

```json
{
  // ========== REQUIRED FIELDS ==========
  "yatra": "4913292c-60c9-4372-ab51-7962281611bf",  // UUID of the yatra
  "name": "Iris Wilson Hotel",                      // Hotel name
  "address": "123 Temple Road, Holy City",          // Full address

  // ========== OPTIONAL HOTEL INFORMATION ==========
  "mapLink": "https://maps.google.com/?q=iris+wilson+hotel",  // Map URL
  "distanceFromBhavan": "2.5 km",                  // Distance from bhavan
  "hotelType": "A",                                 // Hotel classification (A, B, C, etc.)
  "managerName": "Amaya Duncan",                    // Hotel manager name
  "managerContact": "9737050180",                   // Manager contact number
  "hasElevator": true,                              // Boolean: Has elevator?

  // ========== BOOKING PERIOD ==========
  "numberOfDays": 3,                                // Number of days
  "startDate": "2026-03-23T18:30:00.000Z",         // Booking start date (ISO format)
  "endDate": "2026-03-25T18:30:00.000Z",           // Booking end date (ISO format)
  "checkInTime": "14:00",                           // Check-in time (HH:mm format)
  "checkOutTime": "11:00",                          // Check-out time (HH:mm format)

  // ========== FLOOR AND ROOM STRUCTURE ==========
  "totalFloors": 2,                                 // Total number of floors (auto-calculated if floors provided)
  
  "floors": [                                       // Nested floor structure
    {
      "floorNumber": "1",                           // Floor identifier
      "numberOfRooms": 2,                           // Number of rooms on this floor
      "roomNumbers": ["102", "103"],                // Array of room numbers
      "rooms": [                                    // Room details for this floor
        {
          "roomNumber": "",                         // Can be empty (uses roomNumbers array)
          "toiletType": "western",                  // "western" or "indian"
          "numberOfBeds": 4,
          "chargePerDay": 5000
        },
        {
          "roomNumber": "",
          "toiletType": "western",
          "numberOfBeds": 4,
          "chargePerDay": 4500
        }
      ]
    },
    {
      "floorNumber": "2",
      "numberOfRooms": 1,
      "roomNumbers": ["205"],
      "rooms": [
        {
          "roomNumber": "",
          "toiletType": "western",
          "numberOfBeds": 2,
          "chargePerDay": 1050
        }
      ]
    }
  ],

  // ========== FLAT ROOMS ARRAY (Alternative/Additional) ==========
  "rooms": [                                        // Flat array of rooms (alternative structure)
    {
      "id": "room-1765976691644",
      "roomNumber": "102",
      "floor": 1,
      "toiletType": "western",
      "numberOfBeds": 4,
      "chargePerDay": 5000,
      "isOccupied": false
    },
    {
      "id": "room-1765976691645",
      "roomNumber": "103",
      "floor": 1,
      "toiletType": "western",
      "numberOfBeds": 4,
      "chargePerDay": 4500,
      "isOccupied": false
    },
    {
      "id": "room-1765976691646",
      "roomNumber": "205",
      "floor": 2,
      "toiletType": "western",
      "numberOfBeds": 2,
      "chargePerDay": 1050,
      "isOccupied": false
    }
  ]
}
```

---

## Field Reference

### Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `yatra` | UUID (string) | ID of the yatra this hotel belongs to |
| `name` | string | Hotel name (must be unique) |
| `address` | string | Full address of the hotel |

### Optional Hotel Information Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `mapLink` / `map_link` | string | Google Maps or other map URL | `"https://maps.google.com/?q=hotel"` |
| `distanceFromBhavan` / `distance_from_bhavan` | string | Distance from bhavan | `"2.5 km"`, `"5 miles"` |
| `hotelType` / `hotel_type` | string | Hotel classification | `"A"`, `"B"`, `"C"` |
| `managerName` / `manager_name` | string | Hotel manager name | `"John Doe"` |
| `managerContact` / `manager_contact` | string | Manager contact number | `"+919876543210"` |
| `hasElevator` / `has_elevator` | boolean | Whether hotel has elevator | `true`, `false` (default: `false`) |

### Booking Period Fields
| Field | Type | Description | Format |
|-------|------|-------------|--------|
| `numberOfDays` / `number_of_days` | integer | Number of days for booking | `3` |
| `startDate` / `start_date` | string | Booking start date | ISO 8601: `"2026-03-23T18:30:00.000Z"` |
| `endDate` / `end_date` | string | Booking end date | ISO 8601: `"2026-03-25T18:30:00.000Z"` |
| `checkInTime` / `check_in_time` | string | Check-in time | `"14:00"` (HH:mm) |
| `checkOutTime` / `check_out_time` | string | Check-out time | `"11:00"` (HH:mm) |

### Floor and Room Fields
| Field | Type | Description |
|-------|------|-------------|
| `totalFloors` / `total_floors` | integer | Total number of floors (auto-calculated if `floors` provided) |
| `floors` | array | Array of floor objects (see structure below) |
| `rooms` | array | Flat array of room objects (alternative structure) |

### Floor Object Structure
```json
{
  "floorNumber": "1",           // Floor identifier (string)
  "numberOfRooms": 2,           // Number of rooms on this floor
  "roomNumbers": ["102", "103"], // Array of room number strings
  "rooms": [                     // Array of room detail objects
    {
      "roomNumber": "",          // Can be empty
      "toiletType": "western",   // "western" or "indian"
      "numberOfBeds": 4,         // Number of beds
      "chargePerDay": 5000       // Daily charge (number)
    }
  ]
}
```

### Room Object Structure (Flat Array)
```json
{
  "roomNumber": "102",           // Required: Room number
  "floor": 1,                    // Floor number
  "toiletType": "western",       // "western" or "indian"
  "numberOfBeds": 4,             // Number of beds
  "chargePerDay": 5000,          // Daily charge
  "isOccupied": false            // Occupancy status
}
```

---

## Field Name Flexibility

The API accepts **both camelCase and snake_case** for field names:

✅ **camelCase:** `mapLink`, `distanceFromBhavan`, `hotelType`, `numberOfDays`, `startDate`, `endDate`, `checkInTime`, `checkOutTime`, `hasElevator`, `totalFloors`

✅ **snake_case:** `map_link`, `distance_from_bhavan`, `hotel_type`, `number_of_days`, `start_date`, `end_date`, `check_in_time`, `check_out_time`, `has_elevator`, `total_floors`

**Both formats work!** Use whichever is convenient for your frontend.

---

## Complete cURL Example

```bash
curl -X POST http://localhost:5000/api/hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "yatra": "4913292c-60c9-4372-ab51-7962281611bf",
    "name": "Iris Wilson Hotel",
    "address": "123 Temple Road, Holy City",
    "mapLink": "https://maps.google.com/?q=iris+wilson+hotel",
    "distanceFromBhavan": "2.5 km",
    "hotelType": "A",
    "managerName": "Amaya Duncan",
    "managerContact": "9737050180",
    "numberOfDays": 3,
    "startDate": "2026-03-23T18:30:00.000Z",
    "endDate": "2026-03-25T18:30:00.000Z",
    "checkInTime": "14:00",
    "checkOutTime": "11:00",
    "hasElevator": true,
    "totalFloors": 2,
    "floors": [
      {
        "floorNumber": "1",
        "numberOfRooms": 2,
        "roomNumbers": ["102", "103"],
        "rooms": [
          {
            "roomNumber": "",
            "toiletType": "western",
            "numberOfBeds": 4,
            "chargePerDay": 5000
          },
          {
            "roomNumber": "",
            "toiletType": "western",
            "numberOfBeds": 4,
            "chargePerDay": 4500
          }
        ]
      }
    ],
    "rooms": [
      {
        "roomNumber": "102",
        "floor": 1,
        "toiletType": "western",
        "numberOfBeds": 4,
        "chargePerDay": 5000,
        "isOccupied": false
      },
      {
        "roomNumber": "103",
        "floor": 1,
        "toiletType": "western",
        "numberOfBeds": 4,
        "chargePerDay": 4500,
        "isOccupied": false
      }
    ]
  }'
```

---

## Response Format

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Hotel created successfully with all rooms and pricing",
  "data": {
    "id": "hotel-uuid-here",
    "yatra_id": "4913292c-60c9-4372-ab51-7962281611bf",
    "name": "Iris Wilson Hotel",
    "address": "123 Temple Road, Holy City",
    "map_link": "https://maps.google.com/?q=iris+wilson+hotel",
    "distance_from_bhavan": "2.5 km",
    "hotel_type": "A",
    "manager_name": "Amaya Duncan",
    "manager_contact": "9737050180",
    "number_of_days": 3,
    "start_date": "2026-03-23T18:30:00.000Z",
    "end_date": "2026-03-25T18:30:00.000Z",
    "check_in_time": "14:00",
    "check_out_time": "11:00",
    "has_elevator": true,
    "total_floors": 2,
    "rooms": [
      {
        "id": "room-uuid",
        "room_number": "102",
        "floor": "1",
        "toilet_type": "western",
        "number_of_beds": 4,
        "charge_per_day": 5000,
        "is_occupied": false
      }
    ],
    "yatra": {
      "id": "4913292c-60c9-4372-ab51-7962281611bf",
      "name": "Yatra Name",
      "start_date": "2026-03-20T00:00:00.000Z",
      "end_date": "2026-03-30T00:00:00.000Z"
    }
  }
}
```

### Error Responses

**400 Bad Request** - Missing required fields
```json
{
  "success": false,
  "message": "Missing required fields: yatra, name, and address are required"
}
```

**404 Not Found** - Yatra doesn't exist
```json
{
  "success": false,
  "message": "Yatra not found"
}
```

---

## Important Notes

1. **Yatra Validation:** The endpoint verifies that the provided `yatra` ID exists before creating the hotel.

2. **Room Matching Logic:** If both `floors` and `rooms` arrays are provided, the endpoint matches room numbers from `floors.roomNumbers` with details from the flat `rooms` array.

3. **Default Values:** If room details are missing, defaults are applied:
   - `toiletType`: "western"
   - `numberOfBeds`: 1
   - `chargePerDay`: 0
   - `isOccupied`: false

4. **Auto-calculation:** `totalFloors` is automatically calculated from the `floors` array length if not provided.

5. **All fields are saved:** All provided fields (including `distanceFromBhavan`, `mapLink`, `numberOfDays`, `startDate`, `endDate`, `checkInTime`, `checkOutTime`) are saved to the database.
