import { User } from "../../schemas/user";
import { Mapper, Property } from "tdm/mapper";

export class UserMapper extends Mapper<User> {
  fields = {
    id: Property.Identifier,
    username: Property.Comparator,
    status: Property.Field,
  } as const
}
