import {IsOptional, IsNumber, IsPositive, IsString, IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';


export class GetAllDTO {
    @Type(()=>Number)
    @IsPositive()
    @IsNumber()
    @IsOptional()
    page: number
  
    @Type(()=>Number)
    @IsPositive()
    @IsNumber()
    @IsOptional()
    size: number
   
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    search: string
    
}


@InputType()
export class GetAllGraphQlDTO {
    @Field(()=>Number,{nullable:true})
    @IsPositive()
    @IsInt()
    @IsNumber()
    @IsOptional()
    page?: number
  
    @Field(()=>Number,{nullable:true})
    @Type(()=>Number)
    @IsPositive()
    @IsNumber()
    @IsOptional()
    size?: number
   
    @Field(()=>String,{nullable:true})
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    search?: string
    
}
