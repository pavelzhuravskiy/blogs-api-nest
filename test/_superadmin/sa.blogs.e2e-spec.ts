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
  publicBlogsURI,
  saBlogsURI,
} from '../utils/constants/blogs.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import { invalidURI } from '../utils/constants/common.constants';
import {
  blogIDField,
  userIDField,
} from '../../src/exceptions/exception.constants';
import { randomUUID } from 'crypto';
import {
  blog01Object,
  saBannedBlogObject,
  saUnbannedBlogObject,
} from '../utils/objects/blogs.objects';
import { isBannedField } from '../utils/constants/exceptions.constants';
import { BlogsMongooseRepository } from '../../src/api/infrastructure/_mongoose/blogs/blogs.repository';
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import { PostsMongooseRepository } from '../../src/api/infrastructure/_mongoose/posts/posts.repository';
import { postObject } from '../utils/objects/posts.objects';

describe('Super admin blogs testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let blogsRepository: BlogsMongooseRepository;
  let postsRepository: PostsMongooseRepository;

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
    blogsRepository = app.get(BlogsMongooseRepository);
    postsRepository = app.get(PostsMongooseRepository);
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
        items: [saUnbannedBlogObject],
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
    it(`should return created blogs`, async () => {
      const blogs = await agent.get(publicBlogsURI).expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blog01Object],
      });
    });
    it(`should return created posts`, async () => {
      const posts = await agent.get(publicPostsURI).expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [postObject, postObject],
      });
    });
    it(`should return created posts for blog`, async () => {
      const posts = await agent
        .get(publicBlogsURI + blogId + publicPostsURI)
        .expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [postObject, postObject],
      });
    });
    it(`should return created blog by ID`, async () => {
      const blog = await agent.get(publicBlogsURI + blogId).expect(200);
      expect(blog.body).toEqual(blog01Object);
    });
    it(`should return created post by ID`, async () => {
      const post01 = await agent.get(publicPostsURI + post01Id).expect(200);
      const post02 = await agent.get(publicPostsURI + post02Id).expect(200);
      expect(post01.body).toEqual(postObject);
      expect(post02.body).toEqual(postObject);
    });

    it(`should ban blog`, async () => {
      await agent
        .put(saBlogsURI + blogId + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
        })
        .expect(204);

      blog = await blogsRepository.findBlog(blogId);
      expect(blog.banInfo.isBanned).toBeTruthy();

      post01Db = await postsRepository.findPost(post01Id);
      post02Db = await postsRepository.findPost(post02Id);

      expect(post01Db.blogInfo.blogIsBanned).toBeTruthy();
      expect(post02Db.blogInfo.blogIsBanned).toBeTruthy();
    });

    it(`should return created blogs for blogger`, async () => {
      const blogs = await agent
        .get(bloggerBlogsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blog01Object],
      });
    });
    it(`should return created blogs for super admin`, async () => {
      const blogs = await agent
        .get(saBlogsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [saBannedBlogObject],
      });
    });
    it(`should NOT return created blogs for public user`, async () => {
      const posts = await agent.get(publicBlogsURI).expect(200);

      expect(posts.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it(`should NOT return created blog by ID`, async () => {
      return agent.get(publicBlogsURI + blogId).expect(404);
    });
    it(`should NOT return created posts after blog ban`, async () => {
      const posts = await agent.get(publicPostsURI).expect(200);

      expect(posts.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it(`should NOT return created posts for blog after blog ban`, async () => {
      const posts = await agent
        .get(publicBlogsURI + blogId + publicPostsURI)
        .expect(200);

      expect(posts.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it(`should NOT return created post by ID after blog ban`, async () => {
      await agent.get(publicPostsURI + post01Id).expect(404);
      await agent.get(publicPostsURI + post02Id).expect(404);
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

    it(`should return created blogs for public user`, async () => {
      const posts = await agent.get(publicBlogsURI).expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blog01Object],
      });
    });
    it(`should return created blog by ID`, async () => {
      const blog = await agent.get(publicBlogsURI + blogId).expect(200);
      expect(blog.body).toEqual(blog01Object);
    });
    it(`should return created posts`, async () => {
      const posts = await agent.get(publicPostsURI).expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [postObject, postObject],
      });
    });
    it(`should return created posts for blog`, async () => {
      const posts = await agent
        .get(publicBlogsURI + blogId + publicPostsURI)
        .expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [postObject, postObject],
      });
    });
    it(`should return created post by ID`, async () => {
      const post01 = await agent.get(publicPostsURI + post01Id).expect(200);
      const post02 = await agent.get(publicPostsURI + post02Id).expect(200);
      expect(post01.body).toEqual(postObject);
      expect(post02.body).toEqual(postObject);
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
