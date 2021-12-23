import { Fixture } from 'tdm/fixture'
import { Issue } from '../schemas/issue'

export type AbridgedIssue = Omit<Issue,
  'id' |
  'node_id' |
  'url' |
  'repository_url' |
  'labels_url' |
  'comments_url' |
  'events_url' |
  'html_url' |
  'locked' |
  'active_lock_reason' |
  'draft' |
  'author_association' |
  'reactions' |
  'milestone' |
  'closed_at' |
  'created_at' |
  'updated_at' |
  'assignee' |
  'user'
>

type IssueRelations = {
  [Fixture.References]?: {
    user: { username: string },
  }
}

export type IssueFixture = Omit<AbridgedIssue, 'number' | 'created_by' | 'user' | 'assignee'> & IssueRelations
