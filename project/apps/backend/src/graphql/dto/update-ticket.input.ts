import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import {
  TicketPriority,
  TicketStatus,
  TicketImpact,
  TicketUrgency,
  SLALevel,
} from '@prisma/client';

@InputType()
export class UpdateTicketInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  subcategoryId?: string;

  @Field(() => String, { nullable: true })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @Field(() => String, { nullable: true })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @Field(() => String, { nullable: true })
  @IsEnum(TicketImpact)
  @IsOptional()
  impact?: TicketImpact;

  @Field(() => String, { nullable: true })
  @IsEnum(TicketUrgency)
  @IsOptional()
  urgency?: TicketUrgency;

  @Field(() => String, { nullable: true })
  @IsEnum(SLALevel)
  @IsOptional()
  slaLevel?: SLALevel;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  assignedToId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  resolution?: string;
}
