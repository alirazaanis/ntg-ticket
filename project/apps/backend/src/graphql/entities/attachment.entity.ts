import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Attachment {
  @Field(() => ID)
  id: string;

  @Field()
  filename: string;

  @Field()
  originalName: string;

  @Field()
  mimeType: string;

  @Field()
  size: number;

  @Field()
  fileUrl: string;

  @Field()
  createdAt: Date;
}
