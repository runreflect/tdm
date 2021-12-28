import { Fixture, Relations } from "tdm/fixture";
import { IssueMapper } from "../issues/issue-mapper";
import { Issue } from "../schemas/issue";

export const issues: Fixture<IssueMapper, Issue>[] = [
  {
    title: 'First Issue',
    body: 'Description for the first issue with modification',
    state: 'open',
    labels: [],
    [Relations]: {},
  },
  {
    title: 'Second Issue',
    body: 'Description for the second issue',
    state: 'open',
    labels: [],
    [Relations]: {},
  },
]
