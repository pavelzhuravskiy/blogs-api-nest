import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MainModule } from '../../modules/main.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { testingURI } from '../../../test/constants/testing.constants';
import { invalidURI } from '../../../test/constants/common.constants';
import {
  userEmail,
  userLogin,
  userPassword,
  usersURI,
} from '../../../test/constants/users.constants';
import { userObject } from '../../../test/objects/users.objects';

describe('Users testing', () => {
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

  let userId;

  describe('Users status 404 checks', () => {
    beforeAll(async () => await agent.delete(testingURI));
    it(`should return 404 when deleting nonexistent user`, async () => {
      return agent.delete(usersURI + invalidURI).expect(404);
    });
  });
  describe('Users CRUD operations', () => {
    beforeAll(async () => await agent.delete(testingURI));
    it(`should create new user`, async () => {
      return agent
        .post(usersURI)
        .send({
          login: userLogin,
          password: userPassword,
          email: userEmail,
        })
        .expect(201);
    });
    it(`should return all users`, async () => {
      const users = await agent.get(usersURI).expect(200);
      expect(users.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [userObject],
      });
    });
    it(`should delete user by ID`, async () => {
      const users = await agent.get(usersURI).expect(200);
      userId = users.body.items[0].id;

      await agent.delete(usersURI + userId).expect(204);

      const check = await agent.get(usersURI).expect(200);
      expect(check.body.items).toHaveLength(0);
    });
  });
  describe('Users filtering, sorting, pagination', () => {
    beforeAll(async () => await agent.delete(testingURI));
    it(`should create 10 users`, async () => {
      for (let i = 1, j = 42; i < 6; i++, j--) {
        await agent
          .post(usersURI)
          .send({
            login: `${userLogin}0${i}`,
            password: userPassword,
            email: `${j}${userEmail}`,
          })
          .expect(201);
      }
      for (let i = 3, j = 99; i < 8; i++, j--) {
        await agent
          .post(usersURI)
          .send({
            login: `${userLogin}1${i}`,
            password: userPassword,
            email: `${j}${userEmail}`,
          })
          .expect(201);
      }
      const check = await agent.get(usersURI).expect(200);
      expect(check.body.items).toHaveLength(10);
    });
    it(`should filter users by login term`, async () => {
      const users = await agent
        .get(usersURI)
        .query({ searchLoginTerm: '3' })
        .expect(200);

      expect(users.body.items).toHaveLength(2);
      expect(users.body.items[0].login).toBe(`${userLogin}13`);
      expect(users.body.items[1].login).toBe(`${userLogin}03`);
    });
    it(`should filter users by email term`, async () => {
      const users = await agent
        .get(usersURI)
        .query({ searchEmailTerm: '8' })
        .expect(200);

      expect(users.body.items).toHaveLength(2);
      expect(users.body.items[0].email).toBe(`98${userEmail}`);
      expect(users.body.items[1].email).toBe(`38${userEmail}`);
    });
    it(`should sort users by date (desc)`, async () => {
      const users = await agent.get(usersURI).expect(200);

      expect(users.body.items[0].login).toBe(`${userLogin}17`);
      expect(users.body.items[1].login).toBe(`${userLogin}16`);
      expect(users.body.items[2].login).toBe(`${userLogin}15`);
      expect(users.body.items[3].login).toBe(`${userLogin}14`);
      expect(users.body.items[4].login).toBe(`${userLogin}13`);
      expect(users.body.items[5].login).toBe(`${userLogin}05`);
      expect(users.body.items[6].login).toBe(`${userLogin}04`);
      expect(users.body.items[7].login).toBe(`${userLogin}03`);
      expect(users.body.items[8].login).toBe(`${userLogin}02`);
      expect(users.body.items[9].login).toBe(`${userLogin}01`);
    });
    it(`should sort blogs by email (asc)`, async () => {
      const users = await agent
        .get(usersURI)
        .query({ sortBy: 'email', sortDirection: 'asc' })
        .expect(200);

      expect(users.body.items[0].email).toBe(`38${userEmail}`);
      expect(users.body.items[1].email).toBe(`39${userEmail}`);
      expect(users.body.items[2].email).toBe(`40${userEmail}`);
      expect(users.body.items[3].email).toBe(`41${userEmail}`);
      expect(users.body.items[4].email).toBe(`42${userEmail}`);
      expect(users.body.items[5].email).toBe(`95${userEmail}`);
      expect(users.body.items[6].email).toBe(`96${userEmail}`);
      expect(users.body.items[7].email).toBe(`97${userEmail}`);
      expect(users.body.items[8].email).toBe(`98${userEmail}`);
      expect(users.body.items[9].email).toBe(`99${userEmail}`);
    });
    it(`should return correct pagination output`, async () => {
      const users = await agent
        .get(usersURI)
        .query({ pageNumber: '2', pageSize: '5' })
        .expect(200);

      expect(users.body.pagesCount).toBe(2);
      expect(users.body.page).toBe(2);
      expect(users.body.pageSize).toBe(5);
      expect(users.body.totalCount).toBe(10);
      expect(users.body.items).toHaveLength(5);
      expect(users.body.items[0].login).toBe(`${userLogin}05`);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
