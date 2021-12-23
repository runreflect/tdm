import { Issue } from "./schemas/issue"
import { NullableMilestone } from "./schemas/nullable-milestone"
import { SimpleUser } from "./schemas/simple-user"

class FixtureRef {
  static readonly Relations = Symbol('Relations')
}

abstract class Entity<T> {
  abstract fields: keyof T
  abstract identifier: keyof T
  abstract comparator: keyof T
  abstract relations: Partial<Record<keyof T, ForeignEntity<any>> //TODO doesn't seem to work since it allows values that shouldn't exist
}

interface ForeignEntity<T> {
  entity: Entity<T>,
  field: keyof T
}

type Fixture<T extends Entity<any>> = {
  [K in T['fields'] & symbol]
}

class UserEntity extends Entity<SimpleUser> {
  identifier: 'id'

  comparator: 'email'

  fields:
    'name' |
    'type'
  
  relations: {}
}

class MilestoneEntity extends Entity<NullableMilestone> {
  identifier: 'id'

  comparator: 'title'

  fields:
    'description' |
    'state'
  
  relations: {}
}

class IssueEntity extends Entity<Issue> {
  identifier: 'id'

  comparator: 'title'

  fields: 
    'state' |
    'labels' |
    'body'
  
  relations: {
    'assignee': {
      entity: UserEntity,
      field: 'id',
    },

    'milestone': {
      entity: MilestoneEntity,
      field: 'id', 
    },
  }
}

const users: Fixture<UserEntity>[] = [
  {
    name: 'tmcneal',
    email: 'todd@reflect.run',
    type: 'active',
  }
]

const milestones: Fixture<MilestoneEntity>[] = [
  {
    title: 'Cross-browser',
    description: 'Add support for more browsers',
    state: 'open',
  }
]

const issues: Fixture<IssueEntity>[] = [
  {
    title: 'New Issue',
    state: 'open',
    labels: [],
    body: 'Description for this issue',
    [FixtureRef.Relations]: {
      assignee: 'todd@reflect.run',
      milestone: 'Cross-browser',
    }
  }
]

