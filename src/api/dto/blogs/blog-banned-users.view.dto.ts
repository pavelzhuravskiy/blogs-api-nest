export class BannedUsersViewDto {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: Date;
    banReason: string;
  };
}
