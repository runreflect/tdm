import { FixtureTransformer } from "tdm/fixture";
import { Issue } from "../schemas/issue";
import { AbridgedIssue, IssueFixture } from "../fixtures/base";

export class IssueTransformer extends FixtureTransformer<IssueFixture, AbridgedIssue, 'number'> {
  constructor(fixtures: IssueFixture[]) {
    super(fixtures)
  }

  isMatchesEntity(existing: Issue, candidate: IssueFixture): boolean {
    return existing.title === candidate.title
  }

  mapping(fixture: IssueFixture): Omit<AbridgedIssue, 'number'> {
    return {
      title: fixture.title,
      state: fixture.state,
      labels: fixture.labels,
      comments: fixture.comments,
      body: fixture.body,
    }
  }

  primaryKey(): 'number' {
    return 'number'
  }
}
