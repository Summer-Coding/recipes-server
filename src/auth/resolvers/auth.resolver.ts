import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthService } from '../auth.service';
import { AuthUser as SupabaseAuthUser } from '@supabase/supabase-js';
import { UserDto } from '../dtos';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => UserDto, { name: 'viewer' })
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: SupabaseAuthUser) {
    return user;
  }
}
