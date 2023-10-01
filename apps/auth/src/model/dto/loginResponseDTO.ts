import { UserDetailsDTO } from './userDetailsDTO';

export class LoginResponseDTO {
  accessToken: string;
  user: UserDetailsDTO;
}
