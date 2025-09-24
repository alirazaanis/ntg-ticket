import { Module } from '@nestjs/common';
import { TicketsResolver } from './resolvers/tickets.resolver';
import { UsersResolver } from './resolvers/users.resolver';
import { CommentsResolver } from './resolvers/comments.resolver';
import { NotificationsResolver } from './resolvers/notifications.resolver';
import { ReportsResolver } from './resolvers/reports.resolver';
import { TicketsModule } from '../modules/tickets/tickets.module';
import { UsersModule } from '../modules/users/users.module';
import { CommentsModule } from '../modules/comments/comments.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { ReportsModule } from '../modules/reports/reports.module';

@Module({
  imports: [
    TicketsModule,
    UsersModule,
    CommentsModule,
    NotificationsModule,
    ReportsModule,
  ],
  providers: [
    TicketsResolver,
    UsersResolver,
    CommentsResolver,
    NotificationsResolver,
    ReportsResolver,
  ],
})
export class GraphQLModuleCustom {}
