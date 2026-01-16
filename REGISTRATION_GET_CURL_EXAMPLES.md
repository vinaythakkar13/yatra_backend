# Registration GET API - cURL Examples

## Base Endpoint
```
GET /api/registrations
```

**Authentication Required:** Yes (Admin only - Bearer token)

---

## 1. Get All Registrations (with pagination)

```bash
curl 'http://localhost:5000/api/registrations?page=1&limit=10' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Response:**
```json
{
  "success": true,
  "message": "Registrations retrieved successfully",
  "data": [
    {
      "id": "...",
      "pnr": "4829635210",
      "name": "Vinay Thakkar",
      "whatsapp_number": "9737050180",
      "status": "pending",
      "yatra": { ... },
      "user": { ... },
      "persons": [ ... ],
      "logs": [ ... ]
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## 2. Filter by Yatra ID

```bash
curl 'http://localhost:5000/api/registrations?yatraId=4913292c-60c9-4372-ab51-7962281611bf&page=1&limit=10' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Query Parameters:**
- `yatraId` (UUID): Filter registrations by specific yatra
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

---

## 3. Search by Name, PNR, or WhatsApp Number

```bash
# Search by name
curl 'http://localhost:5000/api/registrations?search=Vinay&page=1&limit=10' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Search by PNR
curl 'http://localhost:5000/api/registrations?search=4829635210&page=1&limit=10' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Search by WhatsApp number
curl 'http://localhost:5000/api/registrations?search=9737050180&page=1&limit=10' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Query Parameters:**
- `search` (string): Search across name, PNR, and WhatsApp number fields

---

## 4. Filter by Status

```bash
# Get pending registrations
curl 'http://localhost:5000/api/registrations?status=pending&page=1&limit=10' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Get approved registrations
curl 'http://localhost:5000/api/registrations?status=approved&page=1&limit=10' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Get rejected registrations
curl 'http://localhost:5000/api/registrations?status=rejected&page=1&limit=10' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Get cancelled registrations
curl 'http://localhost:5000/api/registrations?status=cancelled&page=1&limit=10' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Status Values:**
- `pending`
- `approved`
- `rejected`
- `cancelled`

---

## 5. Combined Filters (Yatra ID + Status + Search)

```bash
curl 'http://localhost:5000/api/registrations?yatraId=4913292c-60c9-4372-ab51-7962281611bf&status=pending&search=Vinay&page=1&limit=20' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**This will:**
- Filter by specific yatra ID
- Filter by pending status
- Search for "Vinay" in name, PNR, or WhatsApp number
- Return page 1 with 20 items per page

---

## 6. Filter by PNR (Exact Match)

```bash
curl 'http://localhost:5000/api/registrations?pnr=4829635210&page=1&limit=10' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Note:** `pnr` parameter does exact match, while `search` does partial match

---

## 7. Pagination Examples

```bash
# First page (10 items)
curl 'http://localhost:5000/api/registrations?page=1&limit=10' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Second page (10 items)
curl 'http://localhost:5000/api/registrations?page=2&limit=10' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# First page (50 items)
curl 'http://localhost:5000/api/registrations?page=1&limit=50' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## Complete Example with All Headers

```bash
curl 'http://localhost:5000/api/registrations?yatraId=4913292c-60c9-4372-ab51-7962281611bf&status=pending&search=Vinay&page=1&limit=10' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Origin: http://localhost:3000' \
  -H 'Referer: http://localhost:3000/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1' \
  -H 'accept: application/json' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImM4ZWFhYWNkLWI3OTAtNDc2YS1hNzMwLTkwNjc5MTMxOTNkYyIsImVtYWlsIjoiYWRtaW5AeWF0cmEuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzY4MzkxMTQ5LCJleHAiOjE3Njg0Nzc1NDl9.D9HpZjX__GR7f7MM1etQrmPXUz5LKK5n7RL6yX3J5k8' \
  -H 'content-type: application/json' \
  -H 'x-client-platform: web' \
  -H 'x-client-version: 1.0.0'
```

---

## Query Parameters Summary

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number (default: 1) | `page=1` |
| `limit` | number | No | Items per page (default: 10, max: 100) | `limit=20` |
| `yatraId` | UUID | No | Filter by yatra ID | `yatraId=4913292c-60c9-4372-ab51-7962281611bf` |
| `status` | enum | No | Filter by status (pending, approved, rejected, cancelled) | `status=pending` |
| `pnr` | string | No | Filter by exact PNR match | `pnr=4829635210` |
| `search` | string | No | Search in name, PNR, or WhatsApp number (partial match) | `search=Vinay` |

---

## Response Structure

```json
{
  "success": true,
  "message": "Registrations retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "yatra_id": "uuid",
      "pnr": "string",
      "name": "string",
      "whatsapp_number": "string",
      "number_of_persons": number,
      "boarding_city": "string",
      "boarding_state": "string",
      "arrival_date": "date",
      "return_date": "date",
      "ticket_images": ["url1", "url2"],
      "status": "pending|approved|rejected|cancelled",
      "cancellation_reason": "string|null",
      "admin_comments": "string|null",
      "rejection_reason": "string|null",
      "created_at": "datetime",
      "updated_at": "datetime",
      "user": { ... },
      "yatra": { ... },
      "persons": [ ... ],
      "logs": [ ... ]
    }
  ],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

---

## Notes

1. **Authentication**: All endpoints require a valid JWT token in the `Authorization` header
2. **Admin Only**: Only users with `super_admin` or `admin` roles can access this endpoint
3. **Search**: The `search` parameter performs a case-insensitive partial match across name, PNR, and WhatsApp number
4. **Pagination**: Default page size is 10, maximum is 100
5. **Combined Filters**: You can combine multiple filters (yatraId, status, search, pnr) for more specific results
6. **Sorting**: Results are sorted by `created_at` in descending order (newest first)
