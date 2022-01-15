import { Message } from "../../schemas/message";
import { Mapper, Property } from "test-data-management";
import { UserMapper } from "../users/user-mapper";
import { ChannelMapper } from "../channels/channel-mapper";

export class MessageMapper extends Mapper<Message> {
  fields = {
    id: Property.Identifier,
    message: Property.Comparator,
    inserted_at: Property.Field,
    user_id: {
      mapper: new UserMapper(),
      field: 'id',
    },
    channel_id: {
      mapper: new ChannelMapper(),
      field: 'idfd',
    },
  } as const
}
