import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { Match } from 'src/common/validators/match.validator';

export class AuthRegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

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

  @IsNotEmpty()
  @Match('password')
  confirmPassword: string;
}
