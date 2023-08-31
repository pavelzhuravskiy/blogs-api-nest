import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../utils/constants/auth.constants';
import { getAppAndClearDb } from '../utils/functions/get-app';
import {
  questionBody,
  questionCorrectAnswer01,
  questionCorrectAnswer02,
  questionCorrectAnswer03,
  saQuestionsURI,
} from '../utils/constants/quiz.constants';
import { PublishedStatus } from '../../src/enums/published-status.enum';

describe('Questions filtering, sorting, pagination', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  it(`should create 10 questions`, async () => {
    for (let i = 1, j = 42; i < 6; i++, j--) {
      await agent
        .post(saQuestionsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: `${questionBody}0${i}`,
          correctAnswers: [
            questionCorrectAnswer01,
            questionCorrectAnswer02,
            questionCorrectAnswer03,
          ],
        })
        .expect(201);
    }
    for (let i = 3, j = 99; i < 8; i++, j--) {
      await agent
        .post(saQuestionsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: `${questionBody}1${i}`,
          correctAnswers: [
            questionCorrectAnswer01,
            questionCorrectAnswer02,
            questionCorrectAnswer03,
          ],
        })
        .expect(201);
    }
    const response = await agent
      .get(saQuestionsURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .expect(200);
    expect(response.body.items).toHaveLength(10);
  }, 30000);
  it(`should filter questions by body term and publish status === NotPublished`, async () => {
    const response = await agent
      .get(saQuestionsURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .query({
        bodySearchTerm: '3',
        publishedStatus: PublishedStatus.NotPublished,
      })
      .expect(200);

    expect(response.body.items).toHaveLength(2);
    expect(response.body.items[0].body).toBe(`${questionBody}13`);
    expect(response.body.items[1].body).toBe(`${questionBody}03`);
  });
  it(`should filter questions by body term and publish status === All`, async () => {
    const response = await agent
      .get(saQuestionsURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .query({
        bodySearchTerm: '3',
        publishedStatus: PublishedStatus.All,
      })
      .expect(200);

    expect(response.body.items).toHaveLength(2);
    expect(response.body.items[0].body).toBe(`${questionBody}13`);
    expect(response.body.items[1].body).toBe(`${questionBody}03`);
  });
  it(`should filter questions by body term and publish status === Published`, async () => {
    const response = await agent
      .get(saQuestionsURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .query({
        bodySearchTerm: '3',
        publishedStatus: PublishedStatus.Published,
      })
      .expect(200);

    expect(response.body.items).toHaveLength(0);
  });
  it(`should sort questions by date (desc)`, async () => {
    const response = await agent
      .get(saQuestionsURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .expect(200);

    expect(response.body.items[0].body).toBe(`${questionBody}17`);
    expect(response.body.items[1].body).toBe(`${questionBody}16`);
    expect(response.body.items[2].body).toBe(`${questionBody}15`);
    expect(response.body.items[3].body).toBe(`${questionBody}14`);
    expect(response.body.items[4].body).toBe(`${questionBody}13`);
    expect(response.body.items[5].body).toBe(`${questionBody}05`);
    expect(response.body.items[6].body).toBe(`${questionBody}04`);
    expect(response.body.items[7].body).toBe(`${questionBody}03`);
    expect(response.body.items[8].body).toBe(`${questionBody}02`);
    expect(response.body.items[9].body).toBe(`${questionBody}01`);
  });
  it(`should sort questions by body (asc)`, async () => {
    const users = await agent
      .get(saQuestionsURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .query({ sortBy: 'body', sortDirection: 'asc' })
      .expect(200);

    expect(users.body.items[0].body).toBe(`${questionBody}01`);
    expect(users.body.items[1].body).toBe(`${questionBody}02`);
    expect(users.body.items[2].body).toBe(`${questionBody}03`);
    expect(users.body.items[3].body).toBe(`${questionBody}04`);
    expect(users.body.items[4].body).toBe(`${questionBody}05`);
    expect(users.body.items[5].body).toBe(`${questionBody}13`);
    expect(users.body.items[6].body).toBe(`${questionBody}14`);
    expect(users.body.items[7].body).toBe(`${questionBody}15`);
    expect(users.body.items[8].body).toBe(`${questionBody}16`);
    expect(users.body.items[9].body).toBe(`${questionBody}17`);
  });
  it(`should return correct pagination output`, async () => {
    const response = await agent
      .get(saQuestionsURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .query({ pageNumber: '2', pageSize: '5' })
      .expect(200);

    expect(response.body.pagesCount).toBe(2);
    expect(response.body.page).toBe(2);
    expect(response.body.pageSize).toBe(5);
    expect(response.body.totalCount).toBe(10);
    expect(response.body.items).toHaveLength(5);
    expect(response.body.items[0].body).toBe(`${questionBody}05`);
  });

  afterAll(async () => {
    await app.close();
  });
});
