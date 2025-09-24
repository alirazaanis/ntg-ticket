import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'System stats retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSystemStats(@Request() req) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required');
    }

    const stats = await this.adminService.getSystemStats();
    return {
      data: stats,
      message: 'System stats retrieved successfully',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'System health retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSystemHealth(@Request() req) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required');
    }

    const health = await this.adminService.getSystemHealth();
    return {
      data: health,
      message: 'System health retrieved successfully',
    };
  }

  @Get('config')
  @ApiOperation({ summary: 'Get system configuration (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'System configuration retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSystemConfiguration(@Request() req) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required');
    }

    const config = await this.adminService.getSystemConfiguration();
    return {
      data: config,
      message: 'System configuration retrieved successfully',
    };
  }

  @Patch('config')
  @ApiOperation({ summary: 'Update system configuration (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'System configuration updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateSystemConfiguration(@Request() req, @Body() config: Record<string, unknown>) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required');
    }

    const result = await this.adminService.updateSystemConfiguration(config);
    return result;
  }
}
