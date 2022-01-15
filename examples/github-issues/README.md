# Github Issues Example

This demonstrates the use of TDM to manage test data stored in a third-party system. The TDM fixtures define
a set of Github Issues and, when executed, TDM uses the Github API to get the repository into the expected
state.

**Warning: Do NOT run this in a repo containing real data. Running this with `dryRun` mode set to false will
permanently delete all existing Github issues in your repository!**

### Installation

```
npm run build
```

### Running tdm

Auto-generate bindings to the Github API and output to /schemas directory:

```
npx test-data-management generate openapi https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json schemas
```

Run TDM in dry-run mode to see what changes will be applied:

```
node dist/index <github-api-key> <repo-organization> <repo-name> true
```
