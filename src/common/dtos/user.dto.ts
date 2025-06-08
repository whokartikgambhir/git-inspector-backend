// external dependencies
import { IsString, IsEmail, IsOptional, IsNotEmpty } from "class-validator";

// DTO for creating a new user
// CreateUserDto - validates that userName is a non-empty, unique string and email (if provided) is valid
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  userName: string = "";

  @IsOptional()
  @IsEmail()
  email!: string;
}
