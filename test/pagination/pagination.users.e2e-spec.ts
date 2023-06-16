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
} from '../utils/constants/auth.constants';
import { getAppAndClearDb } from '../utils/functions/get-app';

describe('Users filtering, sorting, pagination', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  it(`should create 10 users`, async () => {
    for (let i = 1, j = 42; i < 6; i++, j--) {
      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: `${user01Login}0${i}`,
          password: userPassword,
          email: `${j}${user01Email}`,
        })
        .expect(201);
    }
    for (let i = 3, j = 99; i < 8; i++, j--) {
      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: `${user01Login}1${i}`,
          password: userPassword,
          email: `${j}${user01Email}`,
        })
        .expect(201);
    }
    const users = await agent
      .get(saUsersURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .auth(basicAuthLogin, basicAuthPassword)
      .expect(200);
    expect(users.body.items).toHaveLength(10);
  }, 30000);
  it(`should filter users by login term`, async () => {
    const users = await agent
      .get(saUsersURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .query({ searchLoginTerm: '3' })
      .expect(200);

    expect(users.body.items).toHaveLength(2);
    expect(users.body.items[0].login).toBe(`${user01Login}13`);
    expect(users.body.items[1].login).toBe(`${user01Login}03`);
  });
  it(`should filter users by email term`, async () => {
    const users = await agent
      .get(saUsersURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .query({ searchEmailTerm: '8' })
      .expect(200);

    expect(users.body.items).toHaveLength(2);
    expect(users.body.items[0].email).toBe(`98${user01Email}`);
    expect(users.body.items[1].email).toBe(`38${user01Email}`);
  });
  it(`should sort users by date (desc)`, async () => {
    const users = await agent
      .get(saUsersURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .expect(200);

    expect(users.body.items[0].login).toBe(`${user01Login}17`);
    expect(users.body.items[1].login).toBe(`${user01Login}16`);
    expect(users.body.items[2].login).toBe(`${user01Login}15`);
    expect(users.body.items[3].login).toBe(`${user01Login}14`);
    expect(users.body.items[4].login).toBe(`${user01Login}13`);
    expect(users.body.items[5].login).toBe(`${user01Login}05`);
    expect(users.body.items[6].login).toBe(`${user01Login}04`);
    expect(users.body.items[7].login).toBe(`${user01Login}03`);
    expect(users.body.items[8].login).toBe(`${user01Login}02`);
    expect(users.body.items[9].login).toBe(`${user01Login}01`);
  });
  it(`should sort blogs by email (asc)`, async () => {
    const users = await agent
      .get(saUsersURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .query({ sortBy: 'email', sortDirection: 'asc' })
      .expect(200);

    expect(users.body.items[0].email).toBe(`38${user01Email}`);
    expect(users.body.items[1].email).toBe(`39${user01Email}`);
    expect(users.body.items[2].email).toBe(`40${user01Email}`);
    expect(users.body.items[3].email).toBe(`41${user01Email}`);
    expect(users.body.items[4].email).toBe(`42${user01Email}`);
    expect(users.body.items[5].email).toBe(`95${user01Email}`);
    expect(users.body.items[6].email).toBe(`96${user01Email}`);
    expect(users.body.items[7].email).toBe(`97${user01Email}`);
    expect(users.body.items[8].email).toBe(`98${user01Email}`);
    expect(users.body.items[9].email).toBe(`99${user01Email}`);
  });
  it(`should return correct pagination output`, async () => {
    const users = await agent
      .get(saUsersURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .query({ pageNumber: '2', pageSize: '5' })
      .expect(200);

    expect(users.body.pagesCount).toBe(2);
    expect(users.body.page).toBe(2);
    expect(users.body.pageSize).toBe(5);
    expect(users.body.totalCount).toBe(10);
    expect(users.body.items).toHaveLength(5);
    expect(users.body.items[0].login).toBe(`${user01Login}05`);
  });

  afterAll(async () => {
    await app.close();
  });
});
