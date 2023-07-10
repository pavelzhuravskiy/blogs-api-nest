import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { publicBlogsURI } from '../utils/constants/blogs.constants';
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
  publicLoginUri,
} from '../utils/constants/auth.constants';
import { randomUUID } from 'crypto';
import { blog01Object } from '../utils/objects/blogs.objects';
import { getAppAndClearDb } from '../utils/functions/get-app';
import {
  answer01,
  answer02,
  answer03,
  publicQuizPairsConnectionURI,
  questionBody,
  saQuestionsURI,
} from '../utils/constants/quiz.constants';

describe('Public quiz testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  let pairId;

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

  describe('Create question', () => {
    it(`should create question`, async () => {
      return agent
        .post(saQuestionsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: questionBody,
          correctAnswers: [answer01, answer02, answer03],
        })
        .expect(201);
    });
  });

  describe('Create pair', () => {
    it(`should create new pair with pending user 02`, async () => {
      const response = await agent
        .post(publicQuizPairsConnectionURI)
        .auth(aTokenUser01, { type: 'bearer' });
      // .expect(201);

      console.log(response.body);
      // console.log(response.body);

      pairId = response.body.id;

      return response;
    });

    // Forbidden errors [403]
    it.skip(`should return 404 when trying to get nonexistent blog`, async () => {
      return agent.get(publicBlogsURI + randomUUID()).expect(404);
    });

    // Success
    it.skip(`should return created pair`, async () => {
      const response = await agent
        .get(publicQuizPairsConnectionURI)
        .expect(200);
      /*expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blog01Object],
      });*/
    });
    it.skip(`should return created blog by ID`, async () => {
      const blog = await agent.get(publicBlogsURI + pairId).expect(200);
      expect(blog.body).toEqual(blog01Object);

      pairId = blog.body.id;
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
