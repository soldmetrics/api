import { Subscription, SubscriptionStatusEnum } from '@app/common/database';

export class SubscriptionDetailsDTO {
  id: number;
  plan?: {
    name?: string;
  };
  startDate: Date;
  endDate?: Date;
  status: SubscriptionStatusEnum;

  constructor(subscription: Subscription) {
    this.id = subscription.id;
    this.plan = { name: subscription?.plan?.name };
    this.startDate = subscription.startDate;
    this.endDate = subscription.endDate;
    this.status = subscription.status;
  }
}
