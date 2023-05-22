import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  blogDescription,
  bloggerBlogsURI,
  blog01Name,
  blogUpdatedDescription,
  blogUpdatedName,
  blogUpdatedWebsite,
  blogWebsite,
  publicBlogsURI,
  blog02Name,
} from '../../../../test/constants/blogs.constants';
import { testingURI } from '../../../../test/constants/testing.constants';
import {
  invalidURI,
  longString109,
  longString17,
  longString508,
} from '../../../../test/constants/common.constants';
import { customExceptionFactory } from '../../../exceptions/exception.factory';
import { HttpExceptionFilter } from '../../../exceptions/exception.filter';
import { exceptionObject } from '../../../../test/objects/common.objects';
import {
  descriptionField,
  nameField,
  titleField,
  urlField,
} from '../../../../test/constants/exceptions.constants';
import { AppModule } from '../../../app.module';
import {
  user01Email,
  user01Login,
  user02Email,
  user02Login,
  userPassword,
  usersURI,
} from '../../../../test/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  loginUri,
} from '../../../../test/constants/auth.constants';
import { useContainer } from 'class-validator';
import { randomUUID } from 'crypto';
import {
  blog01Object,
  blog02Object,
  updatedBlogObject,
} from '../../../../test/objects/blogs.objects';
import {
  postContent,
  postShortDescription,
  publicPostsURI,
} from '../../../../test/constants/posts.constants';

