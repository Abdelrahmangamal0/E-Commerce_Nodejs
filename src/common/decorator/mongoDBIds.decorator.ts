import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator"
import { Types } from "mongoose"

@ValidatorConstraint({ name: 'math between fields', async: false })
export class MongoDBIds implements ValidatorConstraintInterface{
    validate(ids: Types.ObjectId[], args?: ValidationArguments ): Promise<boolean> | boolean {
   
       for (const id of ids) {
           if (!Types.ObjectId.isValid(id)) {
            return false
           }
        }
        return true
    }
defaultMessage(args?: ValidationArguments): string {
    return `In-Valid MongoDBId format `
}

}

export function isMongoDBIds (constraints?: string[], validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target:object.constructor,
            propertyName,
            options:validationOptions,
            constraints,
            validator: MongoDBIds
        })
    }
}




