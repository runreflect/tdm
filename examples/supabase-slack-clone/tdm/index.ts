import { TDM } from "test-data-management"
import { channels } from "./fixtures/channels"
import { messages } from "./fixtures/messages"
import { users } from "./fixtures/users"
import { SupabaseApi } from "./mappers/api"
import { ChannelExecutor } from "./mappers/channels/channel-executor"
import { ChannelMapper } from "./mappers/channels/channel-mapper"
import { MessageExecutor } from "./mappers/messages/message-executor"
import { MessageMapper } from "./mappers/messages/message-mapper"
import { UserExecutor } from "./mappers/users/user-executor"
import { UserMapper } from "./mappers/users/user-mapper"

async function main(appName: string, apiKey: string, dryRun: boolean) {
  const tdm = new TDM()

  const supabaseApi = new SupabaseApi(appName, apiKey)

  console.log(`Running job with dryRun: ${dryRun}`)

  tdm.add(users, new UserMapper(), new UserExecutor(supabaseApi))
  tdm.add(channels, new ChannelMapper(), new ChannelExecutor(supabaseApi))
  tdm.add(messages, new MessageMapper(), new MessageExecutor(supabaseApi))

  await tdm.run({ dryRun })
}

const args = process.argv.slice(2)
const appName = args[0]
const apiKey = args[1]
const dryRun = args[2] === 'false' ? false : true

main(appName, apiKey, dryRun)
