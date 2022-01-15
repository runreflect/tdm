import { Fixture, Relations } from "test-data-management";
import { IssueMapper } from "../issues/issue-mapper";
import { Issue } from "../schemas/issue";

export const issues: Fixture<IssueMapper, Issue>[] = [
  {
    title: 'First Issue',
    body: 'Description for the first issue',
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
