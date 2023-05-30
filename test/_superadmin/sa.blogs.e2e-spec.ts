import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { useContainer } from 'class-validator';
import { AppModule } from '../../src/app.module';
import { customExceptionFactory } from '../../src/exceptions/exception.factory';
import { HttpExceptionFilter } from '../../src/exceptions/exception.filter';
import { testingAllDataURI } from '../utils/constants/testing.constants';
import {
  banURI,
  saUsersURI,
  user01Email,
  user01Login,
  user02Email,
  user02Login,
  userPassword,
} from '../utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  publicLoginUri,
} from '../utils/constants/auth.constants';
import {
  blog01Name,
  blogBindURI,
  blogDescription,
  bloggerBlogsURI,
  blogWebsite,
  saBlogsURI,
} from '../utils/constants/blogs.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import { invalidURI } from '../utils/constants/common.constants';
import {
  blogIDField,
  userIDField,
} from '../../src/exceptions/exception.constants';
import { randomUUID } from 'crypto';
import { saBlogObject } from '../utils/objects/blogs.objects';
import { isBannedField } from '../utils/constants/exceptions.constants';
import { BlogsRepository } from '../../src/api/infrastructure/blogs/blogs.repository';
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import { PostsRepository } from '../../src/api/infrastructure/posts/posts.repository';

describe('Super admin blogs testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let blogsRepository: BlogsRepository;
  let postsRepository: PostsRepository;

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
    postsRepository = app.get(PostsRepository);
    await app.init();
    agent = supertest.agent(app.getHttpServer());

    await agent.delete(testingAllDataURI);
  });

  let aTokenUser01;
  let aTokenUser02;

  let user01Id;
  let user02Id;

  let blogId;
  let blog;

  let post01Id;
  let post02Id;
  let post01Db;
  let post02Db;

  describe('Users create and authenticate', () => {
    it(`should create two users`, async () => {
      const user01 = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(201);

      user01Id = user01.body.id;

      const user02 = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user02Login,
          password: userPassword,
          email: user02Email,
        })
        .expect(201);

      user02Id = user02.body.id;
    });
    it(`should log in user 01`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user01Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser01 = response.body.accessToken;
    });
    it(`should log in user 02`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user02Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser02 = response.body.accessToken;
    });
  });
  describe('Bind blog', () => {
    it(`should create new blog by user 01`, async () => {
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
    it(`should return 400 when trying to bind nonexistent blog`, async () => {
      const response = await agent
        .put(saBlogsURI + invalidURI + blogBindURI + user01Id)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(400);

      expect(response.body).toEqual(exceptionObject(blogIDField));
    });
    it(`should return 400 when trying to bind blog to nonexistent user`, async () => {
      const response = await agent
        .put(saBlogsURI + blogId + blogBindURI + invalidURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(400);

      expect(response.body).toEqual(exceptionObject(userIDField));
    });
    it(`should return 400 when trying to bind blog that is already bound`, async () => {
      const response = await agent
        .put(saBlogsURI + blogId + blogBindURI + user02Id)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(400);

      expect(response.body).toEqual(exceptionObject(blogIDField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to bind blog with incorrect credentials`, async () => {
      await agent
        .put(saBlogsURI + blogId + blogBindURI + user02Id)
        .auth(basicAuthLogin, randomUUID())
        .expect(401);
    });

    // Success
    it(`should delete user 01`, async () => {
      return agent
        .delete(saUsersURI + user01Id)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(204);
    });
    it(`should bind blog to user 02 and get all blogs`, async () => {
      await agent
        .put(saBlogsURI + blogId + blogBindURI + user02Id)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(204);

      const blogs = await agent
        .get(saBlogsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [saBlogObject],
      });
      expect(blogs.body.items[0].blogOwnerInfo.userId).toBe(user02Id);
      expect(blogs.body.items[0].blogOwnerInfo.userLogin).toBe(user02Login);
    });
  });
  describe('Ban blog', () => {
    it(`should create two posts`, async () => {
      const post01 = await agent
        .post(bloggerBlogsURI + blogId + publicPostsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      post01Id = post01.body.id;

      const post02 = await agent
        .post(bloggerBlogsURI + blogId + publicPostsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      post02Id = post02.body.id;
    });

    // Validation errors [400]
    it(`should return 400 when trying to ban blog without isBanned field`, async () => {
      const response = await agent
        .put(saBlogsURI + blogId + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(400);

      expect(response.body).toEqual(exceptionObject(isBannedField));
    });
    it(`should return 400 when trying to ban blog with incorrect isBanned type`, async () => {
      const response = await agent
        .put(saBlogsURI + blogId + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: 123,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(isBannedField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to ban blog with incorrect credentials`, async () => {
      await agent
        .put(saBlogsURI + blogId + banURI)
        .auth(randomUUID(), basicAuthPassword)
        .send({
          isBanned: true,
        })
        .expect(401);
    });

    // Success
    it(`should ban blog`, async () => {
      await agent
        .put(saBlogsURI + blogId + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
        })
        .expect(204);

      blog = await blogsRepository.findBlog(blogId);
      expect(blog.isBanned).toBeTruthy();

      post01Db = await postsRepository.findPost(post01Id);
      post02Db = await postsRepository.findPost(post02Id);

      expect(post01Db.blogInfo.blogIsBanned).toBeTruthy();
      expect(post02Db.blogInfo.blogIsBanned).toBeTruthy();
    });

    // Validation errors [400]
    it(`should return 400 when trying to ban blog one more time`, async () => {
      const response = await agent
        .put(saBlogsURI + blogId + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(blogIDField));
    });
  });
  describe('Unban blog', () => {
    // Success
    it(`should unban blog`, async () => {
      await agent
        .put(saBlogsURI + blogId + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: false,
        })
        .expect(204);

      blog = await blogsRepository.findBlog(blogId);
      expect(blog.isBanned).toBeFalsy();

      post01Db = await postsRepository.findPost(post01Id);
      post02Db = await postsRepository.findPost(post02Id);

      expect(post01Db.blogInfo.blogIsBanned).toBeFalsy();
      expect(post02Db.blogInfo.blogIsBanned).toBeFalsy();
    });

    // Validation errors [400]
    it(`should return 400 when trying to unban blog one more time`, async () => {
      const response = await agent
        .put(saBlogsURI + blogId + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: false,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(blogIDField));
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
