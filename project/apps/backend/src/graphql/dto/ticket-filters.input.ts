import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { TicketPriority, TicketStatus } from '@prisma/client';

@InputType()
export class TicketFiltersInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  status?: TicketStatus[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  priority?: TicketPriority[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  subcategoryId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  assignedToId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  requesterId?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  createdAfter?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  createdBefore?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  limit?: number;
}
