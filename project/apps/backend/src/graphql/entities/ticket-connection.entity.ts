import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Ticket } from './ticket.entity';

@ObjectType()
export class TicketEdge {
  @Field(() => Ticket)
  node: Ticket;

  @Field()
  cursor: string;
}

@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field({ nullable: true })
  startCursor?: string;

  @Field({ nullable: true })
  endCursor?: string;
}

@ObjectType()
export class TicketConnection {
  @Field(() => [TicketEdge])
  edges: TicketEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => Int)
  totalCount: number;
}
