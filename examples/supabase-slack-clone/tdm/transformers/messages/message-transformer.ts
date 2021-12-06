import { FixtureTransformer } from "tdm/fixture";
import { Message } from "../../schemas/message";
import { MessageFixture } from "../../fixtures/messages";
import { User } from "../../schemas/user";
import { Channel } from "../../schemas/channel";

export class MessageTransformer extends FixtureTransformer<MessageFixture, Message, 'id'> {
  constructor(fixtures: MessageFixture[]) {
    super(fixtures)
  }

  isMatchesEntity(existing: Message, candidate: MessageFixture): boolean {
    return existing.message === candidate.message
  }

  mapping(fixture: MessageFixture, relations: { user?: User, channel?: Channel }): Omit<Message, 'id'> {
    if (relations.user?.id === undefined) {
      throw new Error('No user found')
    }

    if (relations.channel?.id === undefined) {
      throw new Error('No channel found')
    }

    return {
      inserted_at: fixture.inserted_at,
      message: fixture.message,
      user_id: relations.user.id,
      channel_id: relations.channel.id,
    }
  }

  primaryKey(): 'id' {
    return 'id'
  }
}
