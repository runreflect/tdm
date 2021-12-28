import { Executor } from 'tdm/executor'
import { SupabaseApi } from "../api";
import { Channel } from "../../schemas/channel";

export class ChannelExecutor extends Executor<Channel> {
  api: SupabaseApi

  constructor(api: SupabaseApi) {
    super()
    this.api = api
  }

  async create(obj: Channel) {
    return this.api.createChannel(obj)
  }

  async readAll(): Promise<Channel[]> {
    return this.api.getChannels()
  }

  async update(obj: Channel): Promise<unknown> {
    return await this.api.updateChannel(obj.id, obj)
  }

  async delete(objOrId: Channel | number): Promise<unknown> {
    const id = isChannel(objOrId) ? objOrId.id : objOrId

    return await this.api.deleteChannel(id)
  }
}

function isChannel(objOrId: Channel | number): objOrId is Channel {
  return (objOrId as Channel).id != undefined
}
