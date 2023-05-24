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
  user03Email,
  user03Login,
  user04Email,
  user04Login,
  userPassword,
} from '../utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  loginUri,
} from '../utils/constants/auth.constants';
import { useContainer } from 'class-validator';
import { randomUUID } from 'crypto';
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import { likeStatusField } from '../utils/constants/exceptions.constants';
import { publicLikesURI } from '../utils/constants/likes.constants';
import { LikeStatus } from '../../src/enums/like-status.enum';

describe('Public likes for posts testing', () => {
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

  let post01Id;
  let post02Id;
  let post03Id;
  let post04Id;
  let post05Id;
  let post06Id;

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
    it(`should log in user 03`, async () => {
      const response = await agent
        .post(loginUri)
        .send({
          loginOrEmail: user03Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser03 = response.body.accessToken;
    });
    it(`should log in user 04`, async () => {
      const response = await agent
        .post(loginUri)
        .send({
          loginOrEmail: user04Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser04 = response.body.accessToken;
    });
  });

  describe('Create blog and posts', () => {
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
    it(`should create 6 posts`, async () => {
      let i = 0;
      while (i < 6) {
        await agent
          .post(bloggerBlogsURI + blogId + publicPostsURI)
          .auth(aTokenUser01, { type: 'bearer' })
          .send({
            title: postTitle,
            shortDescription: postShortDescription,
            content: postContent,
          })
          .expect(201);
        i++;
      }

      const posts = await agent.get(publicPostsURI).expect(200);

      post01Id = posts.body.items[0].id;
      post02Id = posts.body.items[1].id;
      post03Id = posts.body.items[2].id;
      post04Id = posts.body.items[3].id;
      post05Id = posts.body.items[4].id;
      post06Id = posts.body.items[5].id;
    });
  });
  describe('Likes operations', () => {
    // Validation errors [400]
    it(`should return 400 when trying to like post with incorrect like status`, async () => {
      const response = await agent
        .put(publicPostsURI + post01Id + publicLikesURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          likeStatus: randomUUID(),
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(likeStatusField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to like post with incorrect access token`, async () => {
      return agent
        .put(publicPostsURI + post01Id + publicLikesURI)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(401);
    });

    // Success
    it('should like post 01 by user 01', async () => {
      return agent
        .put(publicPostsURI + post01Id + publicLikesURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like post 01 by user 02', async () => {
      return agent
        .put(publicPostsURI + post01Id + publicLikesURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like post 02 by user 02', async () => {
      return agent
        .put(publicPostsURI + post02Id + publicLikesURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like post 02 by user 03', async () => {
      return agent
        .put(publicPostsURI + post02Id + publicLikesURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should dislike post 03 by user 01', async () => {
      return agent
        .put(publicPostsURI + post03Id + publicLikesURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Dislike,
        })
        .expect(204);
    });
    it('should like post 04 by user 01', async () => {
      return agent
        .put(publicPostsURI + post04Id + publicLikesURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like post 04 by user 04', async () => {
      return agent
        .put(publicPostsURI + post04Id + publicLikesURI)
        .auth(aTokenUser04, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like post 04 by user 02', async () => {
      return agent
        .put(publicPostsURI + post04Id + publicLikesURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like post 04 by user 03', async () => {
      return agent
        .put(publicPostsURI + post04Id + publicLikesURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like post 05 by user 02', async () => {
      return agent
        .put(publicPostsURI + post05Id + publicLikesURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should dislike post 05 by user 03', async () => {
      return agent
        .put(publicPostsURI + post05Id + publicLikesURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Dislike,
        })
        .expect(204);
    });
    it('should like post 06 by user 01', async () => {
      return agent
        .put(publicPostsURI + post06Id + publicLikesURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should dislike post 06 by user 02', async () => {
      return agent
        .put(publicPostsURI + post06Id + publicLikesURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Dislike,
        })
        .expect(204);
    });
    it('should return correct likes/dislikes counters values', async () => {
      const posts = await agent
        .get(publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      // Post 01
      expect(posts.body.items[0].extendedLikesInfo.likesCount).toBe(2);
      expect(posts.body.items[0].extendedLikesInfo.dislikesCount).toBe(0);

      expect(posts.body.items[0].extendedLikesInfo.myStatus).toBe(
        LikeStatus.Like,
      );

      expect(posts.body.items[0].extendedLikesInfo.newestLikes[0].login).toBe(
        user02Login,
      );
      expect(posts.body.items[0].extendedLikesInfo.newestLikes[1].login).toBe(
        user01Login,
      );

      // Post 02
      expect(posts.body.items[1].extendedLikesInfo.likesCount).toBe(2);
      expect(posts.body.items[1].extendedLikesInfo.dislikesCount).toBe(0);

      expect(posts.body.items[1].extendedLikesInfo.myStatus).toBe(
        LikeStatus.None,
      );

      expect(posts.body.items[1].extendedLikesInfo.newestLikes[0].login).toBe(
        user03Login,
      );
      expect(posts.body.items[1].extendedLikesInfo.newestLikes[1].login).toBe(
        user02Login,
      );

      // Post 03
      expect(posts.body.items[2].extendedLikesInfo.likesCount).toBe(0);
      expect(posts.body.items[2].extendedLikesInfo.dislikesCount).toBe(1);

      expect(posts.body.items[2].extendedLikesInfo.myStatus).toBe(
        LikeStatus.Dislike,
      );

      expect(posts.body.items[2].extendedLikesInfo.newestLikes).toHaveLength(0);

      // Post 04
      expect(posts.body.items[3].extendedLikesInfo.likesCount).toBe(4);
      expect(posts.body.items[3].extendedLikesInfo.dislikesCount).toBe(0);

      expect(posts.body.items[2].extendedLikesInfo.myStatus).toBe(
        LikeStatus.Dislike,
      );

      expect(posts.body.items[3].extendedLikesInfo.newestLikes).toHaveLength(3);
      expect(posts.body.items[3].extendedLikesInfo.newestLikes[0].login).toBe(
        user03Login,
      );
      expect(posts.body.items[3].extendedLikesInfo.newestLikes[1].login).toBe(
        user02Login,
      );
      expect(posts.body.items[3].extendedLikesInfo.newestLikes[2].login).toBe(
        user04Login,
      );

      // Post 05
      expect(posts.body.items[4].extendedLikesInfo.likesCount).toBe(1);
      expect(posts.body.items[4].extendedLikesInfo.dislikesCount).toBe(1);

      expect(posts.body.items[4].extendedLikesInfo.myStatus).toBe(
        LikeStatus.None,
      );

      expect(posts.body.items[4].extendedLikesInfo.newestLikes[0].login).toBe(
        user02Login,
      );

      // Post 06
      expect(posts.body.items[5].extendedLikesInfo.likesCount).toBe(1);
      expect(posts.body.items[5].extendedLikesInfo.dislikesCount).toBe(1);

      expect(posts.body.items[5].extendedLikesInfo.myStatus).toBe(
        LikeStatus.Like,
      );

      expect(posts.body.items[5].extendedLikesInfo.newestLikes[0].login).toBe(
        user01Login,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
