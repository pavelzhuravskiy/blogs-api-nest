import { QueryDto } from '../../_shared/dto/query.dto';

export class UserQueryDto extends QueryDto {
  searchLoginTerm: string;
  searchEmailTerm: string;
}
