# Get Registration by PNR - API Documentation

## Endpoint
```
GET /api/registrations/by-pnr/:pnr
```

**Authentication Required:** No (Public endpoint)

**Description:** Get registration details by PNR number. Returns registration information, yatra details, and hotel/room information if assigned.

---

## cURL Examples

### Basic Request

```bash
curl 'http://localhost:5000/api/registrations/by-pnr/4829635210' \
  -H 'Accept: application/json'
```

### With Full Headers

```bash
curl 'http://localhost:5000/api/registrations/by-pnr/4829635210' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Origin: http://localhost:3000' \
  -H 'Referer: http://localhost:3000/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1' \
  -H 'accept: application/json' \
  -H 'content-type: application/json' \
  -H 'x-client-platform: web' \
  -H 'x-client-version: 1.0.0'
```

---

## URL Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `pnr` | string | Yes | PNR number (exactly 10 digits) | `4829635210` |

---

## Response Structure

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Registration details retrieved successfully",
  "data": {
    "registration": {
      "id": "uuid",
      "pnr": "4829635210",
      "name": "Vinay Thakkar",
      "whatsapp_number": "9737050180",
      "number_of_persons": 3,
      "boarding_city": "Bhavnagar",
      "boarding_state": "GUJARAT",
      "arrival_date": "2026-03-23",
      "return_date": "2026-03-25",
      "ticket_images": ["https://example.com/ticket1.jpg"],
      "status": "pending",
      "cancellation_reason": null,
      "admin_comments": null,
      "rejection_reason": null,
      "created_at": "2026-01-14T12:23:23.000Z",
      "updated_at": "2026-01-14T12:23:23.000Z"
    },
    "persons": [
      {
        "id": "uuid",
        "name": "Vinay Thakkar",
        "age": 27,
        "gender": "male",
        "is_handicapped": false,
        "created_at": "2026-01-14T12:23:23.000Z",
        "updated_at": "2026-01-14T12:23:23.000Z"
      },
      {
        "id": "uuid",
        "name": "Bharti Thakkar",
        "age": 62,
        "gender": "female",
        "is_handicapped": false,
        "created_at": "2026-01-14T12:23:23.000Z",
        "updated_at": "2026-01-14T12:23:23.000Z"
      }
    ],
    "yatra": {
      "id": "4913292c-60c9-4372-ab51-7962281611bf",
      "name": "Yatra Name",
      "banner_image": "https://example.com/banner.jpg",
      "description": "Yatra description",
      "start_date": "2026-03-20T00:00:00.000Z",
      "end_date": "2026-03-30T00:00:00.000Z",
      "registration_start_date": "2026-01-01T00:00:00.000Z",
      "registration_end_date": "2026-03-15T00:00:00.000Z",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    },
    "hotel": {
      "id": "uuid",
      "name": "Hotel Name",
      "address": "Hotel Address",
      "map_link": "https://maps.google.com/...",
      "distance_from_bhavan": "2.5 km",
      "hotel_type": "A",
      "manager_name": "Manager Name",
      "manager_contact": "1234567890",
      "number_of_days": 5,
      "start_date": "2026-03-23T00:00:00.000Z",
      "end_date": "2026-03-28T00:00:00.000Z",
      "check_in_time": "14:00",
      "check_out_time": "11:00",
      "has_elevator": true,
      "total_floors": 5,
      "is_active": true,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    },
    "room": {
      "id": "uuid",
      "room_number": "101",
      "floor": "1",
      "toilet_type": "western",
      "number_of_beds": 2,
      "charge_per_day": 1500.00,
      "is_occupied": true,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

### Response When Room Not Assigned

If the user doesn't have a room assigned, `hotel` and `room` will be `null`:

```json
{
  "success": true,
  "message": "Registration details retrieved successfully",
  "data": {
    "registration": { ... },
    "persons": [ ... ],
    "yatra": { ... },
    "hotel": null,
    "room": null
  }
}
```

### Error Response (404 Not Found)

```json
{
  "success": false,
  "message": "Registration not found for PNR: 4829635210"
}
```

---

## Notes

1. **Public Endpoint**: This endpoint does not require authentication, making it accessible for users to check their registration status using their PNR.

2. **Multiple Registrations**: If multiple registrations exist for the same PNR, the most recent one (by `created_at`) is returned.

3. **Hotel and Room**: The `hotel` and `room` fields will only be populated if:
   - The user has an `assigned_room_id`
   - The room exists and is linked to a hotel
   - Otherwise, both fields will be `null`

4. **Yatra Information**: Always returns yatra details based on the `yatra_id` from the registration.

5. **Persons**: Returns all persons associated with the registration.

---

## Example Use Cases

### Check Registration Status
```bash
curl 'http://localhost:5000/api/registrations/by-pnr/4829635210' \
  -H 'Accept: application/json'
```

### Check if Room is Assigned
The response will include `hotel` and `room` objects if assigned, or `null` if not assigned.

### Get Yatra Details
The response always includes complete yatra information based on the registration's `yatra_id`.
