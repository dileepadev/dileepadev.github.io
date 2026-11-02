# Brand source

Brand version **2.1.0**, vendored from [`dileepadev`](https://github.com/dileepadev/dileepadev)'s
`docs/brand/`, which owns the originals.

| Canonical source in `dileepadev` | Copy here | Adaptation |
| --- | --- | --- |
| `docs/brand/brand-tokens.css` | `src/styles/brand-tokens.css` | Remove only the Google Fonts import; load the same faces and weights through the font link in src/layouts/Layout.astro |
| `docs/brand/brand-tokens.css` | `docs/brand-tokens.css` | None |
| `docs/brand/brand-guide.md` | `docs/brand-guide.md` | None |
| `docs/brand/design-system.md` | `docs/design-system.md` | None |
| `DESIGN.md` | `DESIGN.md` | None |
| `docs/brand/favicon/` | Public favicon/app icons and manifests | None |
| `docs/brand/og.png` | `public/og.png` | None |

Canonical token SHA-256: `df57c8ad86d947839a9643355359bfee3d8775bc1023aa562eafc58203c9fc71`.

The runtime sheet's vendor header records the source and sole font-loading
adaptation. Components use semantic variables; do not patch either copy or
copy palette values into components. Application layout rules belong in the
app's global styles. Both themes use Manrope 400/500/700 and JetBrains Mono
400/500.

To refresh, copy the files from the root's latest release, preserve only the
documented font-loading adaptation, and run the app's checks and both-theme
browser review. These vendored files are not another asset host.
