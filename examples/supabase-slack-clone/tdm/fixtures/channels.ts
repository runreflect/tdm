import { Fixture } from 'tdm/fixture'
import { Channel } from '../schemas/channel'

type ChannelRelations = {
  [Fixture.References]?: {
    user: { username: string },
  }
}

export type ChannelFixture = Omit<Channel, 'id' | 'created_by'> & ChannelRelations

export const channels: ChannelFixture[] = [
  {
    slug: 'public',
    inserted_at: '2021-12-01T15:00:00+00:00',
    [Fixture.References]: {
      user: { username: 'admin@example.com' },
    },
  },
  {
    slug: 'random',
    inserted_at: '2021-12-01T15:00:00+00:00',
    [Fixture.References]: {
      user: { username: 'moderator@example.com' },
    },
  },
]
