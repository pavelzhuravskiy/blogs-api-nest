import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
  descriptionField,
  nameField,
  urlField,
} from '../../../test/constants/blogs.constants';
import { testingURI } from '../../../test/constants/testing.constants';
import {
  blogObject,
  updatedBlogObject,
} from '../../../test/objects/blogs.objects';
import {
  invalidURI,
  longString109,
  longString17,
  longString508,
} from '../../../test/constants/common.constants';
import { customExceptionFactory } from '../../exceptions/exception.factory';
import { HttpExceptionFilter } from '../../exceptions/exception.filter';
import { exceptionObject } from '../../../test/objects/common.objects';

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

  let blogId;

  describe('Blogs status 400 checks', () => {
    beforeAll(async () => await agent.delete(testingURI));
    it(`should return 400 when trying to create blog without name`, async () => {
      const response = await agent
        .post(blogsURI)
        .send({
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(nameField));
    });
    it(`should return 400 when trying to create blog with incorrect name type`, async () => {
      const response = await agent
        .post(blogsURI)
        .send({
          name: 123,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(nameField));
    });
    it(`should return 400 when trying to create blog with incorrect name length`, async () => {
      const response = await agent
        .post(blogsURI)
        .send({
          name: longString17,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(nameField));
    });
    it(`should return 400 when trying to create blog without description`, async () => {
      const response = await agent
        .post(blogsURI)
        .send({
          name: blogName,
          websiteUrl: blogWebsite,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(descriptionField));
    });
    it(`should return 400 when trying to create blog with incorrect description type`, async () => {
      const response = await agent
        .post(blogsURI)
        .send({
          name: blogName,
          description: 123,
          websiteUrl: blogWebsite,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(descriptionField));
    });
    it(`should return 400 when trying to create blog with incorrect description length`, async () => {
      const response = await agent
        .post(blogsURI)
        .send({
          name: blogName,
          description: longString508,
          websiteUrl: blogWebsite,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(descriptionField));
    });
    it(`should return 400 when trying to create blog without URL`, async () => {
      const response = await agent
        .post(blogsURI)
        .send({
          name: blogName,
          description: blogDescription,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(urlField));
    });
    it(`should return 400 when trying to create blog with incorrect URL type`, async () => {
      const response = await agent
        .post(blogsURI)
        .send({
          name: blogName,
          description: blogDescription,
          websiteUrl: 123,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(urlField));
    });
    it(`should return 400 when trying to create blog with incorrect URL length`, async () => {
      const response = await agent
        .post(blogsURI)
        .send({
          name: blogName,
          description: blogDescription,
          websiteUrl: longString109,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(urlField));
    });
    it(`should return 400 when trying to create blog with incorrect URL format`, async () => {
      const response = await agent
        .post(blogsURI)
        .send({
          name: blogName,
          description: blogDescription,
          websiteUrl: urlField,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(urlField));
    });
  });
  describe('Blogs status 404 checks', () => {
    beforeAll(async () => await agent.delete(testingURI));
    it(`should return 404 when getting nonexistent blog`, async () => {
      return agent.get(blogsURI + invalidURI).expect(404);
    });
    it(`should return 404 when updating nonexistent blog`, async () => {
      return agent
        .put(blogsURI + invalidURI)
        .send({
          name: blogUpdatedName,
          description: blogUpdatedDescription,
          websiteUrl: blogUpdatedWebsite,
        })
        .expect(404);
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
  describe('Blogs filtering, sorting, pagination', () => {
    beforeAll(async () => await agent.delete(testingURI));
    it(`should create 10 blogs`, async () => {
      for (let i = 1, j = 42; i < 6; i++, j--) {
        await agent
          .post(blogsURI)
          .send({
            name: `${blogName} 0${i}`,
            description: `${j} ${blogDescription}`,
            websiteUrl: blogWebsite,
          })
          .expect(201);
      }
      for (let i = 3, j = 99; i < 8; i++, j--) {
        await agent
          .post(blogsURI)
          .send({
            name: `${blogName} 1${i}`,
            description: `${j} ${blogDescription}`,
            websiteUrl: blogWebsite,
          })
          .expect(201);
      }
      const check = await agent.get(blogsURI).expect(200);
      expect(check.body.items).toHaveLength(10);
    });
    it(`should filter blogs by term`, async () => {
      const blogs = await agent
        .get(blogsURI)
        .query({ searchNameTerm: '3' })
        .expect(200);

      expect(blogs.body.items).toHaveLength(2);
      expect(blogs.body.items[0].name).toBe(`${blogName} 13`);
      expect(blogs.body.items[1].name).toBe(`${blogName} 03`);
    });
    it(`should sort blogs by date (desc)`, async () => {
      const blogs = await agent.get(blogsURI).expect(200);

      expect(blogs.body.items[0].name).toBe(`${blogName} 17`);
      expect(blogs.body.items[1].name).toBe(`${blogName} 16`);
      expect(blogs.body.items[2].name).toBe(`${blogName} 15`);
      expect(blogs.body.items[3].name).toBe(`${blogName} 14`);
      expect(blogs.body.items[4].name).toBe(`${blogName} 13`);
      expect(blogs.body.items[5].name).toBe(`${blogName} 05`);
      expect(blogs.body.items[6].name).toBe(`${blogName} 04`);
      expect(blogs.body.items[7].name).toBe(`${blogName} 03`);
      expect(blogs.body.items[8].name).toBe(`${blogName} 02`);
      expect(blogs.body.items[9].name).toBe(`${blogName} 01`);
    });
    it(`should sort blogs by description (asc)`, async () => {
      const blogs = await agent
        .get(blogsURI)
        .query({ sortBy: 'description', sortDirection: 'asc' })
        .expect(200);

      expect(blogs.body.items[0].description).toBe(`38 ${blogDescription}`);
      expect(blogs.body.items[1].description).toBe(`39 ${blogDescription}`);
      expect(blogs.body.items[2].description).toBe(`40 ${blogDescription}`);
      expect(blogs.body.items[3].description).toBe(`41 ${blogDescription}`);
      expect(blogs.body.items[4].description).toBe(`42 ${blogDescription}`);
      expect(blogs.body.items[5].description).toBe(`95 ${blogDescription}`);
      expect(blogs.body.items[6].description).toBe(`96 ${blogDescription}`);
      expect(blogs.body.items[7].description).toBe(`97 ${blogDescription}`);
      expect(blogs.body.items[8].description).toBe(`98 ${blogDescription}`);
      expect(blogs.body.items[9].description).toBe(`99 ${blogDescription}`);
    });
    it(`should return correct pagination output`, async () => {
      const blogs = await agent
        .get(blogsURI)
        .query({ pageNumber: '2', pageSize: '5' })
        .expect(200);

      expect(blogs.body.pagesCount).toBe(2);
      expect(blogs.body.page).toBe(2);
      expect(blogs.body.pageSize).toBe(5);
      expect(blogs.body.totalCount).toBe(10);
      expect(blogs.body.items).toHaveLength(5);
      expect(blogs.body.items[0].name).toBe(`${blogName} 05`);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
