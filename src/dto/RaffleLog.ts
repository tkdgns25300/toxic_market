import { IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class RaffleLogDto {
  id: number;

  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  @IsOptional()
  applicant: string;

  @IsInt()
  amount: number;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  is_winner: string;
}
