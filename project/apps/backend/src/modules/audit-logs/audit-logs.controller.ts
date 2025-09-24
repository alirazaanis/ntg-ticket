import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { NextAuthJwtGuard } from '../auth/guards/nextauth-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(NextAuthJwtGuard, RolesGuard)
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_MANAGER)
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('action') action?: string
  ) {
    // Build filters based on query parameters
    const filters: { userId?: string; action?: string } = {};
    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    
    const pagination = {
      page: page || 1,
      limit: Math.min(limit || 20, 100), // Max 100 items per page
    };

    return this.auditLogsService.getAuditLogs(filters, pagination);
  }
}
