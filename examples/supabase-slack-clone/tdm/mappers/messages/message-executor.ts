import { Message } from "../../schemas/message";
import { Executor } from 'tdm/executor'
import { SupabaseApi } from "../api";

export class MessageExecutor extends Executor<Message> {
  api: SupabaseApi

  constructor(api: SupabaseApi) {
    super()
    this.api = api
  }

  async create(obj: Message) {
    return this.api.createMessage(obj)
  }

  async readAll(): Promise<Message[]> {
    return this.api.getMessages()
  }

  async update(obj: Message): Promise<unknown> {
    return this.api.updateMessage(obj.id, obj)
  }

  async delete(objOrId: Message | number): Promise<unknown> {
    const id = isMessage(objOrId) ? objOrId.id : objOrId
    return await this.api.deleteMessage(id)
  }
}

function isMessage(objOrId: Message | number): objOrId is Message {
  return (objOrId as Message).id != undefined
}
