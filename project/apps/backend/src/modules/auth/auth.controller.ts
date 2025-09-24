import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { NextAuthJwtGuard } from './guards/nextauth-jwt.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { User } from '../users/entities/user.entity';
import {
  RateLimitGuard,
} from '../../common/guards/rate-limit.guard';
import { SanitizationService } from '../../common/validation/sanitization.service';
import { TokenBlacklistService } from '../../common/security/token-blacklist.service';
// import { CsrfGuard } from '../../common/guards/csrf.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly sanitizationService: SanitizationService,
    private readonly tokenBlacklistService: TokenBlacklistService
  ) {}

  @Post('login')
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and get JWT token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(
    @Body() body: { email: string; password: string }
  ): Promise<{ data: { access_token: string; user: { id: string; email: string; name: string; role: string } }; message: string }> {
    try {
      // Sanitize inputs
      const email = this.sanitizationService.sanitizeEmail(body.email);
      const password = this.sanitizationService.sanitizePassword(body.password);

      const user = await this.authService.validateUserCredentials(
        email,
        password
      );

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token
      const loginResult = await this.authService.login(user);

      return {
        data: loginResult,
        message: 'Login successful',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new BadRequestException('Invalid input data');
    }
  }

  @Post('logout')
  @UseGuards(NextAuthJwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req): Promise<{ message: string }> {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await this.tokenBlacklistService.blacklistToken(token);
      }

      return {
        message: 'Logout successful',
      };
    } catch (error) {
      this.logger.error('Error during logout:', error);
      return {
        message: 'Logout successful',
      };
    }
  }

  @Post('validate')
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate user credentials' })
  @ApiResponse({
    status: 200,
    description: 'Credentials validated successfully',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async validateCredentials(
    @Body() body: { email: string; password: string }
  ): Promise<{ data: { user: { id: string; email: string; name: string; role: string } }; message: string }> {
    try {
      // Sanitize inputs
      const email = this.sanitizationService.sanitizeEmail(body.email);
      const password = this.sanitizationService.sanitizePassword(body.password);

      const user = await this.authService.validateUserCredentials(
        email,
        password
      );

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return {
        data: { user },
        message: 'Credentials validated successfully',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new BadRequestException('Invalid input data');
    }
  }

  @Get('me')
  @UseGuards(NextAuthJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(
    @Request() req
  ): Promise<{ data: User; message: string }> {
    const user = await this.authService.getCurrentUser(req.user.id);
    return {
      data: user,
      message: 'User information retrieved successfully',
    };
  }

  @Post('users/:userId/role')
  @UseGuards(NextAuthJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateUserRole(
    @Request() req,
    @Body() updateUserRoleDto: UpdateUserRoleDto
  ): Promise<{ data: User; message: string }> {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required');
    }

    const user = await this.authService.updateUserRole(
      req.params.userId,
      updateUserRoleDto.role
    );

    return {
      data: user,
      message: 'User role updated successfully',
    };
  }

  @Post('users/:userId/deactivate')
  @UseGuards(NextAuthJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deactivateUser(
    @Request() req
  ): Promise<{ data: User; message: string }> {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required');
    }

    const user = await this.authService.deactivateUser(req.params.userId);

    return {
      data: user,
      message: 'User deactivated successfully',
    };
  }
}
