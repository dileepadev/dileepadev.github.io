# TODO

## v2.1.0 — monochrome brand

Released. The platform's Carbon and Paper design system, adopted by the build log.
Detailed tasks, verification results and release checkmarks live in
[issue #7](https://github.com/dileepadev/dileepadev.github.io/issues/7).
This file records scope rather than duplicating its checklist.

| Work                | Scope                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Brand source        | Re-vendor both token sheets, keep the imported design docs exact and record [provenance](docs/brand-source.md)                                         |
| Interface           | Website-style panels and footer, typography, keyboard menus and filters, accessible charts, tables, activity and deployment tiles across all six pages |
| Verification        | Both themes on every page at mobile and desktop widths, keyboard focus and existing build/check commands                                               |
| Release preparation | Package and lockfile version 2.1.0, changelog and current repository instructions                                                                      |
| Publication         | Merged and released as v2.1.0                                                                                                                          |

Brand provenance is in `docs/brand-source.md`. Release order is root, dashboard, links page, then admin;
the [platform roadmap](https://github.com/dileepadev/dileepadev/blob/main/TODO.md)
tracks that order. Completed v2.0.0 work is recorded in `CHANGELOG.md` and its closed issue.

## Later

| Idea                    | When to revisit                                   |
| ----------------------- | ------------------------------------------------- |
| Trend charts            | When `data/history/` has enough snapshots to plot |
| Repository detail pages | If the repositories view becomes cramped          |
