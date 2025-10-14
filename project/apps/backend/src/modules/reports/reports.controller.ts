import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  Res,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
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
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'Get ticket analytics report' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async getTicketReport(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string
  ): Promise<{ data: unknown; message: string }> {
    const report = await this.reportsService.getTicketReport({
      startDate: dateFrom || startDate,
      endDate: dateTo || endDate,
      userId: assignedTo || userId,
      status,
      priority,
      category,
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

  @Get('sla')
  @ApiOperation({ summary: 'Get SLA metrics report' })
  @ApiResponse({
    status: 200,
    description: 'SLA report generated successfully',
  })
  async getSlaReport(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string
  ): Promise<{ data: unknown; message: string }> {
    const report = await this.reportsService.getSlaReport({
      startDate: dateFrom || startDate,
      endDate: dateTo || endDate,
      status,
      priority,
      category,
    });

    return {
      data: report,
      message: 'SLA report generated successfully',
    };
  }

  @Get('export/:type')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Export report by type' })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  async exportReport(
    @Param('type') type: string,
    @Res() res: Response,
    @Query('format') format: string = 'csv',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string
  ): Promise<void> {
    try {
      this.logger.log('Export request received:', {
        type,
        format,
        startDate,
        endDate,
        userId,
        status,
        priority,
        category,
      });

      // Set default date range to last month if no dates provided
      const defaultEndDate = endDate || new Date().toISOString();
      const defaultStartDate =
        startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago

      const report = await this.reportsService.exportTicketReport({
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        userId,
        status,
        priority,
        category,
      });

      this.logger.log('Report data received:', {
        total: report?.data?.length || 0,
      });

      if (!report || !report.data || !Array.isArray(report.data)) {
        throw new Error('Invalid report data received from service');
      }

      // Generate content based on format
      let content: Buffer;
      let mimeType: string;
      let fileExtension: string;

      switch (format) {
        case 'csv': {
          const csvContent = [
            // CSV header
            'Ticket Number,Title,Status,Priority,Requester,Assigned To,Category,Subcategory,Created At,Updated At',
            // CSV rows
            ...report.data.map(
              (ticket: Record<string, unknown>) =>
                `"${ticket.ticketNumber}","${ticket.title}","${ticket.status}","${ticket.priority}","${ticket.requester}","${ticket.assignedTo}","${ticket.category}","${ticket.subcategory}","${ticket.createdAt}","${ticket.updatedAt}"`
            ),
          ].join('\n');
          content = Buffer.from(csvContent, 'utf8');
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
        }

        case 'excel': {
          // Create proper Excel file
          const worksheet = XLSX.utils.json_to_sheet(
            report.data.map((ticket: Record<string, unknown>) => ({
              'Ticket Number': ticket.ticketNumber,
              Title: ticket.title,
              Status: ticket.status,
              Priority: ticket.priority,
              Requester: ticket.requester,
              'Assigned To': ticket.assignedTo,
              Category: ticket.category,
              Subcategory: ticket.subcategory,
              'Created At': new Date(
                ticket.createdAt as string
              ).toLocaleDateString(),
              'Updated At': new Date(
                ticket.updatedAt as string
              ).toLocaleDateString(),
            }))
          );

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');

          content = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
          mimeType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          fileExtension = 'xlsx';
          break;
        }

        case 'pdf': {
          // Create proper PDF
          const doc = new jsPDF();

          // Add title
          doc.setFontSize(16);
          doc.text('TICKET REPORT', 20, 20);

          // Add generation info
          doc.setFontSize(10);
          doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
          doc.text(`Total Tickets: ${report.data.length}`, 20, 35);

          // Add table headers
          doc.setFontSize(8);
          let yPosition = 50;
          const colWidths = [25, 40, 20, 20, 30, 30, 20, 20];
          const headers = [
            'Ticket #',
            'Title',
            'Status',
            'Priority',
            'Requester',
            'Assigned To',
            'Category',
            'Created',
          ];

          // Draw table headers
          let xPosition = 20;
          headers.forEach((header, index) => {
            doc.rect(xPosition, yPosition - 5, colWidths[index], 8);
            doc.text(header, xPosition + 2, yPosition);
            xPosition += colWidths[index];
          });

          yPosition += 10;

          // Add ticket data
          report.data.forEach((ticket: Record<string, unknown>) => {
            // Check if we need a new page
            if (yPosition > 280) {
              doc.addPage();
              yPosition = 20;
            }

            xPosition = 20;
            const rowData = [
              ticket.ticketNumber,
              (ticket.title as string).length > 30
                ? (ticket.title as string).substring(0, 30) + '...'
                : ticket.title,
              ticket.status,
              ticket.priority,
              (ticket.requester as string).length > 20
                ? (ticket.requester as string).substring(0, 20) + '...'
                : ticket.requester,
              (ticket.assignedTo as string).length > 20
                ? (ticket.assignedTo as string).substring(0, 20) + '...'
                : ticket.assignedTo,
              ticket.category,
              new Date(ticket.createdAt as string).toLocaleDateString(),
            ];

            rowData.forEach((cell, cellIndex) => {
              doc.rect(xPosition, yPosition - 5, colWidths[cellIndex], 8);
              doc.text(cell.toString(), xPosition + 2, yPosition);
              xPosition += colWidths[cellIndex];
            });

            yPosition += 10;
          });

          content = Buffer.from(doc.output('arraybuffer'));
          mimeType = 'application/pdf';
          fileExtension = 'pdf';
          break;
        }

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      const filename = `report-${type}-${format}-${new Date().toISOString().split('T')[0]}.${fileExtension}`;

      // Set response headers for file download
      res.setHeader('Content-Type', mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );
      res.setHeader('Content-Length', content.length);

      // Send the file content
      res.end(content);
    } catch (error) {
      this.logger.error('Export error:', error);
      res.status(500).json({
        message: 'Failed to export report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('export/:type')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Export structured report by type (POST)' })
  @ApiResponse({
    status: 200,
    description: 'Structured report exported successfully',
  })
  async exportStructuredReport(
    @Param('type') type: string,
    @Body()
    body: {
      format: 'excel' | 'pdf' | 'csv';
      filters?: Record<string, unknown>;
      data?: AdminReportExportData;
    },
    @Res() res: Response
  ): Promise<void> {
    try {
      this.logger.log('Structured export request received:', {
        type,
        format: body.format,
        hasData: !!body.data,
      });

      if (type === 'admin-report' && body.format === 'excel') {
        await this.exportAdminReport(body.data, res);
        return;
      }

      // For other types, fall back to the original GET method logic
      throw new Error(`Unsupported structured export type: ${type}`);
    } catch (error) {
      this.logger.error('Structured export error:', error);
      res.status(500).json({
        message: 'Failed to export structured report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async exportAdminReport(
    data: AdminReportExportData,
    res: Response
  ): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();

      // Summary Cards Sheet
      if (data.summaryCards) {
        const summarySheet = XLSX.utils.json_to_sheet(
          data.summaryCards.map(card => ({
            Metric: card.title,
            Value: card.value,
          }))
        );
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary Cards');
      }

      // Users by Role Sheet
      if (data.usersByRole) {
        const roleSheet = XLSX.utils.json_to_sheet(
          data.usersByRole.map(item => ({
            Role: item.role.replace('_', ' '),
            Count: item.count,
          }))
        );
        XLSX.utils.book_append_sheet(workbook, roleSheet, 'Users by Role');
      }

      // Users by Registration Period Sheet
      if (data.usersByRegistrationPeriod) {
        const registrationSheet = XLSX.utils.json_to_sheet(
          data.usersByRegistrationPeriod.map(item => ({
            'Registration Period': item.monthYear,
            'New Users': item.count,
          }))
        );
        XLSX.utils.book_append_sheet(
          workbook,
          registrationSheet,
          'Registration Trends'
        );
      }

      // Users by Status Sheet
      if (data.usersByStatus) {
        const statusSheet = XLSX.utils.json_to_sheet(
          data.usersByStatus.map(item => ({
            Status: item.status,
            Count: item.count,
          }))
        );
        XLSX.utils.book_append_sheet(workbook, statusSheet, 'Users by Status');
      }

      // Tickets by Priority Sheet
      if (data.ticketsByPriority) {
        const prioritySheet = XLSX.utils.json_to_sheet(
          data.ticketsByPriority.map(item => ({
            Priority: item.priority,
            Count: item.count,
          }))
        );
        XLSX.utils.book_append_sheet(
          workbook,
          prioritySheet,
          'Tickets by Priority'
        );
      }

      // Tickets by Category Sheet
      if (data.ticketsByCategory) {
        const categorySheet = XLSX.utils.json_to_sheet(
          data.ticketsByCategory.map(item => ({
            Category: item.category,
            Count: item.count,
          }))
        );
        XLSX.utils.book_append_sheet(
          workbook,
          categorySheet,
          'Tickets by Category'
        );
      }

      // Login Activity Sheet
      if (data.loginActivity) {
        const loginSheet = XLSX.utils.json_to_sheet(
          data.loginActivity.map(item => ({
            Metric: item.metric,
            Count: item.count,
            Status: item.status,
          }))
        );
        XLSX.utils.book_append_sheet(workbook, loginSheet, 'Login Activity');
      }

      // Audit Trail Sheet
      if (data.auditTrail) {
        const auditSheet = XLSX.utils.json_to_sheet(
          data.auditTrail.map(item => ({
            'Activity Type': item.activityType,
            Count: item.count,
            'Last Activity': item.lastActivity,
          }))
        );
        XLSX.utils.book_append_sheet(workbook, auditSheet, 'Audit Trail');
      }

      const content = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });
      const mimeType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const filename = `administrative-report-${new Date().toISOString().split('T')[0]}.xlsx`;

      // Set response headers for file download
      res.setHeader('Content-Type', mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );
      res.setHeader('Content-Length', content.length);

      // Send the file content
      res.end(content);
    } catch (error) {
      this.logger.error('Admin report export error:', error);
      throw error;
    }
  }
}

// Types for admin structured export payload
interface SummaryCardItem {
  title: string;
  value: number;
}

interface RoleCountItem {
  role: string;
  count: number;
}

interface RegistrationPeriodItem {
  monthYear: string;
  count: number;
}

interface StatusCountItem {
  status: string;
  count: number;
}

interface PriorityCountItem {
  priority: string;
  count: number;
}

interface CategoryCountItem {
  category: string;
  count: number;
}

interface LoginActivityItem {
  metric: string;
  count: number;
  status: string;
}

interface AuditTrailItem {
  activityType: string;
  count: number;
  lastActivity: string;
}

interface AdminReportExportData {
  summaryCards?: SummaryCardItem[];
  usersByRole?: RoleCountItem[];
  usersByRegistrationPeriod?: RegistrationPeriodItem[];
  usersByStatus?: StatusCountItem[];
  ticketsByPriority?: PriorityCountItem[];
  ticketsByCategory?: CategoryCountItem[];
  loginActivity?: LoginActivityItem[];
  auditTrail?: AuditTrailItem[];
}
