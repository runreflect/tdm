import { TDM } from "test-data-management
import { issues } from "./fixtures/issue"
import { IssueMapper } from "./issues/issue-mapper"
import { IssueExecutor } from "./issues/issue-executor"
import { GithubApi } from "./api"

async function main(apiKey: string, owner: string, repo: string, dryRun: boolean) {
  const tdm = new TDM()

  const githubApi = new GithubApi(owner, apiKey)

  tdm.add(issues, new IssueMapper(), new IssueExecutor(githubApi, owner, repo))

  await tdm.run({ dryRun })
}

const args = process.argv.slice(2)
const apiKey = args[0]
const owner = args[1]
const repo = args[2]
const dryRun = args[3] === 'false' ? false : true

main(apiKey, owner, repo, dryRun)
