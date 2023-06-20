import { QueryDto } from '../../query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { BanStatus } from '../../../../enums/ban-status.enum';

export class UserQueryDto extends QueryDto {
  /*@Transform(({ value }) => {
    if (User.checkSortingField(value)) {
      return value;
    } else {
      return 'createdAt';
    }
  })*/
  sortBy = 'createdAt';

  @IsOptional()
  @IsEnum(BanStatus)
  banStatus: string;
  searchLoginTerm: string;
  searchEmailTerm: string;
}
