# Yatra Registration API - cURL Examples

## Create Registration

### Basic Registration (Public Endpoint)

```bash
curl -X POST 'http://localhost:5000/api/registrations' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "pnr": "4829635210",
    "name": "Vinay Thakkar",
    "whatsappNumber": "9737050180",
    "numberOfPersons": 3,
    "yatraId": "4913292c-60c9-4372-ab51-7962281611bf",
    "persons": [
      {
        "name": "Vinay Thakkar",
        "age": 27,
        "gender": "male",
        "isHandicapped": false
      },
      {
        "name": "Bhartiben Thakkar",
        "age": 61,
        "gender": "female",
        "isHandicapped": false
      },
      {
        "name": "Ujita Thakkar",
        "age": 32,
        "gender": "female",
        "isHandicapped": false
      }
    ],
    "boardingPoint": {
      "city": "Bhavnagar",
      "state": "GUJARAT"
    },
    "arrivalDate": "2026-03-23T18:30:00.000Z",
    "returnDate": "2026-03-25T18:30:00.000Z",
    "ticketImages": [
      "https://example.com/ticket1.jpg",
      "https://example.com/ticket2.jpg"
    ]
  }'
```

### Registration with Cloudinary Image URLs

```bash
curl -X POST 'http://localhost:5000/api/registrations' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "pnr": "4829635210",
    "name": "Vinay Thakkar",
    "whatsappNumber": "9737050180",
    "numberOfPersons": 3,
    "yatraId": "4913292c-60c9-4372-ab51-7962281611bf",
    "persons": [
      {
        "name": "Vinay Thakkar",
        "age": 27,
        "gender": "male",
        "isHandicapped": false
      },
      {
        "name": "Bhartiben Thakkar",
        "age": 61,
        "gender": "female",
        "isHandicapped": false
      },
      {
        "name": "Ujita Thakkar",
        "age": 32,
        "gender": "female",
        "isHandicapped": false
      }
    ],
    "boardingPoint": {
      "city": "Bhavnagar",
      "state": "GUJARAT"
    },
    "arrivalDate": "2026-03-23T18:30:00.000Z",
    "returnDate": "2026-03-25T18:30:00.000Z",
    "ticketImages": [
      "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ticket1.jpg",
      "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ticket2.jpg"
    ]
  }'
```

### Registration without Ticket Images (Optional)

```bash
curl -X POST 'http://localhost:5000/api/registrations' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "pnr": "4829635210",
    "name": "Vinay Thakkar",
    "whatsappNumber": "9737050180",
    "numberOfPersons": 3,
    "yatraId": "4913292c-60c9-4372-ab51-7962281611bf",
    "persons": [
      {
        "name": "Vinay Thakkar",
        "age": 27,
        "gender": "male",
        "isHandicapped": false
      },
      {
        "name": "Bhartiben Thakkar",
        "age": 61,
        "gender": "female",
        "isHandicapped": false
      },
      {
        "name": "Ujita Thakkar",
        "age": 32,
        "gender": "female",
        "isHandicapped": false
      }
    ],
    "boardingPoint": {
      "city": "Bhavnagar",
      "state": "GUJARAT"
    },
    "arrivalDate": "2026-03-23T18:30:00.000Z",
    "returnDate": "2026-03-25T18:30:00.000Z"
  }'
```

## Update Registration (Requires Authentication)

```bash
curl -X PUT 'http://localhost:5000/api/registrations/{registration-id}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "name": "Vinay Thakkar Updated",
    "whatsappNumber": "9737050181",
    "numberOfPersons": 3,
    "persons": [
      {
        "name": "Vinay Thakkar",
        "age": 28,
        "gender": "male",
        "isHandicapped": false
      },
      {
        "name": "Bhartiben Thakkar",
        "age": 61,
        "gender": "female",
        "isHandicapped": false
      },
      {
        "name": "Ujita Thakkar",
        "age": 32,
        "gender": "female",
        "isHandicapped": false
      }
    ],
    "boardingPoint": {
      "city": "Ahmedabad",
      "state": "GUJARAT"
    },
    "arrivalDate": "2026-03-24T18:30:00.000Z",
    "returnDate": "2026-03-26T18:30:00.000Z",
    "ticketImages": [
      "https://example.com/updated-ticket.jpg"
    ]
  }'
```

## Cancel Registration (Requires Authentication)

```bash
curl -X POST 'http://localhost:5000/api/registrations/{registration-id}/cancel' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "reason": "Change of plans, unable to attend"
  }'
```

## Get All Registrations (Admin Only)

```bash
curl -X GET 'http://localhost:5000/api/registrations?page=1&limit=10&status=pending&yatraId=4913292c-60c9-4372-ab51-7962281611bf' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN'
```

## Get Single Registration (Admin Only)

```bash
curl -X GET 'http://localhost:5000/api/registrations/{registration-id}' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN'
```

## Approve Registration (Admin Only)

```bash
curl -X POST 'http://localhost:5000/api/registrations/{registration-id}/approve' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN' \
  -d '{
    "comments": "All documents verified and approved"
  }'
```

## Reject Registration (Admin Only)

```bash
curl -X POST 'http://localhost:5000/api/registrations/{registration-id}/reject' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN' \
  -d '{
    "reason": "Ticket image is not valid or unclear",
    "comments": "Please upload clear ticket images"
  }'
```

## Get Registration Logs (Admin Only)

```bash
curl -X GET 'http://localhost:5000/api/registrations/{registration-id}/logs' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN'
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Registration created successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "yatra_id": "uuid",
    "pnr": "4829635210",
    "name": "Vinay Thakkar",
    "whatsapp_number": "9737050180",
    "number_of_persons": 3,
    "boarding_city": "Bhavnagar",
    "boarding_state": "GUJARAT",
    "arrival_date": "2026-03-23",
    "return_date": "2026-03-25",
    "ticket_images": ["url1", "url2"],
    "status": "pending",
    "persons": [
      {
        "id": "uuid",
        "name": "Vinay Thakkar",
        "age": 27,
        "gender": "male",
        "is_handicapped": false
      }
    ],
    "yatra": {
      "id": "uuid",
      "name": "Yatra Name",
      "start_date": "2026-03-23",
      "end_date": "2026-03-25"
    },
    "created_at": "2026-01-12T10:00:00.000Z",
    "updated_at": "2026-01-12T10:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "statusCode": 400
}
```

## Field Requirements

### Required Fields:
- `pnr`: String, exactly 10 digits
- `name`: String, not empty
- `whatsappNumber`: String, 10-15 digits
- `numberOfPersons`: Integer, minimum 1
- `yatraId`: UUID, must be a valid yatra ID
- `persons`: Array, must match `numberOfPersons`
  - Each person requires: `name`, `age` (1-120), `gender` (male/female/other)
- `boardingPoint`: Object with `city` and `state`
- `arrivalDate`: ISO date string
- `returnDate`: ISO date string

### Optional Fields:
- `ticketImages`: Array of image URLs
- `isHandicapped`: Boolean (default: false) for each person

## Notes

1. **PNR Validation**: PNR must be exactly 10 digits
2. **Yatra Validation**: The yatra must exist and registration must be open (between `registration_start_date` and `registration_end_date`)
3. **PNR Uniqueness**: Each PNR can only register once per yatra
4. **Status Flow**: 
   - Created → `pending`
   - Admin approves → `approved`
   - Admin rejects → `rejected`
   - User cancels → `cancelled`
5. **Update Behavior**: If an approved registration is updated, it reverts to `pending` status
6. **Audit Trail**: All actions are logged in `registration_logs` table
