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
  user04Email,
  user04Login,
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

  let game01Id;
  let game02Id;
  let game03Id;
  let game04Id;
  let game05Id;

  let aTokenUser01;
  let aTokenUser02;
  let aTokenUser03;
  let aTokenUser04;

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
    it(`should create four users`, async () => {
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

      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user03Login,
          password: userPassword,
          email: user03Email,
        })
        .expect(201);

      return agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user04Login,
          password: userPassword,
          email: user04Email,
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
    it(`should log in user 04`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user04Login,
          password: userPassword,
        })
        .expect(200);

      aTokenUser04 = response.body.accessToken;

      return response;
    });
  });

  describe('01 Game create and connect operations', () => {
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

      game01Id = response.body.id;

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
    it(`should return 403 when user 03 is trying to get the game by ID he is not participating`, async () => {
      return agent
        .get(publicGameURI + game01Id)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(403);
    });

    // Success
    it(`should connect user 02 and start the game`, async () => {
      const response = await agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(startedGameObject);

      game01Id = response.body.id;

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
  describe('01 Answers operations', () => {
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
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: answers01[0],
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion01Id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion01Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });
    });
    it(`should answer [question 02] by user 01 (INCORRECT) and user 02 (CORRECT)`, async () => {
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion02Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: answers02[0],
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion02Id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });
    });
    it(`should answer [question 03] by user 01 (CORRECT) and user 02 (INCORRECT)`, async () => {
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: answers03[0],
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion03Id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion03Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });
    });
    it(`should answer [question 04] by user 01 (INCORRECT) and user 02 (CORRECT)`, async () => {
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion04Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: answers04[0],
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion04Id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });
    });
  });
  describe('01 Get game and finish operations', () => {
    // Success
    it(`should answer [question 05] by user 01 (CORRECT)`, async () => {
      const response = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: answers05[0],
        })
        .expect(200);

      expect(response.body).toEqual({
        questionId: gameQuestion05Id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });
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
        id: game01Id,
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
      const response = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response.body).toEqual({
        questionId: gameQuestion05Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });
    });

    // Not found errors [404]
    it(`should return 404 when user 01 is trying to get finished game`, async () => {
      return agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(404);
    });
    it(`should return 404 when user 02 is trying to get finished game`, async () => {
      return agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(404);
    });
  });
  describe('01 Get game by ID operations', () => {
    // Authentication errors [401]
    it(`should return 401 when trying to get the game by ID with incorrect token`, async () => {
      return agent
        .get(publicGameURI + game01Id)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
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
        .get(publicGameURI + game01Id)
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
        .get(publicGameURI + game01Id)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(gameObject);
      return response;
    });
  });

  describe('02 Game create and connect operations', () => {
    // Success
    it(`should create new game with pending user 02`, async () => {
      const response = await agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      expect(response.body).toEqual(createdGameObject);

      game02Id = response.body.id;

      return response;
    });
    it(`should connect user 02 and start the game`, async () => {
      const response = await agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(startedGameObject);

      game02Id = response.body.id;

      return response;
    });
  });
  describe('02 Answers operations', () => {
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
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: answers01[0],
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion01Id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion01Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });
    });
    it(`should answer [question 02] by user 01 (INCORRECT) and user 02 (CORRECT)`, async () => {
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion02Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: answers02[0],
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion02Id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });
    });
    it(`should answer [question 03] by user 01 (CORRECT) and user 02 (INCORRECT)`, async () => {
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: answers03[0],
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion03Id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion03Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });
    });
    it(`should answer [question 04] by user 01 (INCORRECT) and user 02 (CORRECT)`, async () => {
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion04Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: answers04[0],
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion04Id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });
    });
  });
  describe('02 Get game and finish operations', () => {
    // Success
    it(`should answer [question 05] by user 01 (CORRECT)`, async () => {
      const response = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          answer: answers05[0],
        })
        .expect(200);

      expect(response.body).toEqual({
        questionId: gameQuestion05Id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });
    });
    it(`should return started current game for user 01`, async () => {
      const response = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      gameObject = {
        id: game02Id,
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
    it(`should answer [question 05] by user 02 (INCORRECT) and finish game`, async () => {
      const response = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response.body).toEqual({
        questionId: gameQuestion05Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });
    });
  });
  describe('02 Get game by ID operations', () => {
    // Success
    it(`should return finished game by id for user 01`, async () => {
      const response = await agent
        .get(publicGameURI + game02Id)
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
        .get(publicGameURI + game02Id)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(gameObject);
      return response;
    });
  });

  describe('03 Game create and connect operations', () => {
    // Success
    it(`should create new game with pending user 04`, async () => {
      const response = await agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(200);

      createdGameObject.firstPlayerProgress.player.login = user03Login;
      expect(response.body).toEqual(createdGameObject);

      game03Id = response.body.id;

      return response;
    });
    it(`should connect user 04 and start the game`, async () => {
      const response = await agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser04, { type: 'bearer' })
        .expect(200);

      startedGameObject.firstPlayerProgress.player.login = user03Login;
      startedGameObject.secondPlayerProgress.player.login = user04Login;
      expect(response.body).toEqual(startedGameObject);

      game03Id = response.body.id;

      return response;
    });
  });
  describe('03 Answers operations', () => {
    // Success
    it(`should get questions and answers`, async () => {
      // Get current game
      const game = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser03, { type: 'bearer' })
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
    it(`should answer [question 01] by user 03 (INCORRECT) and user 04 (INCORRECT)`, async () => {
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion01Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser04, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion01Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });
    });
    it(`should return started current game for user 03`, async () => {
      const response = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(200);

      gameObject = {
        id: game03Id,
        firstPlayerProgress: {
          answers: [
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion01Id,
            },
          ],
          player: {
            id: expect.any(String),
            login: user03Login,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: [
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion01Id,
            },
          ],
          player: {
            id: expect.any(String),
            login: user04Login,
          },
          score: 0,
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
    it(`should answer [question 02] by user 03 (INCORRECT) and user 04 (INCORRECT)`, async () => {
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion02Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser04, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion02Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });
    });
    it(`should answer [question 03] by user 03 (INCORRECT) and user 04 (INCORRECT)`, async () => {
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion03Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser04, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion03Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });
    });
    it(`should answer [question 04] by user 03 (INCORRECT) and user 04 (INCORRECT)`, async () => {
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion04Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser04, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion04Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });
    });
  });
  describe('03 Get game and finish operations', () => {
    // Success
    it(`should answer [question 05] by user 03 (INCORRECT)`, async () => {
      const response = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response.body).toEqual({
        questionId: gameQuestion05Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });
    });
    it(`should return started current game for user 03`, async () => {
      const response = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(200);

      gameObject = {
        id: game03Id,
        firstPlayerProgress: {
          answers: [
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion01Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion02Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion03Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion04Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion05Id,
            },
          ],
          player: {
            id: expect.any(String),
            login: user03Login,
          },
          score: 0,
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
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion02Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion03Id,
            },
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion04Id,
            },
          ],
          player: {
            id: expect.any(String),
            login: user04Login,
          },
          score: 0,
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
    it(`should return started current game for user 04`, async () => {
      const response = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser04, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(gameObject);
      return response;
    });
    it(`should answer [question 05] by user 04 (CORRECT) and finish game`, async () => {
      const response = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser04, { type: 'bearer' })
        .send({
          answer: answers05[0],
        })
        .expect(200);

      expect(response.body).toEqual({
        questionId: gameQuestion05Id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });
    });
  });
  describe('04 Get game by ID operations', () => {
    // Success
    it(`should return finished game by id for user 03`, async () => {
      const response = await agent
        .get(publicGameURI + game03Id)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(200);

      gameObject.secondPlayerProgress.score = 1;
      gameObject.secondPlayerProgress.answers[4] = {
        addedAt: expect.any(String),
        answerStatus: AnswerStatus.Correct,
        questionId: gameQuestion05Id,
      };
      gameObject.status = GameStatus.Finished;
      gameObject.finishGameDate = response.body.finishGameDate;

      expect(response.body).toEqual(gameObject);
      return response;
    });
    it(`should return finished game by id for user 04`, async () => {
      const response = await agent
        .get(publicGameURI + game03Id)
        .auth(aTokenUser04, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(gameObject);
      return response;
    });
  });

  describe('04 Game create and connect operations', () => {
    // Success
    it(`should create new game with pending user 04`, async () => {
      const response = await agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(200);

      expect(response.body).toEqual(createdGameObject);

      game04Id = response.body.id;

      return response;
    });
    it(`should connect user 04 and start the game`, async () => {
      const response = await agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser04, { type: 'bearer' })
        .expect(200);

      expect(response.body).toEqual(startedGameObject);
      return response;
    });
  });
  describe('04 Answers operations', () => {
    // Success
    it(`should get questions and answers`, async () => {
      // Get current game
      const game = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser03, { type: 'bearer' })
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
    it(`should answer [question 01] by user 03 (CORRECT) and user 04 (INCORRECT)`, async () => {
      const response01 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          answer: answers01[0],
        })
        .expect(200);

      expect(response01.body).toEqual({
        questionId: gameQuestion01Id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      const response02 = await agent
        .post(publicAnswersURI)
        .auth(aTokenUser04, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);

      expect(response02.body).toEqual({
        questionId: gameQuestion01Id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });
    });
    it(`should return started current game for user 03`, async () => {
      const response = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(200);

      gameObject = {
        id: game04Id,
        firstPlayerProgress: {
          answers: [
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Correct,
              questionId: gameQuestion01Id,
            },
          ],
          player: {
            id: expect.any(String),
            login: user03Login,
          },
          score: 1,
        },
        secondPlayerProgress: {
          answers: [
            {
              addedAt: expect.any(String),
              answerStatus: AnswerStatus.Incorrect,
              questionId: gameQuestion01Id,
            },
          ],
          player: {
            id: expect.any(String),
            login: user04Login,
          },
          score: 0,
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
    it(`should return started current game for user 04`, async () => {
      const response = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser04, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(gameObject);
      return response;
    });
    it(`should return game by id for user 03`, async () => {
      const response = await agent
        .get(publicGameURI + game04Id)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(200);

      expect(response.body).toEqual(gameObject);
      return response;
    });
    it(`should return game by id for user 04`, async () => {
      const response = await agent
        .get(publicGameURI + game04Id)
        .auth(aTokenUser04, { type: 'bearer' })
        .expect(200);
      expect(response.body).toEqual(gameObject);
      return response;
    });
  });

  describe('05 Game create and connect operations', () => {
    // Success
    it(`should create new game with pending user 02`, async () => {
      const response = await agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      createdGameObject.firstPlayerProgress.player.login = user01Login;
      expect(response.body).toEqual(createdGameObject);

      game05Id = response.body.id;

      return response;
    });
    it(`should connect user 02 and start the game`, async () => {
      const response = await agent
        .post(publicGameConnectionURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);

      startedGameObject.firstPlayerProgress.player.login = user01Login;
      startedGameObject.secondPlayerProgress.player.login = user02Login;
      expect(response.body).toEqual(startedGameObject);
      return response;
    });
  });
  describe('05 Answers operations', () => {
    // Success
    it(`should get questions and answers`, async () => {
      // Get current game
      const game = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser03, { type: 'bearer' })
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

      await agent
        .post(publicAnswersURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          answer: randomUUID(),
        })
        .expect(200);
    });
    it(`should return started current game for user 01`, async () => {
      const response = await agent
        .get(publicCurrentGameURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      expect(response.body.id).toBe(game05Id);
      return response;
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
