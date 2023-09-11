import { BlogImagesViewDto } from './blog-images.view.dto';
import { SubscriptionStatus } from '../../../../enums/subscription-status.enum';

export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
  images: BlogImagesViewDto;
  currentUserSubscriptionStatus: SubscriptionStatus;
  subscribersCount: number;
}
