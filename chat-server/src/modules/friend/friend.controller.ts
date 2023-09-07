import { Controller, Get, Query, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('friend')
// @UseGuards(AuthGuard('jwt'))
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get()
  getFriends(@Query('userId') userId: string) {
    return this.friendService.getFriends(userId);
  }

  @Get('/friendMessages')
  getFriendMessage(@Query() query: any) {
    return this.friendService.getFriendMessages(query.userId, query.friendId, query.current, query.pageSize);
  }
}
