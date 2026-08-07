import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from './entities/organization.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;

export interface AuthResult {
  accessToken: string;
  organization: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto): Promise<AuthResult> {
    this.validateRegister(data);

    const email = data.email.trim().toLowerCase();
    const existing = await this.orgRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('An organization with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const organization = this.orgRepo.create({
      name: data.orgName.trim(),
      email,
      passwordHash,
    });
    await this.orgRepo.save(organization);

    return this.buildAuthResult(organization);
  }

  async login(data: LoginDto): Promise<AuthResult> {
    if (!data.email || !data.password) {
      throw new BadRequestException('email and password are required');
    }

    const email = data.email.trim().toLowerCase();
    const organization = await this.orgRepo.findOne({ where: { email } });
    if (!organization) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      data.password,
      organization.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResult(organization);
  }

  private buildAuthResult(organization: Organization): AuthResult {
    const accessToken = this.jwtService.sign({
      sub: organization.id,
      email: organization.email,
    });

    return {
      accessToken,
      organization: {
        id: organization.id,
        name: organization.name,
        email: organization.email,
      },
    };
  }

  private validateRegister(data: RegisterDto): void {
    if (!data.orgName || !data.orgName.trim()) {
      throw new BadRequestException('orgName is required');
    }
    if (!data.email || !EMAIL_PATTERN.test(data.email.trim())) {
      throw new BadRequestException('A valid email is required');
    }
    if (!data.password || data.password.length < 8) {
      throw new BadRequestException(
        'password must be at least 8 characters long',
      );
    }
  }
}
