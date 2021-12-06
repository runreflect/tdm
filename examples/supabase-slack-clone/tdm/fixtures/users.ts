import { User } from '../schemas/user'

export type UserFixture = Omit<Required<User>, 'id'>

export const users: UserFixture[] = [
  {
    username: 'admin@example.com',
    status: 'OFFLINE',
  },
  {
    username: 'moderator@example.com',
    status: 'OFFLINE',
  },
]
