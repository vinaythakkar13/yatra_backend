import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { UserStatusQueryDto } from './dto/user-status-query.dto';

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
export class AdminDashboardController {
    constructor(private readonly dashboardService: AdminDashboardService) { }

    @Get()
    @ApiOperation({ summary: 'Get aggregated dashboard data for a specific Yatra' })
    @ApiResponse({ status: 200, description: 'Return aggregated dashboard data' })
    async getDashboard(@Query() query: DashboardQueryDto) {
        return this.dashboardService.getDashboardData(query.yatraId);
    }

    @Get('user-status')
    @ApiOperation({ summary: 'Get user status checking module data including statistics and paginated users' })
    @ApiResponse({ status: 200, description: 'Return user status statistics and paginated user list' })
    async getUserStatus(@Query() query: UserStatusQueryDto) {
        return this.dashboardService.getUserStatusData(query);
    }
}
