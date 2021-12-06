import { FixtureTransformer } from "tdm/fixture";
import { User } from "../../schemas/user";
import { Channel } from "../../schemas/channel";
import { ChannelFixture } from "../../fixtures/channels";

export class ChannelTransformer extends FixtureTransformer<ChannelFixture, Channel, 'id'> {
  constructor(fixtures: ChannelFixture[]) {
    super(fixtures)
  }

  isMatchesEntity(existing: Channel, candidate: ChannelFixture): boolean {
    return existing.slug === candidate.slug
  }

  mapping(fixture: ChannelFixture, relations: { user?: User, channel?: Channel }): Omit<Channel, 'id'> {
    if (relations.user?.id === undefined) {
      throw new Error('No user found')
    }

    return {
      slug: fixture.slug,
      created_by: relations.user.id,
      inserted_at: fixture.inserted_at,
    }
  }

  primaryKey(): 'id' {
    return 'id'
  }
}
