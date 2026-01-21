import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { CancelRegistrationDto } from './dto/cancel-registration.dto';
import { ApproveRegistrationDto, RejectRegistrationDto } from './dto/approve-reject-registration.dto';
import { QueryRegistrationDto } from './dto/query-registration.dto';
import { GetByPnrDto } from './dto/get-by-pnr.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';

@ApiTags('Registrations')
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) { }

  /**
   * Extract and sanitize IP address from request
   * Handles x-forwarded-for header which can contain multiple IPs
   */
  private extractIpAddress(req: any): string | undefined {
    let ipAddress = req.ip || req.connection?.remoteAddress;
    if (!ipAddress && req.headers['x-forwarded-for']) {
      // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
      ipAddress = req.headers['x-forwarded-for'].split(',')[0].trim();
    }
    // Truncate to 128 characters to be safe
    if (ipAddress && ipAddress.length > 128) {
      ipAddress = ipAddress.substring(0, 128);
    }
    return ipAddress;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new yatra registration' })
  @ApiResponse({ status: 201, description: 'Registration created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or registration already exists' })
  @ApiResponse({ status: 404, description: 'Yatra not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createDto: CreateRegistrationDto) {
    try {
      const ipAddress = this.extractIpAddress(req);
      const userAgent = req.headers['user-agent'];
      const adminId = req.admin?.id;

      const registration = await this.registrationsService.create(
        createDto,
        adminId,
        ipAddress,
        userAgent,
      );

      return {
        success: true,
        message: 'Registration created successfully',
        data: registration,
      };
    } catch (error: any) {
      // Log the error for debugging
      console.error('Error creating registration:', error);
      throw error; // Re-throw to let NestJS exception filter handle it
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all registrations (Admin only)' })
  @ApiResponse({ status: 200, description: 'Registrations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: QueryRegistrationDto) {
    const result = await this.registrationsService.findAll(query);
    return {
      success: true,
      message: 'Registrations retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get registration by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Registration retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async findOne(@Param('id') id: string) {
    const registration = await this.registrationsService.findOne(id);
    return {
      success: true,
      message: 'Registration retrieved successfully',
      data: registration,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update registration' })
  @ApiResponse({ status: 200, description: 'Registration updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update registration' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateDto: UpdateRegistrationDto,
  ) {
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'];
    const adminId = req.admin?.id;

    const registration = await this.registrationsService.update(
      id,
      updateDto,
      adminId,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: 'Registration updated successfully',
      data: registration,
    };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel registration' })
  @ApiResponse({ status: 200, description: 'Registration cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel registration' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async cancel(
    @Param('id') id: string,
    @Request() req: any,
    @Body() cancelDto: CancelRegistrationDto,
  ) {
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'];
    const adminId = req.admin?.id;

    const registration = await this.registrationsService.cancel(
      id,
      cancelDto,
      adminId,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: 'Registration cancelled successfully',
      data: registration,
    };
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve registration (Admin only)' })
  @ApiResponse({ status: 200, description: 'Registration approved successfully' })
  @ApiResponse({ status: 400, description: 'Cannot approve registration' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async approve(
    @Param('id') id: string,
    @Request() req: any,
    @Body() approveDto: ApproveRegistrationDto,
  ) {
    if (!req.admin) {
      throw new Error('Admin authentication required');
    }

    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'];

    const registration = await this.registrationsService.approve(
      id,
      approveDto,
      req.admin.id,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: 'Registration approved successfully',
      data: registration,
    };
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject registration (Admin only)' })
  @ApiResponse({ status: 200, description: 'Registration rejected successfully' })
  @ApiResponse({ status: 400, description: 'Cannot reject registration' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async reject(
    @Param('id') id: string,
    @Request() req: any,
    @Body() rejectDto: RejectRegistrationDto,
  ) {
    if (!req.admin) {
      throw new Error('Admin authentication required');
    }

    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'];

    const registration = await this.registrationsService.reject(
      id,
      rejectDto,
      req.admin.id,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: 'Registration rejected successfully',
      data: registration,
    };
  }

  @Get(':id/logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get registration audit logs (Admin only)' })
  @ApiResponse({ status: 200, description: 'Registration logs retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async getLogs(@Param('id') id: string) {
    const registration = await this.registrationsService.findOne(id);
    return {
      success: true,
      message: 'Registration logs retrieved successfully',
      data: registration.logs || [],
    };
  }

  @Get('by-pnr/:pnr')
  @ApiOperation({ summary: 'Get registration details by PNR with hotel and room information' })
  @ApiResponse({ status: 200, description: 'Registration details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Registration not found for the given PNR' })
  async getByPnr(@Param('pnr') pnr: string) {
    const result = await this.registrationsService.getByPnr(pnr);
    return {
      success: true,
      message: 'Registration details retrieved successfully',
      data: result,
    };
  }
}
