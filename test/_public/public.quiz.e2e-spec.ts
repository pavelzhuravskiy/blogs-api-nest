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
import { blog01Object } from '../utils/objects/blogs.objects';
import { getAppAndClearDb } from '../utils/functions/get-app';
import {
  publicQuizGameConnectionURI,
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

  let gameId;

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

  describe('Create game', () => {
    // Success
    it(`should create new game with pending user 02`, async () => {
      const response = await agent
        .post(publicQuizGameConnectionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(201);

      console.log(response.body);

      gameId = response.body.id;

      return response;
    });

    // Forbidden errors [403]
    it(`should return 403 when user 01 is already participating in active pair`, async () => {
      return agent
        .post(publicQuizGameConnectionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(403);
    });

    // Success
    it(`should create 10 questions`, async () => {
      for (let i = 1; i < 11; i++) {
        await agent
          .post(saQuestionsURI)
          .auth(basicAuthLogin, basicAuthPassword)
          .send({
            body: `${questionBody} ${i} + ${i}`,
            correctAnswers: [i + i],
          })
          .expect(201);
      }
    }, 30000);
    it(`should connect user 02`, async () => {
      const response = await agent
        .post(publicQuizGameConnectionURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(201);

      console.log(response.body);
      return response;
    });

    // Success
    it.skip(`should return created game`, async () => {
      const response = await agent.get(publicQuizGameConnectionURI).expect(200);
      /*expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blog01Object],
      });*/
    });
    it.skip(`should return created blog by ID`, async () => {
      const blog = await agent.get(publicBlogsURI + gameId).expect(200);
      expect(blog.body).toEqual(blog01Object);

      gameId = blog.body.id;
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
