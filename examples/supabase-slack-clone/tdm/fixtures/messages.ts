import { Fixture, Relations } from 'tdm/fixture'
import { MessageMapper } from '../mappers/messages/message-mapper'
import { Message } from '../schemas/message'

export const messages: Fixture<MessageMapper, Message>[] = [
  {
    message: 'Hello, this is a message from the admin',
    inserted_at: '2021-12-01T15:00:00+00:00',
    [Relations]: {
      user_id: { username: 'admin@example.com' },
      channel_id: { slug: 'public' },
    },
  },
  {
    message: 'Hi, I\'m a moderator.',
    inserted_at: '2021-12-01T16:00:00+00:00',
    [Relations]: {
      user_id: { username: 'moderator@example.com' },
      channel_id: { slug: 'public' },
    },
  },
  {
    message: 'This is a random message.',
    inserted_at: '2021-12-01T17:00:00+00:00',
    [Relations]: {
      user_id: { username: 'moderator@example.com' },
      channel_id: { slug: 'random' },
    },
  },
]
