export class TopViewDto {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  player: {
    id: string;
    login: string;
  };
}
