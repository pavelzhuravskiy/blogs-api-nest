export class SuperAdminUserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  banInfo: {
    isBanned: boolean;
    banDate?: Date;
    banReason?: string;
  };
}
