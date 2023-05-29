import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  blog01Name,
  blogDescription,
  bloggerBlogsURI,
  blogWebsite,
} from '../utils/constants/blogs.constants';
import { testingAllDataURI } from '../utils/constants/testing.constants';
import { invalidURI, longString17 } from '../utils/constants/common.constants';
import { customExceptionFactory } from '../../src/exceptions/exception.factory';
import { HttpExceptionFilter } from '../../src/exceptions/exception.filter';
import { exceptionObject } from '../utils/objects/common.objects';
import {
  banReasonField,
  isBannedField,
} from '../utils/constants/exceptions.constants';
import { AppModule } from '../../src/app.module';
import {
  bloggerUsersURI,
  saUsersURI,
  user01Email,
  user01Login,
  userBanURI,
  userPassword,
} from '../utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  publicLoginUri,
} from '../utils/constants/auth.constants';
import { useContainer } from 'class-validator';
import { randomUUID } from 'crypto';
import { BlogsRepository } from '../../src/api/public/blogs/infrastructure/blogs.repository';
import {
  blogIDField,
  userIDField,
} from '../../src/exceptions/exception.constants';
import { bannedUserInBlogObject } from '../utils/objects/users.objects';

describe('Blogger users ban testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let blogsRepository: BlogsRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.TEST_URI || ''),
        AppModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: customExceptionFactory,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    blogsRepository = app.get(BlogsRepository);

    await app.init();
    agent = supertest.agent(app.getHttpServer());

    await agent.delete(testingAllDataURI);
  });

  let userId;

  let blogId;
  let blog;

  let aTokenUser01;

  describe('Users creation and authentication', () => {
    it(`should create user`, async () => {
      const user = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(201);
      userId = user.body.id;
    });
    it(`should log in user`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user01Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser01 = response.body.accessToken;
    });
  });

  describe('Ban user', () => {
    it(`should create blog`, async () => {
      const blog = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(201);
      blogId = blog.body.id;
    });

    // Validation errors [400]
    it(`should return 400 when trying to ban user without isBanned`, async () => {
      const response = await agent
        .put(bloggerUsersURI + userId + userBanURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(isBannedField));
    });
    it(`should return 400 when trying to ban user with incorrect isBanned type`, async () => {
      const response = await agent
        .put(bloggerUsersURI + userId + userBanURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: 123,
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(isBannedField));
    });
    it(`should return 400 when trying to ban user without banReason`, async () => {
      const response = await agent
        .put(bloggerUsersURI + userId + userBanURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: true,
          blogId: blogId,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(banReasonField));
    });
    it(`should return 400 when trying to ban user with incorrect banReason length`, async () => {
      const response = await agent
        .put(bloggerUsersURI + userId + userBanURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: longString17,
          blogId: blogId,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(banReasonField));
    });
    it(`should return 400 when trying to ban user with incorrect userId`, async () => {
      const response = await agent
        .put(bloggerUsersURI + invalidURI + userBanURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(userIDField));
    });
    it(`should return 400 when trying to ban user with incorrect blogId`, async () => {
      const response = await agent
        .put(bloggerUsersURI + userId + userBanURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: randomUUID(),
          blogId: randomUUID(),
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(blogIDField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to ban user with incorrect token`, async () => {
      await agent
        .put(bloggerUsersURI + userId + userBanURI)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(401);
    });

    // Success
    it(`should add banned user object in blog's banned users array`, async () => {
      await agent
        .put(bloggerUsersURI + userId + userBanURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(204);

      blog = await blogsRepository.findBlog(blogId);
      expect(blog.bannedUsers[0]).toEqual(bannedUserInBlogObject);
    });

    // Validation errors [400]
    it(`should return 400 when trying to ban user one more time`, async () => {
      const response = await agent
        .put(bloggerUsersURI + userId + userBanURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(userIDField));
      expect(blog.bannedUsers).toHaveLength(1);
    });
  });
  describe('Unban user', () => {
    // Success
    it(`should remove banned user ID from blog's banned users array`, async () => {
      await agent
        .put(bloggerUsersURI + userId + userBanURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: false,
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(204);

      blog = await blogsRepository.findBlog(blogId);
      expect(blog.bannedUsers).toHaveLength(0);
    });

    // Validation errors [400]
    it(`should return 400 when trying to unban user one more time`, async () => {
      const response = await agent
        .put(bloggerUsersURI + userId + userBanURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: false,
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(userIDField));
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
