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
  correctAnswer01,
  publicAnswersURI,
  publicCurrentGameURI,
  publicGameConnectionURI,
  publicGameURI,
  questionBody,
  saQuestionsPublishURI,
  saQuestionsURI,
} from '../utils/constants/quiz.constants';
import { randomUUID } from 'crypto';
import {
  createdGameObject,
  startedGameObject,
} from '../utils/objects/quiz.objects';
import { answersFinder } from '../utils/functions/answers-finder';
import { AnswerStatus } from '../../src/enums/answer-status.enum';
import { GameStatus } from '../../src/enums/game-status.enum';

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

  let gameQuestion01Id;
  let gameQuestion02Id;
  let gameQuestion03Id;
  let gameQuestion04Id;
  let gameQuestion05Id;

  let answers01;
  let answers02;
  let answers03;
  let answers04;
  let answers05;

  let gameObject;

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
        .expect(200);

      expect(response.body).toEqual(createdGameObject);

      gameId = response.body.id;

      return response;
    });
    it(`should create and publish 10 questions`, async () => {
      let questionId;
      for (let i = 1; i < 11; i++) {
        const response = await agent
          .post(saQuestionsURI)
          .auth(basicAuthLogin, basicAuthPassword)
          .send({
            body: `${questionBody} ${i} + ${i}`,
            correctAnswers: [i + i],
          })
          .expect(201);

        questionId = response.body.id;

        await agent
          .put(saQuestionsURI + questionId + saQuestionsPublishURI)
          .auth(basicAuthLogin, basicAuthPassword)
          .send({
            published: true,
          })
          .expect(204);
      }
    }, 30000);

    // Forbidden errors [403]
    it(`should return 403 when user 01 is already participating in active pair (before game start)`, async () => {
      return agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(403);
    });
    it(`should return 403 when user 01 trying to send answer (before game start)`, async () => {
      return agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: correctAnswer01,
        })
        .expect(403);
    });
    it(`should return 403 when user 02 trying to send answer (before game start)`, async () => {
      return agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: correctAnswer01,
        })
        .expect(403);
    });

    // Success
    it(`should connect user 02 and start the game`, async () => {
      const response = await agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(startedGameObject);

      gameId = response.body.id;

      return response;
    });

    // Forbidden errors [403]
    it(`should return 403 when user 01 is already participating in active pair (after game start)`, async () => {
      return agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(403);
    });
    it(`should return 403 when user 02 is already participating in active pair (after game start)`, async () => {
      return agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(403);
    });
  });
  describe('Answers operations', () => {
    // Bad request errors [400]
    it(`should return 400 when trying to send answer without answer`, async () => {
      return agent
        .post(publicAnswersURI)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });
    it(`should return 400 when trying to send answer with incorrect answer type`, async () => {
      return agent
        .post(publicAnswersURI)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          answer: 123,
        })
        .expect(401);
    });

    // Authentication errors [401]
    it(`should return 401 when trying to send answer with incorrect token`, async () => {
      return agent
        .post(publicAnswersURI)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          answer: correctAnswer01,
        })
        .expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when user 03 trying to send answer in the game he is not participating`, async () => {
      return agent
        .post(publicAnswersURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          answer: correctAnswer01,
        })
        .expect(403);
    });

    // Success
    it(`should get questions and answers`, async () => {
      // Get current game
      const game = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      // Get game question IDs
      gameQuestion01Id = game.body.questions[0].id;
      gameQuestion02Id = game.body.questions[1].id;
      gameQuestion03Id = game.body.questions[2].id;
      gameQuestion04Id = game.body.questions[3].id;
      gameQuestion05Id = game.body.questions[4].id;

      // Get questions by admin to get answers
      const adminQuestions = await agent
        .get(saQuestionsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      // Get answers to game questions and check publish statuses
      answers01 = answersFinder(adminQuestions, gameQuestion01Id);
      answers02 = answersFinder(adminQuestions, gameQuestion02Id);
      answers03 = answersFinder(adminQuestions, gameQuestion03Id);
      answers04 = answersFinder(adminQuestions, gameQuestion04Id);
      answers05 = answersFinder(adminQuestions, gameQuestion05Id);

      // Check answers arrays
      expect(answers01.length).toBeGreaterThan(0);
      expect(answers02.length).toBeGreaterThan(0);
      expect(answers03.length).toBeGreaterThan(0);
      expect(answers04.length).toBeGreaterThan(0);
      expect(answers05.length).toBeGreaterThan(0);
    });
    it(`should answer [question 01] by user 01 (CORRECT) and user 02 (INCORRECT)`, async () => {
      await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: answers01[0],
        })
        .expect(200);

      return agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);
    });
    it(`should answer [question 02] by user 01 (INCORRECT) and user 02 (CORRECT)`, async () => {
      await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      return agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: answers02[0],
        })
        .expect(200);
    });
    it(`should answer [question 03] by user 01 (CORRECT) and user 02 (INCORRECT)`, async () => {
      await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: answers03[0],
        })
        .expect(200);

      return agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);
    });
    it(`should answer [question 04] by user 01 (INCORRECT) and user 02 (CORRECT)`, async () => {
      await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      return agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: answers04[0],
        })
        .expect(200);
    });
  });
  describe('Get game and finish operations', () => {
    // Success
    it(`should answer [question 05] by user 01 (CORRECT)`, async () => {
      await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: answers05[0],
        })
        .expect(200);
    });

    // Forbidden errors [403]
    it(`should return 403 when user 01 trying to send answer after all questions answered`, async () => {
      return agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: correctAnswer01,
        })
        .expect(403);
    });

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

      gameObject = {
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Correct,
              questionId: gameQuestion01Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion02Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Correct,
              questionId: gameQuestion03Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion04Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Correct,
              questionId: gameQuestion05Id,
            },
          ],
          player: {
            id: expect.any(String),
            login: user01Login,
          },
          score: 3,
        },
        secondPlayerProgress: {
          answers: [
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion01Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Correct,
              questionId: gameQuestion02Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion03Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Correct,
              questionId: gameQuestion04Id,
            },
          ],
          player: {
            id: expect.any(String),
            login: user02Login,
          },
          score: 2,
        },
        questions: [
          {
            id: gameQuestion01Id,
            body: expect.any(String),
          },
          {
            id: gameQuestion02Id,
            body: expect.any(String),
          },
          {
            id: gameQuestion03Id,
            body: expect.any(String),
          },
          {
            id: gameQuestion04Id,
            body: expect.any(String),
          },
          {
            id: gameQuestion05Id,
            body: expect.any(String),
          },
        ],
        status: GameStatus.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      };

      expect(response.body).toEqual(gameObject);
      return response;
    });
    it(`should return started current game for user 02`, async () => {
      const response = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(gameObject);
      return response;
    });

    // Not found errors [404]
    it(`should return 404 when user 03 is trying to get the started game he is not participating`, async () => {
      return agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(404);
    });

    // Success
    it(`should answer [question 05] by user 02 (INCORRECT) and finish game`, async () => {
      await agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);
    });

    // Not found errors [404]
    it(`should return 404 when user 01 is trying to get finished game`, async () => {
      return agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(404);
    });
    // Not found errors [404]
    it(`should return 404 when user 02 is trying to get finished game`, async () => {
      return agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser02, { type: 'bearer' })
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
    it(`should return finished game by id for user 01`, async () => {
      const response = await agent
        .get(publicGameURI + gameId)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      gameObject.firstPlayerProgress.score = 4;
      gameObject.secondPlayerProgress.answers[4] = {
        addedAt: expect.any(String),
        answerStatus: AnswerStatus.Incorrect,
        questionId: gameQuestion05Id,
      };
      gameObject.status = GameStatus.Finished;
      gameObject.finishGameDate = response.body.finishGameDate;

      expect(response.body).toEqual(gameObject);
      return response;
    });
    it(`should return finished game by id for user 02`, async () => {
      const response = await agent
        .get(publicGameURI + gameId)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(gameObject);
      return response;
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
