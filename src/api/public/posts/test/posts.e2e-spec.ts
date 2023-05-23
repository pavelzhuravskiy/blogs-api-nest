import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  blog01Name,
  blogDescription,
  blogWebsite,
  publicBlogsURI,
} from '../../../../../test/constants/blogs.constants';
import { testingURI } from '../../../../../test/constants/testing.constants';
import {
  postContent,
  postShortDescription,
  postTitle,
  postUpdatedContent,
  postUpdatedShortDescription,
  postUpdatedTitle,
  publicPostsURI,
} from '../../../../../test/constants/posts.constants';
import {
  postObject,
  updatedPostObject,
} from '../../../../../test/objects/posts.objects';
import { customExceptionFactory } from '../../../../exceptions/exception.factory';
import { HttpExceptionFilter } from '../../../../exceptions/exception.filter';
import { AppModule } from '../../../../app.module';

describe('Posts testing', () => {
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
  });

  let blog01Id;
  let blog02Id;

  let postId;

  describe('Posts CRUD operations', () => {
    beforeAll(async () => await agent.delete(testingURI));
    it(`should create new blog`, async () => {
      return agent
        .post(publicBlogsURI)
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(201);
    });
    it(`should create new post`, async () => {
      const blogs = await agent.get(publicBlogsURI).expect(200);
      blog01Id = blogs.body.items[0].id;

      return agent
        .post(publicPostsURI)
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
          blogId: blog01Id,
        })
        .expect(201);
    });
    it(`should create new post from blog`, async () => {
      return agent
        .post(publicBlogsURI + blog01Id + publicPostsURI)
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
          blogId: blog01Id,
        })
        .expect(201);
    });
    it(`should return all posts`, async () => {
      const posts = await agent.get(publicPostsURI).expect(200);
      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [postObject, postObject],
      });
    });
    it(`should return post by ID`, async () => {
      const posts = await agent.get(publicPostsURI).expect(200);
      postId = posts.body.items[0].id;

      const post = await agent.get(publicPostsURI + postId).expect(200);
      expect(post.body).toEqual(postObject);
    });
    it(`should update post by ID`, async () => {
      await agent
        .put(publicPostsURI + postId)
        .send({
          title: postUpdatedTitle,
          shortDescription: postUpdatedShortDescription,
          content: postUpdatedContent,
          blogId: blog01Id,
        })
        .expect(204);

      const check = await agent.get(publicPostsURI + postId).expect(200);
      expect(check.body).toEqual(updatedPostObject);
    });
    it(`should delete post by ID`, async () => {
      await agent.delete(publicPostsURI + postId).expect(204);

      const check = await agent.get(publicPostsURI).expect(200);
      expect(check.body.items).toHaveLength(1);
    });
  });
  describe('Posts filtering, sorting, pagination', () => {
    beforeAll(async () => await agent.delete(testingURI));
    it(`should create two blogs`, async () => {
      for (let i = 0; i < 2; i++) {
        await agent
          .post(publicBlogsURI)
          .send({
            name: blog01Name,
            description: blogDescription,
            websiteUrl: blogWebsite,
          })
          .expect(201);
      }
    });
    it(`should create 10 posts`, async () => {
      const blogs = await agent.get(publicBlogsURI).expect(200);
      blog01Id = blogs.body.items[0].id;
      blog02Id = blogs.body.items[1].id;

      for (let i = 1, j = 42; i < 6; i++, j--) {
        await agent
          .post(publicPostsURI)
          .send({
            title: `${postTitle} 0${i}`,
            shortDescription: `${j} ${postShortDescription}`,
            content: postContent,
            blogId: blog01Id,
          })
          .expect(201);
      }
      for (let i = 3, j = 99; i < 8; i++, j--) {
        await agent
          .post(publicPostsURI)
          .send({
            title: `${postTitle} 1${i}`,
            shortDescription: `${j} ${postShortDescription}`,
            content: postContent,
            blogId: blog02Id,
          })
          .expect(201);
      }
      const check = await agent.get(publicPostsURI).expect(200);
      expect(check.body.items).toHaveLength(10);
    });
    it(`should filter posts by blog`, async () => {
      const posts = await agent
        .get(publicBlogsURI + blog01Id + publicPostsURI)
        .expect(200);
      expect(posts.body.items).toHaveLength(5);
    });
    it(`should sort posts by date (desc)`, async () => {
      const posts = await agent.get(publicPostsURI).expect(200);

      expect(posts.body.items[0].title).toBe(`${postTitle} 17`);
      expect(posts.body.items[1].title).toBe(`${postTitle} 16`);
      expect(posts.body.items[2].title).toBe(`${postTitle} 15`);
      expect(posts.body.items[3].title).toBe(`${postTitle} 14`);
      expect(posts.body.items[4].title).toBe(`${postTitle} 13`);
      expect(posts.body.items[5].title).toBe(`${postTitle} 05`);
      expect(posts.body.items[6].title).toBe(`${postTitle} 04`);
      expect(posts.body.items[7].title).toBe(`${postTitle} 03`);
      expect(posts.body.items[8].title).toBe(`${postTitle} 02`);
      expect(posts.body.items[9].title).toBe(`${postTitle} 01`);
    });
    it(`should sort posts by short description (asc)`, async () => {
      const posts = await agent
        .get(publicPostsURI)
        .query({ sortBy: 'shortDescription', sortDirection: 'asc' })
        .expect(200);

      expect(posts.body.items[0].shortDescription).toBe(
        `38 ${postShortDescription}`,
      );
      expect(posts.body.items[1].shortDescription).toBe(
        `39 ${postShortDescription}`,
      );
      expect(posts.body.items[2].shortDescription).toBe(
        `40 ${postShortDescription}`,
      );
      expect(posts.body.items[3].shortDescription).toBe(
        `41 ${postShortDescription}`,
      );
      expect(posts.body.items[4].shortDescription).toBe(
        `42 ${postShortDescription}`,
      );
      expect(posts.body.items[5].shortDescription).toBe(
        `95 ${postShortDescription}`,
      );
      expect(posts.body.items[6].shortDescription).toBe(
        `96 ${postShortDescription}`,
      );
      expect(posts.body.items[7].shortDescription).toBe(
        `97 ${postShortDescription}`,
      );
      expect(posts.body.items[8].shortDescription).toBe(
        `98 ${postShortDescription}`,
      );
      expect(posts.body.items[9].shortDescription).toBe(
        `99 ${postShortDescription}`,
      );
    });
    it(`should return correct pagination output`, async () => {
      const posts = await agent
        .get(publicPostsURI)
        .query({ pageNumber: '2', pageSize: '5' })
        .expect(200);

      expect(posts.body.pagesCount).toBe(2);
      expect(posts.body.page).toBe(2);
      expect(posts.body.pageSize).toBe(5);
      expect(posts.body.totalCount).toBe(10);
      expect(posts.body.items).toHaveLength(5);
      expect(posts.body.items[0].title).toBe(`${postTitle} 05`);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
