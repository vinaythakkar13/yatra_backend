import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { QueryHotelDto } from './dto/query-hotel.dto';
import { AssignRoomDto } from './dto/assign-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) { }

  @Get()
  @ApiOperation({ summary: 'Get all hotels' })
  @ApiResponse({ status: 200, description: 'List of hotels retrieved successfully' })
  async findAll(@Query() query: QueryHotelDto) {
    const result = await this.hotelsService.findAll(query);
    return {
      success: true,
      message: 'Hotels retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hotel by ID' })
  @ApiResponse({ status: 200, description: 'Hotel retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  async findOne(@Param('id') id: string) {
    const hotel = await this.hotelsService.findOne(id);
    return {
      success: true,
      message: 'Hotel retrieved successfully',
      data: hotel,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new hotel' })
  @ApiResponse({ status: 201, description: 'Hotel created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Yatra not found' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createHotelDto: CreateHotelDto) {
    const hotel = await this.hotelsService.create(createHotelDto);
    return {
      success: true,
      message: 'Hotel created successfully with all rooms and pricing',
      data: hotel,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hotel' })
  @ApiResponse({ status: 200, description: 'Hotel updated successfully' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  async update(@Param('id') id: string, @Body() updateHotelDto: UpdateHotelDto) {
    const hotel = await this.hotelsService.update(id, updateHotelDto);
    return {
      success: true,
      message: 'Hotel updated successfully',
      data: hotel,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete hotel' })
  @ApiResponse({ status: 200, description: 'Hotel deleted successfully' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  async remove(@Param('id') id: string) {
    await this.hotelsService.remove(id);
    return {
      success: true,
      message: 'Hotel deleted successfully',
      data: null,
    };
  }

  @Post('assign-room')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign rooms to a registration (Draft)' })
  @ApiResponse({ status: 201, description: 'Rooms assigned successfully' })
  @ApiResponse({ status: 400, description: 'Room already occupied or invalid input' })
  @ApiResponse({ status: 404, description: 'Registration or Hotel/Room not found' })
  async assignRoom(@Body() dto: AssignRoomDto) {
    const result = await this.hotelsService.assignRoom(dto);
    return {
      success: true,
      message: result.message,
      data: result,
    };
  }

  @Post('finalize-assignments/:yatraId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Finalize all draft room assignments for a Yatra' })
  @ApiResponse({ status: 201, description: 'Assignments finalized successfully' })
  @ApiResponse({ status: 404, description: 'Yatra not found' })
  async finalizeAssignments(@Param('yatraId') yatraId: string) {
    const result = await this.hotelsService.finalizeAssignments(yatraId);
    return {
      success: true,
      message: result.message,
      data: result,
    };
  }

  @Delete('assignments/:registrationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove room assignment for a registration' })
  @ApiResponse({ status: 200, description: 'Assignment removed successfully' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async removeAssignment(@Param('registrationId') registrationId: string) {
    const result = await this.hotelsService.removeAssignment(registrationId);
    return {
      success: true,
      message: result.message,
      data: result,
    };
  }

  @Post('assignments/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update room assignmnet (Release old and assign new as Draft)' })
  @ApiResponse({ status: 201, description: 'Assignment updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async updateAssignment(@Body() dto: AssignRoomDto) {
    const result = await this.hotelsService.updateAssignment(dto);
    return {
      success: true,
      message: 'Room assignment updated successfully',
      data: result,
    };
  }
}
