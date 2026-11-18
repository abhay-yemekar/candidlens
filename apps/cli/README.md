# candidlens (CLI)

Command-line companion for [CandidLens](https://candidlens.vercel.app), the open-source, self-hostable AI resume screener that quotes its evidence.

Drive CandidLens from any pipeline: create jobs, draft rubrics from a job description with a model, upload resume folders, score them and print a ranked table, without opening the browser.

## Install

```bash
npx candidlens --help
```

Requires Node ≥ 20. Zero runtime dependencies.

**Coming from `hirelens`?** The CLI was published as `hirelens` up to 1.4.x. That package now forwards to this one, and a session you saved with it in `~/.hirelens` keeps working.

## Configuration

The CLI talks to a CandidLens server: the one you self-host with `docker compose up`, or your deployment.

| Environment             | Purpose                            | Default                 |
| ----------------------- | ---------------------------------- | ----------------------- |
| `CANDIDLENS_API_URL`    | Server base URL                    | `http://localhost:4000` |
| `CANDIDLENS_CONFIG_DIR` | Where the session config is stored | `~/.candidlens`         |

`candidlens login` stores your session in `~/.candidlens/config.json`. Until then, a session saved in `~/.hirelens/config.json` is read. The old `HIRELENS_*` names still work for every setting.

## Commands

```
candidlens login <email> [--password <pw>]   Sign in (session saved locally)
candidlens whoami                            Show the signed-in user
candidlens logout                            Clear the local session
candidlens org list                          List your organizations
candidlens org create "Acme Hiring"          Create + activate an organization
candidlens org use <orgId>                   Switch the active organization
candidlens jobs list                         List jobs in the active org
candidlens jobs create <title> --jd <file>   Create a job (or pipe JD on stdin)
candidlens rubric list <jobId>               List rubric versions
candidlens rubric derive <jobId>             LLM-derive a rubric from the JD
candidlens rubric import <jobId> --file f    Import a rubric JSON
candidlens score <jobId> <resumes...|dir>    Upload + score + print ranking
      --breakdown                              Also print per-criterion details
      --json                                   Machine-readable ranked output
candidlens version                           Print the version
```

Environment: `CANDIDLENS_API_URL`, `CANDIDLENS_COOKIE`, `CANDIDLENS_PASSWORD`, `CANDIDLENS_CONFIG_DIR`.

## Example

```bash
candidlens login recruiter@corp.com
candidlens jobs create "Backend Engineer" --jd ./jd.md
candidlens rubric derive <jobId>
candidlens score <jobId> ./resumes/
```

`score` prints a ranked table (rank · candidate · overall · stage) suitable for piping into other tools. The full reference is at [candidlens.vercel.app/docs/cli](https://candidlens.vercel.app/docs/cli).

## License

MIT. See [LICENSE](https://github.com/abhay-yemekar/candidlens/blob/main/LICENSE).
