import { questionBody, questionUpdatedBody } from '../constants/quiz.constants';

export const questionCreatedObject = {
  id: expect.any(String),
  body: questionBody,
  correctAnswers: [],
  published: false,
  createdAt: expect.any(String),
  updatedAt: null,
};

export const questionUpdatedObject = {
  id: expect.any(String),
  body: questionUpdatedBody,
  correctAnswers: [],
  published: false,
  createdAt: expect.any(String),
  updatedAt: null,
};
