import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'Get ticket analytics report' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async getTicketReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string
  ): Promise<{ data: unknown; message: string }> {
    const report = await this.reportsService.getTicketReport({
      startDate,
      endDate,
      userId,
    });

    return {
      data: report,
      message: 'Report generated successfully',
    };
  }

  @Get('system-metrics')
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({
    status: 200,
    description: 'System metrics retrieved successfully',
  })
  async getSystemMetrics(): Promise<{ data: unknown; message: string }> {
    const metrics = await this.reportsService.getSystemMetrics();

    return {
      data: metrics,
      message: 'System metrics retrieved successfully',
    };
  }

  @Get('user-distribution')
  @ApiOperation({ summary: 'Get user distribution by role' })
  @ApiResponse({
    status: 200,
    description: 'User distribution retrieved successfully',
  })
  async getUserDistribution(): Promise<{ data: unknown; message: string }> {
    const distribution = await this.reportsService.getUserDistribution();

    return {
      data: distribution,
      message: 'User distribution retrieved successfully',
    };
  }

  @Get('export')
  @ApiOperation({ summary: 'Export ticket report' })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  async exportReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string
  ): Promise<{ data: unknown; message: string }> {
    const report = await this.reportsService.exportTicketReport({
      startDate,
      endDate,
      userId,
    });

    return {
      data: report,
      message: 'Report exported successfully',
    };
  }
}
