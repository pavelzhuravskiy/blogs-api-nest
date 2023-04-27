import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MainModule } from '../../modules/main.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  blogDescription,
  blogName,
  blogsURI,
  blogUpdatedDescription,
  blogUpdatedName,
  blogUpdatedWebsite,
  blogWebsite,
} from '../../../test/constants/blogs.constants';
import { testingURI } from '../../../test/constants/testing.constants';
import {
  blogObject,
  updatedBlogObject,
} from '../../../test/objects/blogs.objects';
import { invalidURI } from '../../../test/constants/common.constants';

describe('Blogs testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.TEST_URI || ''),
        MainModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    agent = supertest.agent(app.getHttpServer());
  });

  describe('Blogs status 404 checks', () => {
    beforeAll(async () => await agent.delete(testingURI));
    it(`should return 404 when getting nonexistent blog`, async () => {
      return agent.get(blogsURI + invalidURI).expect(404);
    });
    it(`should return 404 when updating nonexistent blog`, async () => {
      return agent.put(blogsURI + invalidURI).expect(404);
    });
    it(`should return 404 when deleting nonexistent blog`, async () => {
      return agent.delete(blogsURI + invalidURI).expect(404);
    });
  });
  describe('Blogs CRUD operations', () => {
    beforeAll(async () => await agent.delete(testingURI));
    it(`should create new blog`, async () => {
      return agent
        .post(blogsURI)
        .send({
          name: blogName,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(201);
    });
    it(`should return all blogs`, async () => {
      const blogs = await agent.get(blogsURI).expect(200);
      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blogObject],
      });
    });

    let blogId;

    it(`should return blog by ID`, async () => {
      const blogs = await agent.get(blogsURI).expect(200);
      blogId = blogs.body.items[0].id;

      const blog = await agent.get(blogsURI + blogId).expect(200);
      expect(blog.body).toEqual(blogObject);
    });
    it(`should update blog by ID`, async () => {
      await agent
        .put(blogsURI + blogId)
        .send({
          name: blogUpdatedName,
          description: blogUpdatedDescription,
          websiteUrl: blogUpdatedWebsite,
        })
        .expect(204);

      const check = await agent.get(blogsURI + blogId).expect(200);
      expect(check.body).toEqual(updatedBlogObject);
    });
    it(`should delete blog by ID`, async () => {
      await agent.delete(blogsURI + blogId).expect(204);

      const check = await agent.get(blogsURI).expect(200);
      expect(check.body.items).toHaveLength(0);
    });
  });
  describe('Blogs filtering', () => {
    beforeAll(async () => await agent.delete(testingURI));
    it(`should create 5 blogs`, async () => {});
  });

  afterAll(async () => {
    await app.close();
  });
});
