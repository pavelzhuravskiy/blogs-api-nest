import { QueryDto } from '../query.dto';

export class BlogBannedUsersQueryDto extends QueryDto {
  searchLoginTerm: string;
}
