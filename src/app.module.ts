import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BlogsAndPostsModule } from './common/modules/blogs-posts.module';
import { TestingModule } from './testing/testing.module';
import { MailModule } from './mail/mail.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(process.env.MONGO_URI || 'local connection'),
    AuthModule,
    BlogsAndPostsModule,
    CommentsModule,
    TestingModule,
    UsersModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
