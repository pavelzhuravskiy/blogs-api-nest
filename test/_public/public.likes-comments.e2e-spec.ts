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
import { customExceptionFactory } from '../../src/exceptions/exception.factory';
import { HttpExceptionFilter } from '../../src/exceptions/exception.filter';
import { AppModule } from '../../src/app.module';
import {
  saUsersURI,
  user01Email,
  user01Login,
  user02Email,
  user02Login,
  user03Email,
  user03Login,
  user04Email,
  user04Login,
  userPassword,
} from '../utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  publicLoginUri,
} from '../utils/constants/auth.constants';
import { useContainer } from 'class-validator';
import { randomUUID } from 'crypto';
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import {
  commentContent,
  publicCommentsURI,
} from '../utils/constants/comments.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import { likeStatusField } from '../utils/constants/exceptions.constants';
import { publicLikesURI } from '../utils/constants/likes.constants';
import { LikeStatus } from '../../src/enums/like-status.enum';

describe('Public likes for comments testing', () => {
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
    await agent.delete(testingAllDataURI);
  });

  let blogId;
  let postId;

  let comment01Id;
  let comment02Id;
  let comment03Id;
  let comment04Id;
  let comment05Id;
  let comment06Id;

  let aTokenUser01;
  let aTokenUser02;
  let aTokenUser03;
  let aTokenUser04;

  describe('Users creation and authentication', () => {
    it(`should create four users`, async () => {
      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(201);

      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user02Login,
          password: userPassword,
          email: user02Email,
        })
        .expect(201);

      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user03Login,
          password: userPassword,
          email: user03Email,
        })
        .expect(201);

      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user04Login,
          password: userPassword,
          email: user04Email,
        })
        .expect(201);
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
    it(`should log in user 03`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user03Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser03 = response.body.accessToken;
    });
    it(`should log in user 04`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user04Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser04 = response.body.accessToken;
    });
  });

  describe('Create blog, posts and comments', () => {
    it(`should create new blog`, async () => {
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
    it(`should create new post`, async () => {
      await agent
        .post(bloggerBlogsURI + blogId + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      const posts = await agent.get(publicPostsURI).expect(200);

      postId = posts.body.items[0].id;
    });

    it(`should create 6 comments`, async () => {
      let i = 0;
      while (i < 6) {
        await agent
          .post(publicPostsURI + postId + publicCommentsURI)
          .auth(aTokenUser01, { type: 'bearer' })
          .send({
            content: commentContent,
          })
          .expect(201);
        i++;
      }

      const comments = await agent
        .get(publicPostsURI + postId + publicCommentsURI)
        .expect(200);

      comment01Id = comments.body.items[0].id;
      comment02Id = comments.body.items[1].id;
      comment03Id = comments.body.items[2].id;
      comment04Id = comments.body.items[3].id;
      comment05Id = comments.body.items[4].id;
      comment06Id = comments.body.items[5].id;
    });
  });
  describe('Likes operations', () => {
    // Validation errors [400]
    it(`should return 400 when trying to like comment with incorrect like status`, async () => {
      const response = await agent
        .put(publicCommentsURI + comment01Id + publicLikesURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          likeStatus: randomUUID(),
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(likeStatusField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to like comment with incorrect access token`, async () => {
      return agent
        .put(publicCommentsURI + comment01Id + publicLikesURI)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(401);
    });
    // Success
    it('should like comment 01 by user 01', async () => {
      return agent
        .put(publicCommentsURI + comment01Id + publicLikesURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like comment 01 by user 02', async () => {
      return agent
        .put(publicCommentsURI + comment01Id + publicLikesURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like comment 02 by user 02', async () => {
      return agent
        .put(publicCommentsURI + comment02Id + publicLikesURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like comment 02 by user 03', async () => {
      return agent
        .put(publicCommentsURI + comment02Id + publicLikesURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should dislike comment 03 by user 01', async () => {
      return agent
        .put(publicCommentsURI + comment03Id + publicLikesURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Dislike,
        })
        .expect(204);
    });
    it('should like comment 04 by user 01', async () => {
      return agent
        .put(publicCommentsURI + comment04Id + publicLikesURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like comment 04 by user 04', async () => {
      return agent
        .put(publicCommentsURI + comment04Id + publicLikesURI)
        .auth(aTokenUser04, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like comment 04 by user 02', async () => {
      return agent
        .put(publicCommentsURI + comment04Id + publicLikesURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like comment 04 by user 03', async () => {
      return agent
        .put(publicCommentsURI + comment04Id + publicLikesURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like comment 05 by user 02', async () => {
      return agent
        .put(publicCommentsURI + comment05Id + publicLikesURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should dislike comment 05 by user 03', async () => {
      return agent
        .put(publicCommentsURI + comment05Id + publicLikesURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Dislike,
        })
        .expect(204);
    });
    it('should like comment 06 by user 01', async () => {
      return agent
        .put(publicCommentsURI + comment06Id + publicLikesURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should dislike comment 06 by user 02', async () => {
      return agent
        .put(publicCommentsURI + comment06Id + publicLikesURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Dislike,
        })
        .expect(204);
    });
    it('should return correct likes/dislikes counters values', async () => {
      const comments = await agent
        .get(publicPostsURI + postId + publicCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      // Comment 01
      expect(comments.body.items[0].likesInfo.likesCount).toBe(2);
      expect(comments.body.items[0].likesInfo.dislikesCount).toBe(0);

      expect(comments.body.items[0].likesInfo.myStatus).toBe(LikeStatus.Like);

      // Comment 02
      expect(comments.body.items[1].likesInfo.likesCount).toBe(2);
      expect(comments.body.items[1].likesInfo.dislikesCount).toBe(0);

      expect(comments.body.items[1].likesInfo.myStatus).toBe(LikeStatus.None);

      // Comment 03
      expect(comments.body.items[2].likesInfo.likesCount).toBe(0);
      expect(comments.body.items[2].likesInfo.dislikesCount).toBe(1);

      expect(comments.body.items[2].likesInfo.myStatus).toBe(
        LikeStatus.Dislike,
      );

      // Comment 04
      expect(comments.body.items[3].likesInfo.likesCount).toBe(4);
      expect(comments.body.items[3].likesInfo.dislikesCount).toBe(0);

      expect(comments.body.items[2].likesInfo.myStatus).toBe(
        LikeStatus.Dislike,
      );

      // Comment 05
      expect(comments.body.items[4].likesInfo.likesCount).toBe(1);
      expect(comments.body.items[4].likesInfo.dislikesCount).toBe(1);

      expect(comments.body.items[4].likesInfo.myStatus).toBe(LikeStatus.None);

      // Comment 06
      expect(comments.body.items[5].likesInfo.likesCount).toBe(1);
      expect(comments.body.items[5].likesInfo.dislikesCount).toBe(1);

      expect(comments.body.items[5].likesInfo.myStatus).toBe(LikeStatus.Like);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
