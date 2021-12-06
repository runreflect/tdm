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

  async readCollection(): Promise<Channel[]> {
    return this.api.getChannels()
  }

  async read(objOrId: Channel | number): Promise<Channel | undefined> {
    //TODO Update call to retrieve single channel
    return (await this.api.getChannels()).find(channel => channel.id)
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
