import { CommonQuery } from '../../common/dto/common.query';

export class UserQuery extends CommonQuery {
  searchLoginTerm: string;
  searchEmailTerm: string;
}
