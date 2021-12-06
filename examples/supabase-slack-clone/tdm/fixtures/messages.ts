import { Fixture } from 'tdm/fixture'
import { Message } from '../schemas/message'

type MessageRelations = {
  [Fixture.References]?: {
    user: { username: string },
    channel: { slug: string },
  }
}

export type MessageFixture = Omit<Required<Message>, 'id' | 'user_id' | 'channel_id'> & MessageRelations

export const messages: MessageFixture[] = [
  {
    message: 'Hello, this is a message from the admin',
    inserted_at: '2021-12-01T15:00:00+00:00',
    [Fixture.References]: {
      user: { username: 'admin@example.com' },
      channel: { slug: 'public' },
    },
  },
  {
    message: 'Hi, I\'m a moderator.',
    inserted_at: '2021-12-01T16:00:00+00:00',
    [Fixture.References]: {
      user: { username: 'moderator@example.com' },
      channel: { slug: 'public' },
    },
  },
  {
    message: 'This is a random message.',
    inserted_at: '2021-12-01T17:00:00+00:00',
    [Fixture.References]: {
      user: { username: 'moderator@example.com' },
      channel: { slug: 'random' },
    },
  },
]