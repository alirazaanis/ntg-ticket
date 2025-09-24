import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { CommentsService } from '../../modules/comments/comments.service';
import { Comment } from '../entities/comment.entity';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Query(() => [Comment])
  async comments(
    @Args('ticketId', { type: () => ID }) ticketId: string
  ): Promise<Comment[]> {
    return this.commentsService.findByTicketId(ticketId);
  }
}
