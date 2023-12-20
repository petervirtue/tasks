import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  locale: string = 'en-US';

  @IsNotEmpty()
  /**
   * - At least 1 uppercase letter
   * - at least 1 special character !@#$&*^()
   * - at least 1 number
   * - at least 1 lowercase letter
   * - min length 8
   * **/
  @Matches(/^(?=.*[A-Z].*)(?=.*[!@#$&*^()\-_])(?=.*[0-9].*)(?=.*[a-z].*).{8,}$/)
  password: string;
}
