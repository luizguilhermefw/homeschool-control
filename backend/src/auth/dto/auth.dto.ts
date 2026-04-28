import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  familyName: string;

  @IsString()
  userName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
