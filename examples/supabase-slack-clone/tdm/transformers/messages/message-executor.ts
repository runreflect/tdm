import { Message } from "../../../tdm/schemas/message";
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

  async readCollection(): Promise<Message[]> {
    return this.api.getMessages()
  }

  async read(objOrId: Message | number): Promise<Message | undefined> {
    //TODO Update call to retrieve single message
    return (await this.api.getMessages()).find(message => message.id)
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
