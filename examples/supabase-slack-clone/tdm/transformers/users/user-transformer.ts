import { FixtureTransformer } from "tdm/fixture";
import { User } from "../../schemas/user";
import { UserFixture } from "../../fixtures/users";

export class UserTransformer extends FixtureTransformer<UserFixture, User, 'id'> {
  constructor(fixtures: UserFixture[]) {
    super(fixtures)
  }

  isMatchesEntity(existing: User, candidate: UserFixture): boolean {
    return existing.username === candidate.username
  }

  mapping(fixture: UserFixture): Omit<User, 'id'> {
    return {
      username: fixture.username,
      status: fixture.status,
    }
  }

  primaryKey(): 'id' {
    return 'id'
  }
}
