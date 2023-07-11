import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  saUsersURI,
  user01Email,
  user01Login,
  user02Email,
  user02Login,
  user03Email,
  user03Login,
  userPassword,
} from '../utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  publicLoginUri,
} from '../utils/constants/auth.constants';
import { getAppAndClearDb } from '../utils/functions/get-app';
import {
  publicCurrentGameURI,
  publicGameConnectionURI,
  publicGameURI,
  questionBody,
  saQuestionsURI,
} from '../utils/constants/quiz.constants';
import { randomUUID } from 'crypto';
import {
  createdGameObject,
  startedGameObject,
} from '../utils/objects/quiz.objects';

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
  let aTokenUser03;

  describe('Users creation and authentication', () => {
    it(`should create three users`, async () => {
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

      return agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user03Login,
          password: userPassword,
          email: user03Email,
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

      return response;
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

      return response;
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

      return response;
    });
  });
  describe('Game create and connect operations', () => {
    // Authentication errors [401]
    it(`should return 401 when trying to create game with incorrect token`, async () => {
      return agent
        .post(publicGameConnectionURI)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Success
    it(`should create new game with pending user 02`, async () => {
      const response = await agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(201);

      expect(response.body).toEqual(createdGameObject);

      gameId = response.body.id;

      return response;
    });

    // Forbidden errors [403]
    it(`should return 403 when user 01 is already participating in active pair`, async () => {
      return agent
        .post(publicGameConnectionURI)
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
    it(`should connect user 02 and start the game`, async () => {
      const response = await agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(201);
      expect(response.body).toEqual(startedGameObject);

      gameId = response.body.id;

      return response;
    });
  });
  describe('Get current game operations', () => {
    // Authentication errors [401]
    it(`should return 401 when trying to get current game with incorrect token`, async () => {
      return agent
        .get(publicCurrentGameURI)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Not found errors [404]
    it(`should return 404 when user 03 is trying to get the game he is not participating`, async () => {
      return agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(404);
    });

    // Success
    it(`should return started current game for user 01`, async () => {
      const response = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(startedGameObject);
      return response;
    });
    it(`should return started current game for user 02`, async () => {
      const response = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(startedGameObject);
      return response;
    });

    // Not found errors [404]
    it(`should return 404 when user 03 is trying to get the started game he is not participating`, async () => {
      return agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(404);
    });
  });
  describe('Get game by ID operations', () => {
    // Authentication errors [401]
    it(`should return 401 when trying to get the game by ID with incorrect token`, async () => {
      return agent
        .get(publicGameURI + gameId)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when user 03 is trying to get the game by ID he is not participating`, async () => {
      return agent
        .get(publicGameURI + gameId)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(403);
    });

    // Not found errors [404]
    it(`should return 404 when user 03 is trying to get the nonexistent game`, async () => {
      return agent
        .get(publicGameURI + randomUUID())
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(404);
    });

    // Success
    it(`should return started game by id for user 01`, async () => {
      const response = await agent
        .get(publicGameURI + gameId)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(startedGameObject);
      return response;
    });
    it(`should return started game by id for user 02`, async () => {
      const response = await agent
        .get(publicGameURI + gameId)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(startedGameObject);
      return response;
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
