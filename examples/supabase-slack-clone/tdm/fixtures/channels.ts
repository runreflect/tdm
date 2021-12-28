import { Fixture, Relations } from 'tdm/fixture'
import { ChannelMapper } from '../mappers/channels/channel-mapper'
import { Channel } from '../schemas/channel'

export const channels: Fixture<ChannelMapper, Channel>[] = [
  {
    slug: 'public',
    inserted_at: '2021-12-01T15:00:00+00:00',
    [Relations]: {
      created_by: { username: 'admin@example.com' },
    },
  },
  {
    slug: 'random',
    inserted_at: '2021-12-01T15:00:00+00:00',
    [Relations]: {
      created_by: { username: 'moderator@example.com' },
    },
  },
]
