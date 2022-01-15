import { Fixture, Relations } from 'test-data-management'
import { UserMapper } from '../mappers/users/user-mapper'
import { User } from '../schemas/user'

export const users: Fixture<UserMapper, User>[] = [
  {
    username: 'admin@example.com',
    status: 'OFFLINE',
    [Relations]: {},
  },
  {
    username: 'moderator@example.com',
    status: 'OFFLINE',
    [Relations]: {},
  },
]
