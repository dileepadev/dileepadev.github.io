# Pillar icons

The six marks for the things Dileepa does, drawn with the same stroke as the interface icons:
24px grid, 2px round stroke, black and white. The website does not show them on any page; it keeps
them in `components/icons/PillarIcons.tsx` and lists them on `/brand`. They remain brand assets for
slides, profiles and anywhere a mark for one of the six areas is wanted.

| Mark                 | Stands for                                                                   |
| -------------------- | ---------------------------------------------------------------------------- |
| `ai-engineering`     | Building agentic systems, orchestrating LLM workflows, designing evaluations |
| `open-source`        | Developing tools and contributing to projects                                |
| `public-speaking`    | Talks, workshops and conference sessions                                     |
| `technical-writing`  | Articles, documentation and notes                                            |
| `technical-videos`   | Walkthroughs and demos                                                       |
| `community-building` | Organising and supporting developer communities                              |

## Files

Each mark comes in five files.

| File                | What                                                                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<name>-symbol.svg` | The geometry, stroked in `currentColor`. It matches the website's component and follows any theme, so it is the one to inline in a page. **This is the source** |
| `<name>.svg`        | Ink 100 `#F1F1F1`, for a Carbon surface                                                                                                                         |
| `<name>-badge.svg`  | The mark on a round Ink 800 `#0D0D0D` badge with an Ink 500 `#2E2E2E` hairline edge                                                                             |
| `<name>.png`        | 512px, the mark on a Carbon `#050505` field                                                                                                                     |
| `<name>-badge.png`  | 512px, the badge on transparency                                                                                                                                |

## Rebuilding

```sh
node docs/brand/icons/generate.mjs
```

Edit a `-symbol.svg` to change a mark, then run the script to rebuild the other four files for it.
It needs the website checked out as `../dileepa-dev` with `npm install` run, for `sharp`. If a
symbol changes, change the website's component to match, so the two stay one drawing.
