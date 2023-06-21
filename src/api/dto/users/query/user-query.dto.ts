import { QueryDto } from '../../query.dto';
import { IsOptional } from 'class-validator';
import { BanStatus } from '../../../../enums/ban-status.enum';
import { Transform } from 'class-transformer';
import { User } from '../../../entities/users/user.entity';

export class UserQueryDto extends QueryDto {
  @Transform(({ value }) => {
    if (User.checkSortingField(value)) {
      return value;
    } else {
      return 'createdAt';
    }
  })
  sortBy = 'createdAt';

  @IsOptional()
  @Transform(({ value }) => {
    if (value === BanStatus.Banned) {
      return true;
    }
    if (value === BanStatus.NotBanned) {
      return false;
    }
  })
  banStatus: boolean | string;
  searchLoginTerm: string;
  searchEmailTerm: string;
}