describe('Blogs testing', () => {
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
  });

  let blog01Id;
  let blog02Id;
  let aTokenUser01;
  let aTokenUser02;

  describe('Blogs CRUD operations', () => {
    beforeAll(async () => await agent.delete(testingURI));

    // Create and login users
    it(`should create two users`, async () => {
      await agent
        .post(usersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(201);

      return agent
        .post(usersURI)
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

    describe('[Blogger] use-cases', () => {
      describe('Create blog', () => {
        // Validation errors [400]
        it(`should return 400 when trying to create blog without name`, async () => {
          const response = await agent
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              description: blogDescription,
              websiteUrl: blogWebsite,
            })
            .expect(400);

          expect(response.body).toEqual(exceptionObject(nameField));
        });
        it(`should return 400 when trying to create blog with incorrect name type`, async () => {
          const response = await agent
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
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
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
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
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              name: blog01Name,
              websiteUrl: blogWebsite,
            })
            .expect(400);

          expect(response.body).toEqual(exceptionObject(descriptionField));
        });
        it(`should return 400 when trying to create blog with incorrect description type`, async () => {
          const response = await agent
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              name: blog01Name,
              description: 123,
              websiteUrl: blogWebsite,
            })
            .expect(400);

          expect(response.body).toEqual(exceptionObject(descriptionField));
        });
        it(`should return 400 when trying to create blog with incorrect description length`, async () => {
          const response = await agent
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              name: blog01Name,
              description: longString508,
              websiteUrl: blogWebsite,
            })
            .expect(400);

          expect(response.body).toEqual(exceptionObject(descriptionField));
        });
        it(`should return 400 when trying to create blog without URL`, async () => {
          const response = await agent
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              name: blog01Name,
              description: blogDescription,
            })
            .expect(400);

          expect(response.body).toEqual(exceptionObject(urlField));
        });
        it(`should return 400 when trying to create blog with incorrect URL type`, async () => {
          const response = await agent
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              name: blog01Name,
              description: blogDescription,
              websiteUrl: 123,
            })
            .expect(400);

          expect(response.body).toEqual(exceptionObject(urlField));
        });
        it(`should return 400 when trying to create blog with incorrect URL length`, async () => {
          const response = await agent
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              name: blog01Name,
              description: blogDescription,
              websiteUrl: longString109,
            })
            .expect(400);

          expect(response.body).toEqual(exceptionObject(urlField));
        });
        it(`should return 400 when trying to create blog with incorrect URL format`, async () => {
          const response = await agent
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              name: blog01Name,
              description: blogDescription,
              websiteUrl: urlField,
            })
            .expect(400);

          expect(response.body).toEqual(exceptionObject(urlField));
        });

        // Auth errors [401]
        it(`should return 401 when trying to create blog with incorrect access token`, async () => {
          return agent
            .post(bloggerBlogsURI)
            .auth(randomUUID(), { type: 'bearer' })
            .send({
              name: blog01Name,
              description: blogDescription,
              websiteUrl: blogWebsite,
            })
            .expect(401);
        });

        // Success [201]
        it(`should create new blog of user 01`, async () => {
          return agent
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              name: blog01Name,
              description: blogDescription,
              websiteUrl: blogWebsite,
            })
            .expect(201);
        });
        it(`should create new blog of user 02`, async () => {
          return agent
            .post(bloggerBlogsURI)
            .auth(aTokenUser02, { type: 'bearer' })
            .send({
              name: blog02Name,
              description: blogDescription,
              websiteUrl: blogWebsite,
            })
            .expect(201);
        });
      });
      describe('Find blogs', () => {
        // Auth errors [401]
        it(`should return 401 when trying to get blogs with incorrect access token`, async () => {
          return agent
            .get(bloggerBlogsURI)
            .auth(randomUUID(), { type: 'bearer' })
            .expect(401);
        });

        // Success
        it(`should return blog of user 01 (not user 02)`, async () => {
          const blogs = await agent
            .get(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .expect(200);

          blog01Id = blogs.body.items[0].id;

          expect(blogs.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [blog01Object],
          });
        });
        it(`should return blog of user 02 (not user 01)`, async () => {
          const blogs = await agent
            .get(bloggerBlogsURI)
            .auth(aTokenUser02, { type: 'bearer' })
            .expect(200);

          blog02Id = blogs.body.items[0].id;

          expect(blogs.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [blog02Object],
          });
        });
      });
      describe('Update blog', () => {
        // Auth errors [401]
        it(`should return 401 when trying to update blog with incorrect access token`, async () => {
          return agent
            .put(bloggerBlogsURI + blog01Id)
            .auth(randomUUID(), { type: 'bearer' })
            .send({
              name: blogUpdatedName,
              description: blogUpdatedDescription,
              websiteUrl: blogUpdatedWebsite,
            })
            .expect(401);
        });

        // Forbidden errors [403]
        it(`should return 403 when trying to update blog of another user`, async () => {
          await agent
            .put(bloggerBlogsURI + blog01Id)
            .auth(aTokenUser02, { type: 'bearer' })
            .send({
              name: blogUpdatedName,
              description: blogUpdatedDescription,
              websiteUrl: blogUpdatedWebsite,
            })
            .expect(403);
        });

        // Not found errors [404]
        it(`should return 404 when trying to update nonexistent blog`, async () => {
          await agent
            .put(bloggerBlogsURI + invalidURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              name: blogUpdatedName,
              description: blogUpdatedDescription,
              websiteUrl: blogUpdatedWebsite,
            })
            .expect(404);
        });

        // Success
        it(`should update blog by ID`, async () => {
          await agent
            .put(bloggerBlogsURI + blog01Id)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              name: blogUpdatedName,
              description: blogUpdatedDescription,
              websiteUrl: blogUpdatedWebsite,
            })
            .expect(204);

          const check = await agent.get(publicBlogsURI + blog01Id).expect(200);
          expect(check.body).toEqual(updatedBlogObject);
        });
      });
      describe('Create post', () => {
        // Validation errors [400]
        it(`should return 400 when trying to create post without title`, async () => {
          const response = await agent
            .post(bloggerBlogsURI + blog01Id + publicPostsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              shortDescription: postShortDescription,
              content: postContent,
            })
            .expect(400);

          expect(response.body).toEqual(exceptionObject(titleField));
        });
      });
      describe('Delete blog', () => {
        // Auth errors [401]
        it(`should return 401 when trying to delete blog with incorrect access token`, async () => {
          return agent
            .delete(bloggerBlogsURI + blog01Id)
            .auth(randomUUID(), { type: 'bearer' })
            .expect(401);
        });

        // Forbidden errors [403]
        it(`should return 403 when trying to delete blog of another user`, async () => {
          await agent
            .delete(bloggerBlogsURI + blog01Id)
            .auth(aTokenUser02, { type: 'bearer' })
            .expect(403);
        });

        // Not found errors [404]
        it(`should return 404 when trying to delete nonexistent blog`, async () => {
          await agent
            .delete(bloggerBlogsURI + invalidURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .expect(404);
        });

        // Success
        it(`should delete both blogs by ID`, async () => {
          await agent
            .delete(bloggerBlogsURI + blog01Id)
            .auth(aTokenUser01, { type: 'bearer' })
            .expect(204);

          await agent
            .delete(bloggerBlogsURI + blog02Id)
            .auth(aTokenUser02, { type: 'bearer' })
            .expect(204);

          const blogs = await agent.get(publicBlogsURI).expect(200);
          expect(blogs.body).toEqual({
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: [],
          });
        });
      });
    });
    describe('Blogs filtering, sorting, pagination', () => {
      beforeAll(async () => await agent.delete(testingURI));

      // Create and login users
      it(`should create user`, async () => {
        await agent
          .post(usersURI)
          .auth(basicAuthLogin, basicAuthPassword)
          .send({
            login: user01Login,
            password: userPassword,
            email: user01Email,
          })
          .expect(201);
      });
      it(`should log in user`, async () => {
        const response = await agent
          .post(loginUri)
          .send({
            loginOrEmail: user01Login,
            password: userPassword,
          })
          .expect(200);
        aTokenUser01 = response.body.accessToken;
      });

      it(`should create 10 blogs`, async () => {
        for (let i = 1, j = 42; i < 6; i++, j--) {
          await agent
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              name: `${blog01Name} 0${i}`,
              description: `${j} ${blogDescription}`,
              websiteUrl: blogWebsite,
            })
            .expect(201);
        }
        for (let i = 3, j = 99; i < 8; i++, j--) {
          await agent
            .post(bloggerBlogsURI)
            .auth(aTokenUser01, { type: 'bearer' })
            .send({
              name: `${blog01Name} 1${i}`,
              description: `${j} ${blogDescription}`,
              websiteUrl: blogWebsite,
            })
            .expect(201);
        }
        const check = await agent.get(publicBlogsURI).expect(200);
        expect(check.body.items).toHaveLength(10);
      });
      it(`should filter blogs by term`, async () => {
        const blogs = await agent
          .get(publicBlogsURI)
          .query({ searchNameTerm: '3' })
          .expect(200);

        expect(blogs.body.items).toHaveLength(2);
        expect(blogs.body.items[0].name).toBe(`${blog01Name} 13`);
        expect(blogs.body.items[1].name).toBe(`${blog01Name} 03`);
      });
      it(`should sort blogs by date (desc)`, async () => {
        const blogs = await agent.get(publicBlogsURI).expect(200);

        expect(blogs.body.items[0].name).toBe(`${blog01Name} 17`);
        expect(blogs.body.items[1].name).toBe(`${blog01Name} 16`);
        expect(blogs.body.items[2].name).toBe(`${blog01Name} 15`);
        expect(blogs.body.items[3].name).toBe(`${blog01Name} 14`);
        expect(blogs.body.items[4].name).toBe(`${blog01Name} 13`);
        expect(blogs.body.items[5].name).toBe(`${blog01Name} 05`);
        expect(blogs.body.items[6].name).toBe(`${blog01Name} 04`);
        expect(blogs.body.items[7].name).toBe(`${blog01Name} 03`);
        expect(blogs.body.items[8].name).toBe(`${blog01Name} 02`);
        expect(blogs.body.items[9].name).toBe(`${blog01Name} 01`);
      });
      it(`should sort blogs by description (asc)`, async () => {
        const blogs = await agent
          .get(publicBlogsURI)
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
          .get(publicBlogsURI)
          .query({ pageNumber: '2', pageSize: '5' })
          .expect(200);

        expect(blogs.body.pagesCount).toBe(2);
        expect(blogs.body.page).toBe(2);
        expect(blogs.body.pageSize).toBe(5);
        expect(blogs.body.totalCount).toBe(10);
        expect(blogs.body.items).toHaveLength(5);
        expect(blogs.body.items[0].name).toBe(`${blog01Name} 05`);
      });
    });

    /*it(`should return blog by ID`, async () => {
      const blogs = await agent.get(publicBlogsURI).expect(200);
      blog01Id = blogs.body.items[0].id;

      const blog = await agent.get(publicBlogsURI + blog01Id).expect(200);
      expect(blog.body).toEqual(blog01Object);
    });*/

    /*
    it(`should return 404 when trying to get nonexistent blog`, async () => {
      return agent.get(publicBlogsURI + invalidURI).expect(404);
    });*/
  });

  afterAll(async () => {
    await app.close();
  });
});
