import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import {
  TicketPriority,
  TicketImpact,
  TicketUrgency,
  SLALevel,
  TicketCategory,
} from '@prisma/client';

@InputType()
export class CreateTicketInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @Field()
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @Field()
  @IsString()
  @IsNotEmpty()
  subcategory: string;

  @Field({ defaultValue: 'MEDIUM' })
  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @Field({ defaultValue: 'MODERATE' })
  @IsEnum(TicketImpact)
  impact: TicketImpact;

  @Field({ defaultValue: 'NORMAL' })
  @IsEnum(TicketUrgency)
  urgency: TicketUrgency;

  @Field({ defaultValue: 'STANDARD' })
  @IsEnum(SLALevel)
  slaLevel: SLALevel;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  relatedTickets?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  resolution?: string;
}
