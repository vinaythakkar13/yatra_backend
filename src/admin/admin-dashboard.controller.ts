import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

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
}
