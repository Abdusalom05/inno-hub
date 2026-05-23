import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { TopicsModule } from './topics/topics.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { ProgressModule } from './progress/progress.module';
import { AdminModule } from './admin/admin.module';
import { SubmissionsModule } from './submissions/submissions.module';

import { AdminAuthModule } from './admin-auth/admin-auth.module';

import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        CORS_ORIGIN: Joi.string().optional(),
      }),
    }),

    AdminAuthModule,

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('EMAIL_HOST'),
          secure: false,
          auth: {
            user: config.get('EMAIL_USER'),
            pass: config.get('EMAIL_PASS'),
          },
        },
        defaults: {
          from: `"Inno HUB Support" <${config.get('EMAIL_USER')}>`,
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    TopicsModule,
    EnrollmentModule,
    ProgressModule,
    AdminModule,
    SubmissionsModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
