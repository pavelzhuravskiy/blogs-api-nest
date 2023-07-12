export const answersFinder = (adminQuestions: any, gameQuestionId: string) =>
  adminQuestions.body.items.find((q) => q.id === gameQuestionId && q.published)
    .correctAnswers;
