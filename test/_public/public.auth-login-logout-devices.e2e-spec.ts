import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { testingAllDataURI } from '../utils/constants/testing.constants';
import { AppModule } from '../../src/app.module';
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
  publicDevicesURI,
  publicLoginUri,
  publicLogoutUri,
  publicMeURI,
  publicRefreshTokenURI,
} from '../utils/constants/auth.constants';
import { randomUUID } from 'crypto';
import cookieParser from 'cookie-parser';
import { deviceObject, userProfileObject } from '../utils/objects/auth.objects';
import { invalidURI } from '../utils/constants/common.constants';
import { sleep } from '../utils/functions/sleep';

describe('Public login, logout, devices testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();

    agent = supertest.agent(app.getHttpServer());
    await agent.delete(testingAllDataURI);
  });

  let aTokenUser01;
  let rTokenUser01;

  let device01Id;
  let device02Id;

  let rTokenUser02;

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
      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user02Login,
          password: userPassword,
          email: user02Email,
        })
        .expect(201);
    });

    // Auth errors [401]
    it(`should return 401 when trying to log in user with incorrect login or email`, async () => {
      await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: randomUUID(),
          password: userPassword,
        })
        .expect(401);
    });
    it(`should return 401 when trying to log in user with incorrect password`, async () => {
      await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user01Login,
          password: randomUUID(),
        })
        .expect(401);
    });

    // Success
    it(`should log in user 01 five times and create five devices`, async () => {
      let i = 0;
      let response;
      while (i < 5) {
        response = await agent
          .post(publicLoginUri)
          .send({
            loginOrEmail: user01Login,
            password: userPassword,
          })
          .expect(200);
        i++;
      }

      aTokenUser01 = response.body.accessToken;
      rTokenUser01 = response.headers['set-cookie'][0];

      expect(aTokenUser01).toBeDefined();
      expect(rTokenUser01).toContain('refreshToken=');
    });
    it(`should log in user 02`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user02Login,
          password: userPassword,
        })
        .expect(200);

      rTokenUser02 = response.headers['set-cookie'][0];
    });
  });
  describe('Update tokens', () => {
    // Auth errors [401]
    it(`should return 401 when trying to update tokens with incorrect refresh token`, async () => {
      await agent
        .post(publicRefreshTokenURI)
        .set('Cookie', randomUUID())
        .expect(401);
    });

    // Success
    it(`should update tokens and return 401 when trying to update tokens one more time with old refresh token`, async () => {
      await sleep(1000);
      const response = await agent
        .post(publicRefreshTokenURI)
        .set('Cookie', rTokenUser01)
        .expect(200);

      expect(rTokenUser01).not.toBe(response.headers['set-cookie'][0]);
      expect(aTokenUser01).not.toBe(response.body.accessToken);

      // Trying to update tokens with revoked refresh token, expect 401
      await agent
        .post(publicRefreshTokenURI)
        .set('Cookie', rTokenUser01)
        .expect(401);

      rTokenUser01 = response.headers['set-cookie'][0];
      aTokenUser01 = response.body.accessToken;
    });
  });
  describe('Get user profile', () => {
    // Auth errors [401]
    it(`should return 401 when trying to get profile with incorrect access token`, async () => {
      await agent
        .get(publicMeURI)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Success
    it(`should return current user profile`, async () => {
      const userProfile = await agent
        .get(publicMeURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);
      expect(userProfile.body).toEqual(userProfileObject);
    });
  });
  describe('Get devices', () => {
    // Auth errors [401]
    it(`should return 401 when trying to get devices with incorrect refresh token`, async () => {
      await agent.get(publicDevicesURI).set('Cookie', randomUUID()).expect(401);
    });
    it(`should return 401 when trying to get devices with missing refresh token`, async () => {
      await agent.get(publicDevicesURI).expect(401);
    });

    // Success
    it(`should return four devices`, async () => {
      const devices = await agent
        .get(publicDevicesURI)
        .set('Cookie', rTokenUser01)
        .expect(200);

      expect(devices.body).toHaveLength(5);
      expect(devices.body[0]).toEqual(deviceObject);

      device01Id = devices.body[0].deviceId;
      device02Id = devices.body[1].deviceId;
    });
  });
  describe('Delete devices', () => {
    // Auth errors [401]
    it(`should return 401 when trying to delete device (logout) with incorrect refresh token`, async () => {
      await agent.post(publicLogoutUri).set('Cookie', randomUUID()).expect(401);
    });
    it(`should return 401 when trying to delete device (logout) with missing refresh token`, async () => {
      await agent.post(publicLogoutUri).expect(401);
    });
    it(`should return 401 when trying to delete device by ID with incorrect refresh token`, async () => {
      await agent
        .delete(publicDevicesURI + device01Id)
        .set('Cookie', randomUUID())
        .expect(401);
    });
    it(`should return 401 when trying to delete device by ID with missing refresh token`, async () => {
      await agent.delete(publicDevicesURI + device01Id).expect(401);
    });
    it(`should return 401 when trying to delete all devices except current with incorrect refresh token`, async () => {
      await agent
        .delete(publicDevicesURI)
        .set('Cookie', randomUUID())
        .expect(401);
    });
    it(`should return 401 when trying to delete all devices except current with missing refresh token`, async () => {
      await agent.delete(publicDevicesURI).expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when trying to delete device by ID with another user's token`, async () => {
      await agent
        .delete(publicDevicesURI + device01Id)
        .set('Cookie', rTokenUser02)
        .expect(403);
    });

    // Not found errors [404]
    it(`should return 404 when trying to delete nonexistent device`, async () => {
      await agent
        .delete(publicDevicesURI + invalidURI)
        .set('Cookie', rTokenUser01)
        .expect(404);
    });

    // Success
    it(`should delete device by ID`, async () => {
      await agent
        .delete(publicDevicesURI + device02Id)
        .set('Cookie', rTokenUser01)
        .expect(204);

      const devices = await agent
        .get(publicDevicesURI)
        .set('Cookie', rTokenUser01)
        .expect(200);

      expect(devices.body).toHaveLength(4);
    });
    it(`should delete all devices except current`, async () => {
      await agent
        .delete(publicDevicesURI)
        .set('Cookie', rTokenUser01)
        .expect(204);

      const devices = await agent
        .get(publicDevicesURI)
        .set('Cookie', rTokenUser01)
        .expect(200);

      expect(devices.body).toHaveLength(1);
    });
    it(`should delete device (logout)`, async () => {
      await agent.post(publicLogoutUri).set('Cookie', rTokenUser01).expect(204);
      await agent.get(publicDevicesURI).set('Cookie', rTokenUser01).expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

// To test emails use .overrideProvider(SendRegistrationMailUseCase).useValue().compile(); in moduleRef
