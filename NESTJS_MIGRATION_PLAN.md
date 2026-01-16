# NestJS Migration Plan

## Migration Status
- ✅ Dependencies installed
- ✅ Main.ts and AppModule created
- 🔄 Creating TypeORM entities (in progress)
- ⏳ Creating DTOs
- ⏳ Creating Services
- ⏳ Creating Controllers
- ⏳ Creating Guards/Interceptors
- ⏳ Creating Modules
- ⏳ Testing and validation

## File Structure
```
src/
├── main.ts (✅ Created)
├── app.module.ts (✅ Created)
├── app.controller.ts (✅ Created)
├── app.service.ts (✅ Created)
├── entities/ (Creating)
│   ├── yatra.entity.ts
│   ├── hotel.entity.ts
│   ├── room.entity.ts
│   ├── user.entity.ts
│   ├── admin-user.entity.ts
│   ├── admin-session.entity.ts
│   ├── audit-log.entity.ts
│   ├── boarding-point.entity.ts
│   ├── event.entity.ts
│   └── event-participant.entity.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── create-admin.dto.ts
│   │   └── admin-response.dto.ts
│   └── guards/
│       ├── jwt-auth.guard.ts
│       ├── roles.guard.ts
│       └── permissions.guard.ts
├── hotels/ (Similar structure)
├── users/ (Similar structure)
├── yatra/ (Similar structure)
└── cloudinary/ (Similar structure)
```

## Migration Strategy
1. Create all entities with proper relationships
2. Create DTOs with class-validator decorators
3. Create services with business logic preserved
4. Create controllers with proper decorators
5. Create guards/interceptors/filters
6. Wire everything in modules
7. Test build and runtime
