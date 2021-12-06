import { Executor } from 'tdm/executor'
import { SupabaseApi } from "../api";
import { User } from '../../schemas/user';

export class UserExecutor extends Executor<User> {
  api: SupabaseApi

  constructor(api: SupabaseApi) {
    super()
    this.api = api
  }

  async create(obj: User) {
    return this.api.createUser(obj)
  }

  async readCollection(): Promise<User[]> {
    return await this.api.getUsers()
  }

  async read(objOrId: User | number): Promise<User | undefined> {
    //TODO Update call to retrieve single user
    return (await this.api.getUsers()).find(user => user.id)
  }

  async update(obj: User): Promise<unknown> {
    return this.api.updateUser(obj.id, obj)
  }

  async delete(objOrId: User | string): Promise<unknown> {
    const id = isUser(objOrId) ? objOrId.id : objOrId

    return await this.api.deleteUser(id)
  }
}

function isUser(objOrId: User | string): objOrId is User {
  return (objOrId as User).id != undefined
}
