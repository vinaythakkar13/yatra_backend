# Generate Hotel Credentials CURL

This endpoint generates (or regenerates) a unique Login ID and a random password for a hotel.
**Note:** The password is returned in the response ONLY ONCE. Save it immediately.

## Endpoint
`POST /hotels/:id/generate-credentials`

## CURL Command

```bash
curl -X POST "http://localhost:5001/hotels/c961a9bf-1db8-4254-a7af-13ae9a98c0e2/generate-credentials" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Parameters
- `:id`: The UUID of the hotel (e.g., `c961a9bf-1db8-4254-a7af-13ae9a98c0e2`)

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Hotel credentials generated successfully. Save the password — it will not be shown again.",
  "data": {
    "hotel_id": "c961a9bf-1db8-4254-a7af-13ae9a98c0e2",
    "hotel_name": "Example Hotel",
    "login_id": "HTL-0001",
    "password": "random_secure_password"
  }
}
```
