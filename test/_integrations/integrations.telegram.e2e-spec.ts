import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  saUsersURI,
  user01Email,
  user01Login,
  userPassword,
} from '../utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  publicLoginUri,
} from '../utils/constants/auth.constants';
import { randomUUID } from 'crypto';
import { getAppAndClearDb } from '../utils/functions/get-app';
import { integrationsTelegramBotAuthLinkURI } from '../utils/constants/integrations.constants';

describe('Telegram bot testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  let userId;
  // let blogId;
  // let postId;

  let aTokenUser01;

  describe('Users creation and authentication', () => {
    it(`should create user`, async () => {
      const user = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(201);
      userId = user.body.id;
    });
    it(`should log in user`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user01Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser01 = response.body.accessToken;
    });
  });
  describe('Telegram bot authentication link', () => {
    it(`should return 404 when trying to get link with incorrect token`, async () => {
      return agent
        .get(integrationsTelegramBotAuthLinkURI)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });
    it(`should return telegram bot authentication link`, async () => {
      const response = await agent
        .get(integrationsTelegramBotAuthLinkURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      console.log(response.body);

      expect(response.body).toEqual({
        link: expect.any(String),
      });

      return response;
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
