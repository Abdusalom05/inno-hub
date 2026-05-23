import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { SubmissionsService } from './submissions.service';

@ApiTags('Authors')
@ApiBearerAuth()
@Controller('authors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AuthorsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an author from a submission' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.submissionsService.removeAuthor(user, id);
  }
}
