import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthEmailLoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
