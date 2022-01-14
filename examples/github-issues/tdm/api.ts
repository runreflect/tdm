import axios from 'axios'
import { Octokit } from 'octokit'
import { Issue } from './schemas/issue'

const deleteMutation = `mutation ($issueId: ID!) { 
  deleteIssue(input: {issueId: $issueId}) {
    clientMutationId
  }
}`

export class GithubApi {
  octokit: Octokit
  baseUrl: string
  headers: Record<string, string>

  constructor(username: string, accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken })

    this.baseUrl = 'https://api.github.com'
    console.log('user', username, 'accesstoken', accessToken)
    const token = Buffer.from(`${username}:${accessToken}`, 'utf8').toString('base64')

    this.headers = {
      authorization: `Basic ${token}`, // Must be service-role API key
    }
  }

  async getIssues(owner: string, repo: string): Promise<Issue[]> {
    const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/issues`, { headers: this.headers })
    return response.data
  }

  async createIssue(owner: string, repo: string, issue: Omit<Issue, 'id'>): Promise<unknown> {
    const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/issues`, issue, { headers: this.headers })
    return response.data
  }
  
  async updateIssue(owner: string, repo: string, issue: Issue): Promise<unknown> {
    const response = await axios.patch(`${this.baseUrl}/repos/${owner}/${repo}/issues/${issue.number}`, issue, { headers: this.headers })
    return response.data
  }

  async zdeleteIssue(nodeId: number): Promise<unknown> {
    return this.octokit.graphql(deleteMutation, { issueId: nodeId })
  }
}
