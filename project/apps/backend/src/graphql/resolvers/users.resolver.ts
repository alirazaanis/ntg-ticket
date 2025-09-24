import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UsersService } from '../../modules/users/users.service';
import { User } from '../entities/user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  async users(): Promise<User[]> {
    const result = await this.usersService.findAll({});
    return result.data;
  }

  @Query(() => User, { nullable: true })
  async user(@Args('id', { type: () => ID }) id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }
}
