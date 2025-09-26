import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { SystemConfigService } from '../../common/config/system-config.service';
import { ValidationService } from '../../common/validation/validation.service';
import { UserRole } from '@prisma/client';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private systemConfigService: SystemConfigService,
    private validationService: ValidationService
  ) {}

  async validateUser(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          requestedTickets: {
            select: { id: true, status: true },
          },
          assignedTickets: {
            select: { id: true, status: true },
          },
        },
      });

      if (!user || !user.isActive) {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error('Error validating user:', error);
      return null;
    }
  }

  async login(user: { id: string; email: string; name: string; role: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async createOrUpdateUser(userData: {
    id: string;
    email: string;
    name: string;
    password?: string;
    avatar?: string;
    role?: UserRole;
  }): Promise<User> {
    try {
      // Validate password if provided
      if (userData.password) {
        const passwordValidation = this.validationService.validatePassword(
          userData.password
        );
        if (!passwordValidation.isValid) {
          throw new BadRequestException(passwordValidation.message);
        }
      }

      // Hash password if provided
      const hashedPassword = userData.password
        ? await bcrypt.hash(userData.password, 12)
        : undefined;

      const user = await this.prisma.user.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          avatar: userData.avatar,
          role: userData.role || UserRole.END_USER,
          isActive: true,
          updatedAt: new Date(),
          ...(hashedPassword && { password: hashedPassword }),
        },
        create: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          password:
            hashedPassword ||
            (await bcrypt.hash('temp-password-' + Date.now(), 12)), // Temporary password that must be changed
          avatar: userData.avatar,
          role: userData.role || UserRole.END_USER,
          isActive: true,
        },
        include: {
          requestedTickets: {
            select: { id: true, status: true },
          },
          assignedTickets: {
            select: { id: true, status: true },
          },
        },
      });

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      this.logger.log(`User ${user.email} created/updated successfully`);
      return userWithoutPassword as unknown as User;
    } catch (error) {
      this.logger.error('Error creating/updating user:', error);
      throw error;
    }
  }

  async validatePassword(
    password: string
  ): Promise<{ isValid: boolean; message?: string }> {
    return this.validationService.validatePassword(password);
  }

  async getPasswordRequirements(): Promise<string[]> {
    return this.validationService.getPasswordRequirements();
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { role, updatedAt: new Date() },
        include: {
          requestedTickets: {
            select: { id: true, status: true },
          },
          assignedTickets: {
            select: { id: true, status: true },
          },
        },
      });

      this.logger.log(`User ${user.email} role updated to ${role}`);
      return user;
    } catch (error) {
      this.logger.error('Error updating user role:', error);
      throw error;
    }
  }

  async deactivateUser(userId: string): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
        include: {
          requestedTickets: {
            select: { id: true, status: true },
          },
          assignedTickets: {
            select: { id: true, status: true },
          },
        },
      });

      this.logger.log(`User ${user.email} deactivated`);
      return user;
    } catch (error) {
      this.logger.error('Error deactivating user:', error);
      throw error;
    }
  }

  async getCurrentUser(userId: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          requestedTickets: {
            select: { id: true, status: true },
          },
          assignedTickets: {
            select: { id: true, status: true },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error('Error getting current user:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<{
    sub: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
  }> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.error('Error verifying token:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateJwtToken(token: string): Promise<{
    sub: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
  }> {
    this.logger.log('Validating JWT token', 'AuthService');

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          avatar: true,
        },
      });

      if (!user || !user.isActive) {
        return null;
      }

      return decoded as {
        sub: string;
        email: string;
        role: string;
        iat: number;
        exp: number;
      };
    } catch (error) {
      this.logger.error('JWT validation failed', error);
      return null;
    }
  }

  async validateUserCredentials(
    email: string,
    password: string
  ): Promise<{ id: string; email: string; name: string; role: string } | null> {
    this.logger.log(`Validating credentials for user: ${email}`, 'AuthService');

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error('Error validating user credentials:', error);
      return null;
    }
  }
}
