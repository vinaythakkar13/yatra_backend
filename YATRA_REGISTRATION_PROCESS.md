# Yatra Registration Process Documentation

## Overview

The Yatra Registration System allows users to register for pilgrimage events (yatras) with comprehensive validation, status management, and audit logging.

## Registration Flow

### 1. Registration Creation Process

#### Endpoint: `POST /api/registrations`

- **Access**: Public (no authentication required)
- **Purpose**: Create a new yatra registration

#### Required Data Structure:

```json
{
  "pnr": "PNR123456",
  "ticketType": "FLIGHT", // Optional
  "name": "Vinay Thakkar",
  "whatsappNumber": "9737050180",
  "numberOfPersons": 3,
  "yatraId": "4913292c-60c9-4372-ab51-7962281611bf",
  "persons": [
    {
      "name": "Vinay Thakkar",
      "age": 27,
      "gender": "male",
      "isHandicapped": false // Optional, defaults to false
    }
  ],
  "boardingPoint": {
    "city": "Bhavnagar",
    "state": "GUJARAT"
  },
  "arrivalDate": "2026-03-23T18:30:00.000Z",
  "returnDate": "2026-03-25T18:30:00.000Z",
  "ticketImages": ["https://example.com/ticket1.jpg"] // Optional
}
```

### 2. Validation Rules

#### PNR Validation:

- **Format**: 6-12 alphanumeric characters (case-insensitive)
- **Uniqueness**: Must be unique per yatra (excluding cancelled registrations)
- **Auto-conversion**: Converted to uppercase for storage

#### WhatsApp Number Validation:

- **Format**: 10-15 digits (with optional + prefix)
- **Pattern**: `^\+?[0-9]{10,15}$`

#### Person Details:

- **Name**: Required, non-empty string
- **Age**: Required integer, minimum 1
- **Gender**: Required enum (`male`, `female`, `other`)
- **Handicapped Status**: Optional boolean, defaults to false

#### Date Validation:

- **Format**: ISO 8601 date string
- **Arrival/Return**: Both required
- **Registration Period**: No time restrictions (can register anytime)

#### Ticket Type Options:

- `FLIGHT` - Flight booking
- `BUS` - Bus booking
- `FIRST_AC` - First AC train
- `SECOND_AC` - Second AC train
- `THIRD_AC` - Third AC train
- `SLEEPER` - Sleeper class train
- `GENERAL` - General class train
- `TBS` - To Be Confirmed
- `WL` - Waiting List
- `RAC` - Reservation Against Cancellation

### 3. Registration Status Flow

#### Status Enum:

1. **PENDING** (Default) - Initial registration status
2. **APPROVED** - Admin approved registration
3. **REJECTED** - Admin rejected registration
4. **CANCELLED** - User or admin cancelled registration

#### Status Transitions:

```
PENDING → APPROVED (Admin action)
PENDING → REJECTED (Admin action)
PENDING → CANCELLED (User/Admin action)
APPROVED → CANCELLED (User/Admin action)
REJECTED → CANCELLED (Admin action)
```

### 4. User Management

#### User Creation/Update:

- **New PNR**: Creates new user with first person's details
- **Existing PNR**: Updates user details with new registration info
- **User Fields**: Name, contact, gender, age, boarding details, dates

### 5. Admin Operations

#### Admin-Only Endpoints:

- `GET /api/registrations` - List all registrations (with filters)
- `GET /api/registrations/:id` - Get specific registration
- `POST /api/registrations/:id/approve` - Approve registration
- `POST /api/registrations/:id/reject` - Reject registration
- `GET /api/registrations/:id/logs` - View audit logs
- `PATCH /api/registrations/:id/ticket-type` - Update ticket type

#### Admin Authentication:

- **Required**: JWT token with admin/super_admin role
- **Headers**: `Authorization: Bearer <token>`

### 6. Public Endpoints

#### User-Accessible:

- `POST /api/registrations` - Create registration
- `PUT /api/registrations/:id` - Update registration (limited)
- `POST /api/registrations/:id/cancel` - Cancel registration
- `GET /api/registrations/by-pnr/:pnr` - Get registration by PNR

### 7. Audit Logging

#### Automatic Logging:

- **Registration Created**: When new registration is submitted
- **Status Changes**: Approval, rejection, cancellation
- **Updates**: Any modification to registration data
- **Ticket Type Changes**: When admin updates ticket type

#### Log Information:

- **Action Type**: Created, approved, rejected, cancelled, updated
- **Changed By**: Admin ID or user indicator
- **IP Address**: Request origin (truncated to 128 chars)
- **User Agent**: Browser/client information
- **Old/New Data**: Before and after values for changes

### 8. Data Relationships

#### Core Entities:

- **YatraRegistration**: Main registration record
- **Person**: Individual person details (1:many with registration)
- **User**: User profile (linked by PNR)
- **Yatra**: Event details
- **RegistrationLog**: Audit trail

#### Foreign Key Relationships:

```
YatraRegistration → User (user_id)
YatraRegistration → Yatra (yatra_id)
Person → YatraRegistration (registration_id)
RegistrationLog → YatraRegistration (registration_id)
```

### 9. Error Handling

#### Common Errors:

- **400 Bad Request**: Invalid input data, PNR already exists
- **404 Not Found**: Yatra not found, registration not found
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **500 Internal Server Error**: Database or system errors

#### Validation Errors:

- PNR format validation
- Phone number format validation
- Required field validation
- Date format validation
- Enum value validation

### 10. Search and Filtering

#### Available Filters:

- **yatraId**: Filter by specific yatra
- **status**: Filter by registration status
- **pnr**: Exact PNR match
- **state**: Filter by boarding state
- **ticketType**: Filter by ticket type (including "Not added")
- **search**: Search across name, PNR, and WhatsApp number
- **filterMode**:
  - `general` - Exclude cancelled registrations
  - `cancelled` - Only cancelled registrations
  - `all` - All registrations

#### Pagination:

- **page**: Page number (default: 1)
- **limit**: Records per page (default: 10)

### 11. Business Rules

#### Registration Rules:

1. **PNR Uniqueness**: One active registration per PNR per yatra
2. **Person Count**: Must match numberOfPersons field
3. **Date Logic**: Arrival date should be before return date
4. **Status Workflow**: Follows defined status transitions
5. **Cancellation**: Cancelled registrations can be replaced with new ones

#### Admin Rules:

1. **Approval Authority**: Only admins can approve/reject
2. **Audit Trail**: All admin actions are logged
3. **Status Management**: Admins control registration lifecycle
4. **Ticket Type Management**: Admins can update ticket types post-registration

### 12. Integration Points

#### External Dependencies:

- **Cloudinary**: For ticket image storage
- **Database**: MySQL/TiDB for data persistence
- **JWT**: For admin authentication
- **Email/SMS**: For notifications (if implemented)

#### API Response Format:

```json
{
  "success": true,
  "message": "Registration created successfully",
  "data": {
    // Registration object with related data
  }
}
```

This comprehensive system ensures data integrity, proper validation, audit compliance, and smooth user experience for yatra registrations.
