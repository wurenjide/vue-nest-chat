import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GroupShip } from '../group/entities/groupship.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,GroupShip]),
    JwtModule.register({
      secret: process.env.JWT_SECRET+"",
      signOptions: { expiresIn: "9999999999s" },
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
