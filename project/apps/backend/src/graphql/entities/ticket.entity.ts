import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Attachment } from './attachment.entity';

@ObjectType()
export class Ticket {
  @Field(() => ID)
  id: string;

  @Field()
  ticketNumber: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  category: string;

  @Field()
  subcategory: string;

  @Field()
  priority: string;

  @Field()
  status: string;

  @Field()
  impact: string;

  @Field()
  urgency: string;

  @Field()
  slaLevel: string;

  @Field(() => User, { nullable: true })
  requester?: User;

  @Field(() => User, { nullable: true })
  assignedTo?: User;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field({ nullable: true })
  resolution?: string;

  @Field(() => [Comment])
  comments: Comment[];

  @Field(() => [Attachment])
  attachments: Attachment[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  closedAt?: Date;

  @Field(() => Float, { nullable: true })
  slaCompliance?: number;

  @Field(() => Int, { nullable: true })
  responseTime?: number;

  @Field(() => Int, { nullable: true })
  resolutionTime?: number;
}
