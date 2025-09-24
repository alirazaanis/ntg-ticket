import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { Notification } from '../entities/notification.entity';

@Resolver(() => Notification)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => [Notification])
  async notifications(
    @Args('userId', { type: () => ID }) userId: string
  ): Promise<Notification[]> {
    return this.notificationsService.findByUserId(userId);
  }
}
