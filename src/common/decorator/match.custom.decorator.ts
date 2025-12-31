import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator"

@ValidatorConstraint({ name: 'math between fields', async: false })
export class MathBetweenFields<T=any> implements ValidatorConstraintInterface{
    validate(value: T, args?: ValidationArguments ): Promise<boolean> | boolean {
    //    console.log(value , args  ,args?.constraints , args?.object[args?.constraints[0].split(' ')[0]] );
       
        return value === args?.object[args?.constraints[0].split(' ')[0]]
    }
defaultMessage(args?: ValidationArguments): string {
    return `misMatch between ${args?.property} and  ${args?.constraints} `
}

}

export function isMatch<T=any>(constraints: string[], validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target:object.constructor,
            propertyName,
            options:validationOptions,
            constraints,
            validator: MathBetweenFields
        })
    }
}




