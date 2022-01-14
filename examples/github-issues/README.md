# Github Issues Example

This demonstrates the use of TDM to manage test data stored in a third-party system. The TDM fixtures define
a set of Github Issues and, when executed, TDM uses the Github API to get the repository into the expected
state.

**Warning: Do NOT run this in a repo containing real data. Running this with `dryRun` mode set to false will
permanently delete all existing Github issues in your repository!**

### Installation

```
npm run tdm-build
```

### Running tdm

Auto-generate bindings to the Github API

_(From the root /tdm directory):_
```
node dist/index.js generate openapi https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json examples/github-issues/schemas
```

Run TDM in dry-run mode to see what changes will be applied

_(From this directory):_
```
node dist/index <github-api-key> <repo-organization> <repo-name> true
```

Substitute the last argument for `false` to apply the changes.
