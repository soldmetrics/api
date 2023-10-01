import { Role, User } from '@app/common/database';
import { CompanyDTO } from './CompanyDTO';

export class UserDetailsDTO {
  id: number;
  name: string;
  email: string;
  company: CompanyDTO;
  roles: Role[];
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.roles = user.roles;
    this.createdAt = user.createdAt;

    if (user.company) {
      this.company = {
        name: user.company?.name,
      };
    }
  }
}
