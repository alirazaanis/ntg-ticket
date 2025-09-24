import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { TicketCategory } from '@prisma/client';

export class CreateCategoryDto {
  @IsString()
  name: TicketCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  createdBy: string;
}
