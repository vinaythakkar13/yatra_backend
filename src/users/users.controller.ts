import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { LoginPnrDto } from './dto/login-pnr.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login with PNR only' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 404, description: 'PNR not found' })
  async loginWithPnr(@Body() loginPnrDto: LoginPnrDto) {
    const data = await this.usersService.loginWithPnr(loginPnrDto);
    return {
      success: true,
      message: 'Login successful',
      data,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(@Query() query: any) {
    const result = await this.usersService.findAll(query);
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(':pnr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by PNR' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByPnr(@Param('pnr') pnr: string) {
    const user = await this.usersService.findByPnr(pnr);
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }
}
