import { Controller, 
  Get, Post, Body, Patch, Param, Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
 } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entity/user.entity';
import { JwtStrategy } from '../auth/jwt.strategy';

@Controller('user')
@UseGuards(JwtStrategy)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/userId")
  getUser(@Query("userId") userId:string){
    return this.userService.getUserById(userId)
  }

  @Patch("username")
  updateUsername(@Body() user:User){
    console.log(1)
    return this.userService.updateUserName(user)
  }

  @Patch("password")
  updatePassword(@Body() data:any){
    return this.userService.updatePassword(data.user,data.newPassword)
  }

  @Patch("discription")
  updateUserDiscription(@Body() data:any){
    return this.userService.updateUserDiscription(data.user,data.discription)
  }

  @Delete()
  deleteUser(@Query() userId:string){
    return this.userService.deleteUser(userId)
  }

  @Post('/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  setUserAvatar(@Body() user:User, @UploadedFile() file:any) {
    return this.userService.setUserAvatar(user, file);
  }

  @Get("findByName")
  getfindByName(@Query("username") username:string){
    return this.userService.getUserByUserName(username)
  }
  @Post('/image')
  @UseInterceptors(FileInterceptor('image'))
  setUserImage( @UploadedFile() file:any) {
    return this.userService.setUserImage(file);
  }
}
