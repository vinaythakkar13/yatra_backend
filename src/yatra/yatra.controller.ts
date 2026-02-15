import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { YatraService } from './yatra.service';
import { CreateYatraDto } from './dto/create-yatra.dto';
import { UpdateYatraDto } from './dto/update-yatra.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';

@ApiTags('Yatra')
@Controller('yatra')
export class YatraController {
  constructor(private readonly yatraService: YatraService) { }

  @Get('get-all-yatras')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all yatras' })
  @ApiResponse({ status: 200, description: 'List of yatras retrieved successfully' })
  async getAllYatras() {
    const yatras = await this.yatraService.findAll();
    return {
      success: true,
      message: 'Yatras fetched successfully',
      data: yatras,
    };
  }

  @Get('active-yatras')
  @ApiOperation({ summary: 'Get active yatras (public endpoint)' })
  @ApiResponse({ status: 200, description: 'Active yatras fetched successfully' })
  async getActiveYatras() {
    const yatras = await this.yatraService.getActiveYatras();
    return {
      success: true,
      message: 'Active yatras fetched successfully',
      data: yatras,
    };
  }

  @Get('get-yatra/:id')
  @ApiOperation({ summary: 'Get yatra by ID' })
  @ApiResponse({ status: 200, description: 'Yatra fetched successfully' })
  @ApiResponse({ status: 404, description: 'Yatra not found' })
  async getYatraById(@Param('id') id: string) {
    const yatra = await this.yatraService.findOne(id);
    return {
      success: true,
      message: 'Yatra fetched successfully',
      data: yatra,
    };
  }

  @Post('create-yatra')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new yatra' })
  @ApiResponse({ status: 201, description: 'Yatra created successfully' })
  async createYatra(@Body() createYatraDto: CreateYatraDto) {
    const yatra = await this.yatraService.create(createYatraDto);
    return {
      success: true,
      message: 'Yatra created successfully',
      data: yatra,
    };
  }

  @Put('update-yatra/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update yatra' })
  @ApiResponse({ status: 200, description: 'Yatra updated successfully' })
  @ApiResponse({ status: 404, description: 'Yatra not found' })
  async updateYatra(@Param('id') id: string, @Body() updateYatraDto: UpdateYatraDto) {
    const yatra = await this.yatraService.update(id, updateYatraDto);
    return {
      success: true,
      message: 'Yatra updated successfully',
      data: yatra,
    };
  }

  @Delete('delete-yatra/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete yatra' })
  @ApiResponse({ status: 200, description: 'Yatra deleted successfully' })
  @ApiResponse({ status: 404, description: 'Yatra not found' })
  async deleteYatra(@Param('id') id: string) {
    await this.yatraService.remove(id);
    return {
      success: true,
      message: 'Yatra deleted successfully',
      data: null,
    };
  }
}
