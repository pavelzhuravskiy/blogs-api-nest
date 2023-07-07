import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../utils/constants/auth.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import { randomUUID } from 'crypto';
import {
  questionAnswersField,
  questionBodyField,
} from '../utils/constants/exceptions.constants';
import { getAppAndClearDb } from '../utils/functions/get-app';
import {
  answer01,
  answer02,
  answer03,
  answerNumeric,
  questionBody,
  questionUpdatedBody,
  saQuestionsPublishURI,
  saQuestionsURI,
} from '../utils/constants/quiz.constants';
import { longString508 } from '../utils/constants/common.constants';
import {
  questionCreatedObject,
  questionUpdatedObject,
} from '../utils/objects/quiz.objects';

describe('Super admin quiz questions testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  let questionId;

  describe('Create question', () => {
    // Validation errors [400]
    it(`should return 400 when trying to create question without body`, async () => {
      const response = await agent
        .post(saQuestionsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          correctAnswers: [answer01, answer02, answer03],
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(questionBodyField));
    });
    it(`should return 400 when trying to create question with incorrect body type`, async () => {
      const response = await agent
        .post(saQuestionsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: 123,
          correctAnswers: [answer01, answer02, answer03],
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(questionBodyField));
    });
    it(`should return 400 when trying to create question with incorrect body length`, async () => {
      const response = await agent
        .post(saQuestionsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: longString508,
          correctAnswers: [answer01, answer02, answer03],
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(questionBodyField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to create question with incorrect credentials`, async () => {
      return agent
        .post(saQuestionsURI)
        .auth(basicAuthLogin, randomUUID())
        .send({
          body: questionBody,
          correctAnswers: [answer01, answer02, answer03],
        })
        .expect(401);
    });

    // Success
    it(`should create question`, async () => {
      const response = await agent
        .post(saQuestionsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: questionBody,
          correctAnswers: [answer01, answer02, answer03],
        })
        .expect(201);

      expect(response.body).toEqual(questionCreatedObject);

      questionId = response.body.id;
    });
  });
  describe('Update question', () => {
    // Validation errors [400]
    it(`should return 400 when trying to update question without answers`, async () => {
      const response = await agent
        .put(saQuestionsURI + questionId)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: questionBody,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(questionAnswersField));
    });
    it(`should return 400 when trying to update question with incorrect answers type`, async () => {
      const response = await agent
        .put(saQuestionsURI + questionId)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: questionBody,
          correctAnswers: 123,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(questionAnswersField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to update question with incorrect credentials`, async () => {
      return agent
        .put(saQuestionsURI + questionId)
        .auth(basicAuthLogin, randomUUID())
        .send({
          body: questionUpdatedBody,
          correctAnswers: [answer01, answer02, answer03],
        })
        .expect(401);
    });

    // Not found errors [404]
    it(`should return 404 when trying to update nonexistent question`, async () => {
      return agent
        .put(saQuestionsURI + randomUUID())
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: questionUpdatedBody,
          correctAnswers: [answer01, answer02, answer03],
        })
        .expect(404);
    });

    // Success
    it(`should update question by ID`, async () => {
      await agent
        .put(saQuestionsURI + questionId)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: questionUpdatedBody,
          correctAnswers: [answer01, answer02, answer03, answerNumeric],
        })
        .expect(204);

      const check = await agent
        .get(saQuestionsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);
      expect(check.body.items[0]).toEqual(questionUpdatedObject);
    });
    it(`should update published status`, async () => {
      await agent
        .put(saQuestionsURI + questionId + saQuestionsPublishURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          published: true,
        })
        .expect(204);

      const check = await agent
        .get(saQuestionsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);
      expect(check.body.items[0].published).toBeTruthy();
    });
  });

  describe.skip('Delete question', () => {
    // Auth errors [401]
    it(`should return 401 when trying to delete question with incorrect credentials`, async () => {
      return agent
        .delete(saQuestionsURI + questionId)
        .auth(basicAuthLogin, randomUUID())
        .expect(401);
    });

    // Not found errors [404]
    it(`should return 404 when trying to delete nonexistent question`, async () => {
      await agent
        .delete(saQuestionsURI + randomUUID())
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(404);
    });

    // Success
    it(`should delete question by ID`, async () => {
      await agent
        .delete(saQuestionsURI + questionId)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(204);

      const response = await agent
        .get(saQuestionsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);
      expect(response.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
