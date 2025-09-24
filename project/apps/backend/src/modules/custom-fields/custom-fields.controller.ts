import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Custom Fields')
@Controller('custom-fields')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new custom field (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Custom field created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async create(
    @Body() createCustomFieldDto: CreateCustomFieldDto,
    @Request() req
  ) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required');
    }

    const customField =
      await this.customFieldsService.create(createCustomFieldDto);
    return {
      data: customField,
      message: 'Custom field created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all custom fields' })
  @ApiResponse({
    status: 200,
    description: 'Custom fields retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    const customFields = await this.customFieldsService.findAll();
    return {
      data: customFields,
      message: 'Custom fields retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get custom field by ID' })
  @ApiResponse({
    status: 200,
    description: 'Custom field retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Custom field not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const customField = await this.customFieldsService.findOne(id);
    return {
      data: customField,
      message: 'Custom field retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update custom field (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Custom field updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Custom field not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomFieldDto: UpdateCustomFieldDto,
    @Request() req
  ) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required');
    }

    const customField = await this.customFieldsService.update(
      id,
      updateCustomFieldDto
    );
    return {
      data: customField,
      message: 'Custom field updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete custom field (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Custom field deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Custom field not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required');
    }

    const result = await this.customFieldsService.remove(id);
    return result;
  }

  @Get('ticket/:ticketId')
  @ApiOperation({ summary: 'Get custom field values for a ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket custom fields retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTicketCustomFields(
    @Param('ticketId', ParseUUIDPipe) ticketId: string
  ) {
    const ticketCustomFields =
      await this.customFieldsService.getTicketCustomFields(ticketId);
    return {
      data: ticketCustomFields,
      message: 'Ticket custom fields retrieved successfully',
    };
  }

  @Post('ticket/:ticketId/:customFieldId')
  @ApiOperation({ summary: 'Set custom field value for a ticket' })
  @ApiResponse({
    status: 200,
    description: 'Custom field value set successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setTicketCustomField(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Param('customFieldId', ParseUUIDPipe) customFieldId: string,
    @Body() body: { value: string }
  ) {
    const ticketCustomField =
      await this.customFieldsService.setTicketCustomField(
        ticketId,
        customFieldId,
        body.value
      );
    return {
      data: ticketCustomField,
      message: 'Custom field value set successfully',
    };
  }
}
