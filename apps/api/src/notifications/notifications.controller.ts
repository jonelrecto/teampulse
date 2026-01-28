import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  findAll(
    @User() user: any,
    @Query('unreadOnly', new ParseBoolPipe({ optional: true })) unreadOnly: boolean = false,
  ) {
    return this.notificationsService.findAll(user.id, unreadOnly);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: any,
  ) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@User() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  getPreferences(@User() user: any) {
    return this.notificationsService.getPreferences(user.id);
  }

  @Put('preferences/:teamId')
  @ApiOperation({ summary: 'Update notification preferences for a team' })
  updatePreferences(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @User() user: any,
    @Body() updateDto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationsService.updatePreferences(user.id, teamId, updateDto);
  }
}
