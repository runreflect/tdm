import { Executor } from "../../../../dist/executor"
import { Issue } from "../schemas/issue"
import { GithubApi } from "./api"
import { AbridgedIssue } from "../fixtures/base"

export class IssueExecutor extends Executor<AbridgedIssue> {
  api: GithubApi
  owner: string
  repo: string

  constructor(api: GithubApi, owner: string, repo: string) {
    super()
    this.api = api
    this.owner = owner
    this.repo = repo
  }

  async create(obj: AbridgedIssue) {
    return this.api.createIssue(this.owner, this.repo, obj)
  }

  async readCollection(): Promise<AbridgedIssue[]> {
    return this.api.getIssues(this.owner, this.repo)
  }

  async read(objOrId: AbridgedIssue | number): Promise<AbridgedIssue | undefined> {
    const number = isIssue(objOrId) ? objOrId.number : objOrId
    return (await this.api.getIssues(this.owner, this.repo)).find(issue => issue.number === number)
  }

  async update(obj: AbridgedIssue): Promise<unknown> {
    return await this.api.updateIssue(this.owner, this.repo, obj)
  }

  async delete(objOrId: AbridgedIssue | number): Promise<unknown> {
    //@ts-ignore
    return await this.api.deleteIssue(objOrId['node_id'])
  }
}

function isIssue(objOrId: AbridgedIssue | number): objOrId is AbridgedIssue {
  return (objOrId as Issue).number != undefined
}
