import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { CustomFieldType } from '@prisma/client';

@Injectable()
export class CustomFieldsService {
  private readonly logger = new Logger(CustomFieldsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createCustomFieldDto: CreateCustomFieldDto) {
    try {
      const customField = await this.prisma.customField.create({
        data: createCustomFieldDto,
      });

      this.logger.log(`Custom field created: ${customField.name}`);
      return customField;
    } catch (error) {
      this.logger.error('Error creating custom field:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const customFields = await this.prisma.customField.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });

      return customFields;
    } catch (error) {
      this.logger.error('Error finding custom fields:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const customField = await this.prisma.customField.findUnique({
        where: { id },
      });

      if (!customField) {
        throw new NotFoundException(`Custom field with ID ${id} not found`);
      }

      return customField;
    } catch (error) {
      this.logger.error('Error finding custom field:', error);
      throw error;
    }
  }

  async update(id: string, updateCustomFieldDto: UpdateCustomFieldDto) {
    try {
      const customField = await this.prisma.customField.update({
        where: { id },
        data: {
          ...updateCustomFieldDto,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Custom field updated: ${customField.name}`);
      return customField;
    } catch (error) {
      this.logger.error('Error updating custom field:', error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Soft delete by setting isActive to false
      const customField = await this.prisma.customField.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Custom field deactivated: ${customField.name}`);
      return { message: 'Custom field deactivated successfully' };
    } catch (error) {
      this.logger.error('Error deactivating custom field:', error);
      throw error;
    }
  }

  async getTicketCustomFields(ticketId: string) {
    try {
      const ticketCustomFields = await this.prisma.ticketCustomField.findMany({
        where: { ticketId },
        include: {
          customField: true,
        },
      });

      return ticketCustomFields;
    } catch (error) {
      this.logger.error('Error getting ticket custom fields:', error);
      throw error;
    }
  }

  async setTicketCustomField(
    ticketId: string,
    customFieldId: string,
    value: string
  ) {
    try {
      const customField = await this.findOne(customFieldId);

      // Validate value based on field type
      this.validateFieldValue(
        customField.fieldType,
        value,
        customField.options as {
          minLength?: number;
          maxLength?: number;
          required?: boolean;
          choices?: string[];
        }
      );

      const ticketCustomField = await this.prisma.ticketCustomField.upsert({
        where: {
          ticketId_customFieldId: {
            ticketId,
            customFieldId,
          },
        },
        update: { value },
        create: {
          ticketId,
          customFieldId,
          value,
        },
        include: {
          customField: true,
        },
      });

      return ticketCustomField;
    } catch (error) {
      this.logger.error('Error setting ticket custom field:', error);
      throw error;
    }
  }

  private validateFieldValue(
    fieldType: CustomFieldType,
    value: string,
    options: {
      minLength?: number;
      maxLength?: number;
      required?: boolean;
      choices?: string[];
    }
  ) {
    switch (fieldType) {
      case CustomFieldType.TEXT:
        if (typeof value !== 'string') {
          throw new BadRequestException(
            'Value must be a string for TEXT field'
          );
        }
        break;

      case CustomFieldType.NUMBER:
        if (isNaN(Number(value))) {
          throw new BadRequestException(
            'Value must be a number for NUMBER field'
          );
        }
        break;

      case CustomFieldType.DATE:
        if (isNaN(Date.parse(value))) {
          throw new BadRequestException(
            'Value must be a valid date for DATE field'
          );
        }
        break;

      case CustomFieldType.SELECT:
        if (options && Array.isArray(options) && !options.includes(value)) {
          throw new BadRequestException(
            `Value must be one of: ${options.join(', ')}`
          );
        }
        break;

      case CustomFieldType.BOOLEAN:
        if (!['true', 'false'].includes(value.toLowerCase())) {
          throw new BadRequestException(
            'Value must be true or false for BOOLEAN field'
          );
        }
        break;
    }
  }
}
