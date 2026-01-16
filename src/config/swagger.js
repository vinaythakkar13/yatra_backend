/**
 * Swagger/OpenAPI Configuration
 * Auto-generates API documentation from JSDoc comments
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Yatra Event Management System API',
      version: '1.0.0',
      description: `
        Comprehensive REST API for managing pilgrimage events, accommodations, and participant registrations.
        
        ## Features
        - Hotel and Room Management
        - User/Pilgrim Registration
        - Event Management
        - Boarding Points
        - Admin Authentication
        - Audit Logging
        
        ## Authentication
        Most endpoints require JWT Bearer token authentication.
        Use the /api/auth/login endpoint to get your token.
      `,
      contact: {
        name: 'Yatra Support',
        email: 'support@yatra.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:{port}',
        description: 'Development server',
        variables: {
          port: {
            default: '5000'
          }
        }
      },
      {
        url: 'https://api.yatra.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        // Common response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'object'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  example: 100
                },
                page: {
                  type: 'integer',
                  example: 1
                },
                limit: {
                  type: 'integer',
                  example: 10
                },
                totalPages: {
                  type: 'integer',
                  example: 10
                }
              }
            }
          }
        },
        // Entity schemas
        Hotel: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            name: {
              type: 'string',
              example: 'Yatra Niwas'
            },
            address: {
              type: 'string',
              example: 'Main Street, Pilgrimage City, State - 123456'
            },
            map_link: {
              type: 'string',
              example: 'https://maps.google.com/?q=yatra+niwas'
            },
            total_floors: {
              type: 'integer',
              example: 2
            },
            floors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  floorNumber: { type: 'string' },
                  numberOfRooms: { type: 'integer' },
                  roomNumbers: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            total_rooms: {
              type: 'integer',
              example: 10
            },
            occupied_rooms: {
              type: 'integer',
              example: 3
            },
            available_rooms: {
              type: 'integer',
              example: 7
            },
            is_active: {
              type: 'boolean',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Room: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            room_number: {
              type: 'string',
              example: '101'
            },
            floor: {
              type: 'string',
              example: '1'
            },
            hotel_id: {
              type: 'string',
              format: 'uuid'
            },
            is_occupied: {
              type: 'boolean',
              example: false
            },
            assigned_to_user_id: {
              type: 'string',
              format: 'uuid',
              nullable: true
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            contact_number: {
              type: 'string',
              example: '+919876543210'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              example: 'male'
            },
            age: {
              type: 'integer',
              example: 35
            },
            number_of_persons: {
              type: 'integer',
              example: 2
            },
            pnr: {
              type: 'string',
              example: 'PNR1234567'
            },
            boarding_state: {
              type: 'string',
              example: 'Maharashtra'
            },
            boarding_city: {
              type: 'string',
              example: 'Mumbai'
            },
            boarding_point: {
              type: 'string',
              example: 'Dadar Station'
            },
            arrival_date: {
              type: 'string',
              format: 'date',
              example: '2025-11-01'
            },
            return_date: {
              type: 'string',
              format: 'date',
              example: '2025-11-10'
            },
            registration_status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'checked_in', 'cancelled'],
              example: 'confirmed'
            },
            is_room_assigned: {
              type: 'boolean',
              example: false
            }
          }
        },
        Event: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Morning Prayer'
            },
            description: {
              type: 'string',
              example: 'Daily morning prayer session'
            },
            event_type: {
              type: 'string',
              enum: ['religious', 'cultural', 'tour', 'other'],
              example: 'religious'
            },
            event_date: {
              type: 'string',
              format: 'date',
              example: '2025-11-05'
            },
            start_time: {
              type: 'string',
              format: 'time',
              example: '06:00:00'
            },
            end_time: {
              type: 'string',
              format: 'time',
              example: '07:00:00'
            },
            location: {
              type: 'string',
              example: 'Main Temple'
            },
            max_participants: {
              type: 'integer',
              example: 100
            },
            registered_count: {
              type: 'integer',
              example: 45
            },
            status: {
              type: 'string',
              enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
              example: 'upcoming'
            }
          }
        },
        AdminUser: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@yatra.com'
            },
            name: {
              type: 'string',
              example: 'Admin User'
            },
            role: {
              type: 'string',
              enum: ['super_admin', 'admin', 'staff'],
              example: 'admin'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['users.read', 'users.write']
            },
            is_active: {
              type: 'boolean',
              example: true
            }
          }
        },
        CloudinaryUploadResponse: {
          type: 'object',
          properties: {
            public_id: {
              type: 'string',
              example: 'yatra/tickets/ticket_123',
              description: 'Cloudinary public ID'
            },
            secure_url: {
              type: 'string',
              format: 'uri',
              example: 'https://res.cloudinary.com/daumhjcpy/image/upload/v1234567890/yatra/tickets/ticket_123.jpg',
              description: 'HTTPS URL of the uploaded image'
            },
            url: {
              type: 'string',
              format: 'uri',
              example: 'http://res.cloudinary.com/daumhjcpy/image/upload/v1234567890/yatra/tickets/ticket_123.jpg',
              description: 'HTTP URL of the uploaded image'
            },
            width: {
              type: 'integer',
              example: 1920,
              description: 'Image width in pixels'
            },
            height: {
              type: 'integer',
              example: 1080,
              description: 'Image height in pixels'
            },
            format: {
              type: 'string',
              example: 'jpg',
              description: 'Image format'
            },
            bytes: {
              type: 'integer',
              example: 245678,
              description: 'Image size in bytes'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Upload timestamp'
            },
            resource_type: {
              type: 'string',
              example: 'image',
              description: 'Resource type (image, video, raw)'
            }
          }
        },
        ImageUploadRequest: {
          type: 'object',
          required: ['imageUrl'],
          properties: {
            imageUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/image.jpg',
              description: 'URL of the image to upload'
            },
            folder: {
              type: 'string',
              example: 'yatra/tickets',
              description: 'Cloudinary folder path (optional)',
              default: 'yatra'
            },
            public_id: {
              type: 'string',
              example: 'ticket_123',
              description: 'Custom public ID (optional)'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['ticket', 'user_upload'],
              description: 'Tags for organization (optional)'
            }
          }
        },
        Base64UploadRequest: {
          type: 'object',
          required: ['base64Image'],
          properties: {
            base64Image: {
              type: 'string',
              example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
              description: 'Base64 encoded image string'
            },
            folder: {
              type: 'string',
              example: 'yatra/profiles',
              description: 'Cloudinary folder path (optional)',
              default: 'yatra'
            },
            public_id: {
              type: 'string',
              example: 'profile_user_123',
              description: 'Custom public ID (optional)'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['profile', 'user_upload'],
              description: 'Tags for organization (optional)'
            }
          }
        },
        MultipleImageUploadRequest: {
          type: 'object',
          required: ['imageUrls'],
          properties: {
            imageUrls: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              },
              example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
              description: 'Array of image URLs to upload'
            },
            folder: {
              type: 'string',
              example: 'yatra/tickets',
              description: 'Cloudinary folder path (optional)',
              default: 'yatra'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['ticket', 'batch_upload'],
              description: 'Tags for organization (optional)'
            }
          }
        },
        OptimizedImageUrl: {
          type: 'object',
          properties: {
            original: {
              type: 'string',
              format: 'uri',
              description: 'Original image URL'
            },
            optimized: {
              type: 'string',
              format: 'uri',
              description: 'Optimized image URL with auto format and quality'
            },
            thumbnail: {
              type: 'string',
              format: 'uri',
              description: 'Thumbnail URL (square, 200x200)'
            },
            public_id: {
              type: 'string',
              description: 'Cloudinary public ID'
            }
          }
        },
        ImageDeleteRequest: {
          type: 'object',
          required: ['public_id'],
          properties: {
            public_id: {
              type: 'string',
              example: 'yatra/tickets/ticket_123',
              description: 'Cloudinary public ID of the image to delete'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check and API info endpoints'
      },
      {
        name: 'Authentication',
        description: 'Admin authentication endpoints'
      },
      {
        name: 'Hotels',
        description: 'Hotel management endpoints'
      },
      {
        name: 'Rooms',
        description: 'Room management and assignment endpoints'
      },
      {
        name: 'Users',
        description: 'Pilgrim/user registration and management'
      },
      {
        name: 'Events',
        description: 'Event management and participation'
      },
      {
        name: 'Boarding Points',
        description: 'Boarding point management'
      },
      {
        name: 'Admin',
        description: 'Admin user management'
      },
      {
        name: 'Audit',
        description: 'Audit log endpoints'
      },
      {
        name: 'Cloudinary',
        description: 'Image upload and management using Cloudinary'
      }
    ]
  },
  // Path to the API routes
  apis: [
    './src/routes/*.js',
    './src/routes/*.ts',
    './src/server.js',
    './src/controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

