import { IsIn, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class StakingDto {
  id: number;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  toxic_ape: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  toxic_ape_staking_time: string;

  @IsInt()
  @IsOptional()
  toxic_ape_amount: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  foolkat: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  foolkat_staking_time: string;

  @IsInt()
  @IsOptional()
  foolkat_amount: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  succubus: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  succubus_staking_time: string;

  @IsInt()
  @IsOptional()
  succubus_amount: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  toxic_ape_special: string;

  @IsString({ message: "문자열이 아닙니다." })
  @IsOptional()
  toxic_ape_special_staking_time: string;

  @IsInt()
  @IsOptional()
  toxic_ape_special_amount: string;

  @IsInt()
  @IsOptional()
  total_payments: number;
  
  @IsString({ message: "문자열이 아닙니다." })
  @MaxLength(42, { message: "최대 42자까지 입력됩니다." })
  @IsOptional()
  user_address: string;
}

export class StakingContractTokenDto {
  @IsString({ message: "문자열이 아닙니다." })
  contract_address: string;

  @IsString({ message: "문자열이 아닙니다." })
  token_id: string[];
}