import { Executor } from "test-data-management"
import { GithubApi } from "../api"
import { Issue } from "../schemas/issue"

export class IssueExecutor extends Executor<Issue> {
  api: GithubApi
  owner: string
  repo: string

  constructor(api: GithubApi, owner: string, repo: string) {
    super()
    this.api = api
    this.owner = owner
    this.repo = repo
  }

  async create(obj: Issue) {
    return this.api.createIssue(this.owner, this.repo, obj)
  }

  async readAll(): Promise<Issue[]> {
    return this.api.getIssues(this.owner, this.repo)
  }

  async update(obj: Issue): Promise<unknown> {
    delete obj.assignees // Github prevents both assignee and assignees from being passed
    return await this.api.updateIssue(this.owner, this.repo, obj)
  }

  async delete(objOrId: Issue | number): Promise<unknown> {
    //@ts-ignore
    return await this.api.deleteIssue(objOrId['node_id'])
  }
}
