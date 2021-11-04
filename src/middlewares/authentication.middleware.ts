import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from '@modules/authentication/services/authentication.service';
import { UserI } from '@modules/user/models/user.interface';
import { UserService } from '@modules/user/services/user.service';

export interface RequestModel extends Request {
  user: UserI
}

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
  ) { }

  async use(req: RequestModel, res: Response, next: NextFunction) {
    try {
      const tokenArray: string[] = req.headers['authorization'].split(' ');
      const decodedToken = await this.authenticationService.verifyJwt(tokenArray[1]);

      const user: UserI = await this.userService.getOne(decodedToken.user.id);
      if (user) {
        req.user = user;
        next();
      } else {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    } catch {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
