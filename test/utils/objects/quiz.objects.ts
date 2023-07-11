import {
  answer01,
  answer02,
  answer03,
  answerNumeric,
  questionBody,
  questionUpdatedBody,
} from '../constants/quiz.constants';

export const questionCreatedObject = {
  id: expect.any(String),
  body: questionBody,
  correctAnswers: [answer01, answer02, answer03],
  published: false,
  createdAt: expect.any(String),
  updatedAt: null,
};

export const questionUpdatedObject = {
  id: expect.any(String),
  body: questionUpdatedBody,
  correctAnswers: [answer01, answer02, answer03, answerNumeric.toString()],
  published: false,
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
};
