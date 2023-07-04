export class QuestionViewDto {
  id: string;
  body: string;
  correctAnswers: string[] | [];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
