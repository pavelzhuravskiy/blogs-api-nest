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
  publicBlogsURI,
} from '../utils/constants/blogs.constants';
import { testingURI } from '../utils/constants/testing.constants';
import { customExceptionFactory } from '../../src/exceptions/exception.factory';
import { HttpExceptionFilter } from '../../src/exceptions/exception.filter';
import { AppModule } from '../../src/app.module';
import {
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
  loginUri,
} from '../utils/constants/auth.constants';
import { useContainer } from 'class-validator';
import { randomUUID } from 'crypto';
import { blog01Object } from '../utils/objects/blogs.objects';
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import { postObject } from '../utils/objects/posts.objects';
import {
  commentContent,
  publicCommentsURI,
} from '../utils/constants/comments.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import { contentField } from '../utils/constants/exceptions.constants';
import { invalidURI, longString508 } from '../utils/constants/common.constants';
import { commentObject } from '../utils/objects/comment.objects';

describe('Public blogs, posts, comments testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

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

    await app.init();
    agent = supertest.agent(app.getHttpServer());

    await agent.delete(testingURI);
  });

  let blogId;
  let postId;
  let commentId;

  let aTokenUser01;
  let aTokenUser02;

  describe('Users creation and authentication', () => {
    it(`should create two users`, async () => {
      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(201);

      return agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user02Login,
          password: userPassword,
          email: user02Email,
        })
        .expect(201);
    });
    it(`should log in user 01`, async () => {
      const response = await agent
        .post(loginUri)
        .send({
          loginOrEmail: user01Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser01 = response.body.accessToken;
    });
    it(`should log in user 02`, async () => {
      const response = await agent
        .post(loginUri)
        .send({
          loginOrEmail: user02Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser02 = response.body.accessToken;
    });
  });

  describe('Find blogs', () => {
    it(`should create new blog of user 01`, async () => {
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

    // Not found errors [404]
    it(`should return 404 when trying to get nonexistent blog`, async () => {
      return agent.get(publicBlogsURI + randomUUID()).expect(404);
    });

    // Success [200]
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
    it(`should return created blog by ID`, async () => {
      const blog = await agent.get(publicBlogsURI + blogId).expect(200);
      expect(blog.body).toEqual(blog01Object);

      blogId = blog.body.id;
    });
  });
  describe('Find posts', () => {
    it(`should create new post of user 01`, async () => {
      const post = await agent
        .post(bloggerBlogsURI + blogId + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      postId = post.body.id;
    });

    // Not found errors [404]
    it(`should return 404 when trying to get nonexistent post`, async () => {
      return agent.get(publicPostsURI + randomUUID()).expect(404);
    });
    it(`should return 404 when trying to get post for nonexistent blog`, async () => {
      return agent
        .get(publicBlogsURI + randomUUID() + publicPostsURI)
        .expect(404);
    });

    // Success [200]
    it(`should return created posts`, async () => {
      const posts = await agent.get(publicPostsURI).expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [postObject],
      });
    });
    it(`should return created post for blog`, async () => {
      const posts = await agent
        .get(publicBlogsURI + blogId + publicPostsURI)
        .expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [postObject],
      });
    });
    it(`should return created post by ID`, async () => {
      const post = await agent.get(publicPostsURI + postId).expect(200);
      expect(post.body).toEqual(postObject);
    });
  });
  describe('Create comment', () => {
    // Validation errors [400]
    it(`should return 400 when trying to create comment without content`, async () => {
      const response = await agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(contentField));
    });
    it(`should return 400 when trying to create comment with incorrect content type`, async () => {
      const response = await agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .send({
          content: 123,
        })
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(contentField));
    });
    it(`should return 400 when trying to create comment with incorrect content length`, async () => {
      const response = await agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .send({
          content: longString508,
        })
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(contentField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to create comment with incorrect access token`, async () => {
      return agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .send({
          content: commentContent,
        })
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Not found errors [404]
    it(`should return 404 when trying to create comment for nonexistent post`, async () => {
      return agent
        .get(publicPostsURI + invalidURI + publicCommentsURI)
        .expect(404);
    });

    // Success [201]
    it(`should create new comment for created post`, async () => {
      await agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          content: commentContent,
        })
        .expect(201);
    });
  });
  describe('Find comments', () => {
    // Not found errors [404]
    it(`should return 404 when trying to get nonexistent comment`, async () => {
      return agent.get(publicCommentsURI + randomUUID()).expect(404);
    });

    // Success [200]
    it(`should return created comments`, async () => {
      const comments = await agent
        .get(publicPostsURI + postId + publicCommentsURI)
        .expect(200);

      expect(comments.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [commentObject],
      });

      commentId = comments.body.items[0].id;
    });
    it(`should return comment by ID`, async () => {
      const comment = await agent
        .get(publicCommentsURI + commentId)
        .expect(200);

      expect(comment.body).toEqual(commentObject);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
