# hirelens → candidlens

**This CLI is now [`candidlens`](https://www.npmjs.com/package/candidlens).** HireLens was renamed to CandidLens in November 2026.

```bash
npx candidlens --help
```

This package only forwards: `hirelens <command>` runs `candidlens <command>` with the same arguments, after a one-line notice on stderr. It gets no new features. Switch your scripts to `candidlens`.

- A session saved in `~/.hirelens` keeps working; the next `candidlens login` saves to `~/.candidlens`.
- The old `HIRELENS_*` environment names still work.

Docs: [candidlens.vercel.app/docs/cli](https://candidlens.vercel.app/docs/cli) · Code: [github.com/abhay-yemekar/candidlens](https://github.com/abhay-yemekar/candidlens)

## License

MIT
