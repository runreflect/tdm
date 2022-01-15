import { User } from "../../schemas/user";
import { Mapper, Property } from "test-data-management";

export class UserMapper extends Mapper<User> {
  fields = {
    id: Property.Identifier,
    username: Property.Comparator,
    status: Property.Field,
  } as const
}
