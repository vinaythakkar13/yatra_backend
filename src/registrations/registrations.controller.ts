import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { CreateSplitRegistrationDto } from './dto/create-split-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { CancelRegistrationDto } from './dto/cancel-registration.dto';
import { ApproveRegistrationDto, RejectRegistrationDto } from './dto/approve-reject-registration.dto';
import { ApproveDocumentDto, RejectDocumentDto } from './dto/approve-reject-document.dto';
import { QueryRegistrationDto } from './dto/query-registration.dto';
import { GetByPnrDto } from './dto/get-by-pnr.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
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

  @Post('split')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a split registration with internal PNR (Admin only)' })
  @ApiResponse({ status: 201, description: 'Manual registration created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or unable to generate unique PNR' })
  @ApiResponse({ status: 404, description: 'Yatra not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async createSplit(@Request() req: any, @Body() createDto: CreateSplitRegistrationDto) {
    try {
      const ipAddress = this.extractIpAddress(req);
      const userAgent = req.headers['user-agent'];
      const adminId = req.admin?.id;

      if (!adminId) {
        throw new Error('Admin authentication required');
      }

      const result = await this.registrationsService.createSplitRegistration(
        createDto,
        adminId,
        ipAddress,
        userAgent,
      );

      return {
        success: true,
        message: 'Manual registration created successfully',
        data: {
          registration: result.registration,
          internalPnr: result.internalPnr,
          originalPnr: result.originalPnr,
        },
      };
    } catch (error: any) {
      // Log the error for debugging
      console.error('Error creating split registration:', error);
      throw error; // Re-throw to let NestJS exception filter handle it
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'staff')
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
  @Roles('super_admin', 'admin', 'staff')
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

  @Post(':id/approve-document')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve registration documents (Admin only)' })
  @ApiResponse({ status: 200, description: 'Documents approved successfully' })
  @ApiResponse({ status: 400, description: 'Cannot approve documents' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async approveDocument(
    @Param('id') id: string,
    @Request() req: any,
    @Body() approveDto: ApproveDocumentDto,
  ) {
    if (!req.admin) {
      throw new Error('Admin authentication required');
    }

    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'];

    const registration = await this.registrationsService.approveDocument(
      id,
      approveDto,
      req.admin.id,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: 'Documents approved successfully',
      data: registration,
    };
  }

  @Post(':id/reject-document')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject registration documents (Admin only)' })
  @ApiResponse({ status: 200, description: 'Documents rejected successfully' })
  @ApiResponse({ status: 400, description: 'Cannot reject documents' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async rejectDocument(
    @Param('id') id: string,
    @Request() req: any,
    @Body() rejectDto: RejectDocumentDto,
  ) {
    if (!req.admin) {
      throw new Error('Admin authentication required');
    }

    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'];

    const registration = await this.registrationsService.rejectDocument(
      id,
      rejectDto,
      req.admin.id,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: 'Documents rejected successfully',
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
    const logs = await this.registrationsService.getLogs(id);
    return {
      success: true,
      message: 'Registration logs retrieved successfully',
      data: logs,
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

  @Patch(':id/ticket-type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update registration ticket type (Admin only)' })
  @ApiResponse({ status: 200, description: 'Ticket type updated successfully' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async updateTicketType(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateDto: UpdateTicketTypeDto,
  ) {
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'];
    const adminId = req.admin?.id;

    const registration = await this.registrationsService.updateTicketType(
      id,
      updateDto,
      adminId,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: 'Ticket type updated successfully',
      data: registration,
    };
  }

  @Get('split-analytics/:originalPnr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get split registration analytics by original PNR (Admin only)' })
  @ApiResponse({ status: 200, description: 'Split analytics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSplitAnalytics(@Param('originalPnr') originalPnr: string) {
    const analytics = await this.registrationsService.getSplitCountByOriginalPnr(originalPnr);
    return {
      success: true,
      message: 'Split analytics retrieved successfully',
      data: analytics,
    };
  }
}
