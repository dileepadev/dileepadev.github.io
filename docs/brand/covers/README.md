# Social covers

Every file here is derived from `source-1584x396.svg` - the LinkedIn-sized
artwork, which is where edits go. Regenerate the rest rather than editing them.

The artwork is 4:1 and is **never stretched**. Each target scales it to fit and
centres it on Carbon (`#050505`), so the composition is identical everywhere and
only the surrounding space changes. YouTube is the one that needs care: the
artwork sits inside the 1546x423 safe area, because that is all that survives
the crop on a phone.

| File | Size | Where it goes | Artwork scale |
| --- | --- | --- | --- |
| `linkedin-cover` | 1584x396 | LinkedIn personal profile | 100% (native) |
| `reddit-banner` | 1920x384 | Reddit profile | 97% |
| `x-header` | 1500x500 | X profile header | 91% |
| `youtube-banner` | 2560x1440 | YouTube channel | 98%, inside the safe area |
| `facebook-cover` | 1640x624 | Facebook page | 98% |
| `github-social` | 1280x640 | A repo's Social preview, in repo settings | 76% |
| `twitch-banner` | 1200x480 | Twitch profile banner | 72% |
| `discord-banner` | 600x240 | Discord profile (Nitro) | 36% - see below |
| `og` | 1200x630 | `public/og.png`, the site card | 72% |
| `og-wide` | 1600x900 | `public/og2.png`, the 16:9 variant on /brand | 96% |

Each exists as `.svg`, `.png` and `.jpg`. Use PNG for upload; JPG is there for
the platforms that re-encode anyway and for anything with a size cap. The SVG
keeps `<text>` for the JSON block in JetBrains Mono, so it needs that font
installed to render correctly - the PNG and JPG do not.

**`discord-banner` is the one compromise.** At 600x240 the artwork lands at 36%
and the JSON payload becomes texture rather than text - roughly 4px. The handle,
the role and the tagline still read. If that is not good enough, the fix is a
cropped composition for that size rather than a smaller scale of this one.

**One image covers every link preview.** OG, X's large image card, Facebook and
LinkedIn all accept 1200x630; cutting 630/628/627 separately buys nothing.

## The generated cards share this design

`lib/og/card.tsx` draws the per-post, per-project and per-event cards, and it is
the same terminal window - same chrome, same lockup, same palette. What varies is
the record: the command line names that page's path and the title is its own. So
there is one card design on the platform, not a cover design and a card design.
If this artwork changes, that component changes with it.

## Regenerating

The generator lives in the commit that added this directory. It reads
`source-1584x396.svg`, nests it inside a new viewBox per target, and rasterises
with headless Chrome using JetBrains Mono injected as an `@font-face` - the font
is not installed on most machines, and without it the JSON block silently falls
back to a generic monospace.
