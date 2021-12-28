import { Channel } from "../../schemas/channel";
import { Mapper, Property } from "tdm/mapper";
import { UserMapper } from "../users/user-mapper";

export class ChannelMapper extends Mapper<Channel> {
  fields = {
    id: Property.Identifier,
    slug: Property.Comparator,
    inserted_at: Property.Field,
    created_by: {
      mapper: new UserMapper(),
      field: 'id',
    },
  } as const
}
