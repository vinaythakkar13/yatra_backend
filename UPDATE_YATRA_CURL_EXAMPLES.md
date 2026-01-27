# Yatra Update Endpoint - CURL Examples

## Base URL

```
http://localhost:3000/api/yatra
```

## 1. Update Full Yatra (All Fields)

```bash
curl -X PUT http://localhost:3000/api/yatra/update-yatra/{yatraId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -d '{
    "name": "Updated Yatra Name",
    "banner_image": "https://example.com/updated-banner.jpg",
    "mobile_banner_image": "https://example.com/updated-mobile-banner.jpg",
    "start_date": "2025-12-01T00:00:00.000Z",
    "end_date": "2025-12-10T00:00:00.000Z",
    "registration_start_date": "2025-11-01T00:00:00.000Z",
    "registration_end_date": "2025-11-25T00:00:00.000Z",
    "description": "Updated description for the yatra"
  }'
```

## 2. Update Only Mobile Banner Image (Partial Update)

```bash
curl -X PUT http://localhost:3000/api/yatra/update-yatra/{yatraId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -d '{
    "mobile_banner_image": "https://example.com/new-mobile-banner.jpg"
  }'
```

## 3. Update Name and Banner Images Only

```bash
curl -X PUT http://localhost:3000/api/yatra/update-yatra/{yatraId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -d '{
    "name": "New Yatra Name",
    "banner_image": "https://example.com/new-banner.jpg",
    "mobile_banner_image": "https://example.com/new-mobile-banner.jpg"
  }'
```

## 4. Update Dates Only

```bash
curl -X PUT http://localhost:3000/api/yatra/update-yatra/{yatraId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -d '{
    "start_date": "2025-12-15T00:00:00.000Z",
    "end_date": "2025-12-20T00:00:00.000Z",
    "registration_start_date": "2025-11-15T00:00:00.000Z",
    "registration_end_date": "2025-12-01T00:00:00.000Z"
  }'
```

## 5. Update Description Only

```bash
curl -X PUT http://localhost:3000/api/yatra/update-yatra/{yatraId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -d '{
    "description": "New updated description"
  }'
```

## Response Format (Success)

```json
{
  "success": true,
  "message": "Yatra updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Yatra Name",
    "banner_image": "https://example.com/updated-banner.jpg",
    "mobile_banner_image": "https://example.com/updated-mobile-banner.jpg",
    "start_date": "2025-12-01T00:00:00.000Z",
    "end_date": "2025-12-10T00:00:00.000Z",
    "registration_start_date": "2025-11-01T00:00:00.000Z",
    "registration_end_date": "2025-11-25T00:00:00.000Z",
    "description": "Updated description for the yatra",
    "created_at": "2026-01-24T10:00:00.000Z",
    "updated_at": "2026-01-24T11:30:00.000Z"
  }
}
```

## Response Format (Error - Yatra Not Found)

```json
{
  "message": "Yatra not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## Important Notes

- Replace `{yatraId}` with the actual yatra UUID
- Replace `{YOUR_JWT_TOKEN}` with your actual JWT authentication token
- All fields are optional - send only the fields you want to update
- The endpoint will only update provided fields, leaving others unchanged
- `mobile_banner_image` is optional and can be null
- All date fields accept ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- Authentication required: super_admin or admin role
- Content-Type header must be `application/json`

## JavaScript/Fetch Example

```javascript
const yatraId = "550e8400-e29b-41d4-a716-446655440000";
const token = "YOUR_JWT_TOKEN";

const updateYatra = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/yatra/update-yatra/${yatraId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mobile_banner_image: "https://example.com/new-mobile-banner.jpg",
          description: "Updated description",
        }),
      },
    );

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
};

updateYatra();
```

## Axios Example

```javascript
const axios = require("axios");

const yatraId = "550e8400-e29b-41d4-a716-446655440000";
const token = "YOUR_JWT_TOKEN";

axios
  .put(
    `http://localhost:3000/api/yatra/update-yatra/${yatraId}`,
    {
      mobile_banner_image: "https://example.com/new-mobile-banner.jpg",
      description: "Updated description",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  )
  .then((response) => console.log(response.data))
  .catch((error) => console.error("Error:", error));
```
