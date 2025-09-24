import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Notification {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field()
  isRead: boolean;

  @Field()
  createdAt: Date;
}
