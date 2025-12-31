import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "containField", async: false })
export class ContainFieldConstraint
  implements ValidatorConstraintInterface {

  validate(_: any, args: ValidationArguments): boolean {
    const dto = args.object as Record<string, any>;

    return Object.values(dto).some(
      value => value !== undefined && value !== null && value !== ""
    );
  }

  defaultMessage(): string {
    return "All update fields are empty";
  }
}

export function containField(validationOptions?: ValidationOptions) {
  return function (constructor: Function) {
    registerDecorator({
      name: "containField",
      target: constructor,
      propertyName: undefined!,
      options: validationOptions,
      validator: ContainFieldConstraint,
    });
  };
}
