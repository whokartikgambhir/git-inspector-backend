// external dependencies
import { IsString, IsNotEmpty } from "class-validator";

export class ValidateAuthDto {
  @IsString()
  @IsNotEmpty({ message: "PAT must be a non-empty string" })
  pat!: string;
}
