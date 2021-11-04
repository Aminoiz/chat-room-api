import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@modules/user/models/user.entity';
import { UserI } from '@modules/user/models/user.interface';
import { Repository } from 'typeorm';
import { AuthenticationService } from '@modules/authentication/services/authentication.service';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authenticationService: AuthenticationService,
  ) { }

  async create(newUser: UserI): Promise<UserI> {
    try {
      const exists: boolean = await this.mailExists(newUser.email);
      if (!exists) {
        const passwordHash: string = await this.hashPassword(newUser.password);
        newUser.password = passwordHash;
        const user = await this.userRepository.save(this.userRepository.create(newUser));
        return this.findOne(user.id);
      } else {
        throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
      }
    } catch {
      throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
    }
  }

  async login(user: UserI): Promise<string> {
    try {
      const foundUser: UserI = await this.findByEmail(user.email.toLowerCase());
      if (foundUser) {
        const matches: boolean = await this.validatePassword(user.password, foundUser.password);
        if (matches) {
          const payload: UserI = await this.findOne(foundUser.id);
          return this.authenticationService.generateJwt(payload);
        } else {
          throw new HttpException('Login was not successfull, wrong credentials', HttpStatus.UNAUTHORIZED);
        }
      } else {
        throw new HttpException('Login was not successfull, wrong credentials', HttpStatus.UNAUTHORIZED);
      }
    } catch {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  // also returns the password
  private async findByEmail(email: string): Promise<UserI> {
    return this.userRepository.findOne({ email }, { select: ['id', 'email', 'username', 'password'] });
  }

  private async hashPassword(password: string): Promise<string> {
    return this.authenticationService.hashPassword(password);
  }

  private async validatePassword(password: string, storedPasswordHash: string): Promise<any> {
    return this.authenticationService.comparePasswords(password, storedPasswordHash);
  }

  private async findOne(id: number): Promise<UserI> {
    return this.userRepository.findOne({ id });
  }

  public getOne(id: number): Promise<UserI> {
    return this.userRepository.findOneOrFail({ id });
  }

  private async mailExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ email });
    if (user) {
      return true;
    } else {
      return false;
    }
  }
}
