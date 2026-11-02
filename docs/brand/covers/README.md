# Social covers

The covers for every platform are one illustration, drawn in the v2.1.0 theme: **an engineer
guiding a team of AI agents.** Five agents climb a staircase, handing a piece of work up each
step - data, documents, code, a check - to a shared goal at the top. The engineer, in white with
round glasses, points the way and never touches the work. Ticks mark the steps already approved,
and the goal opens onto what it unlocks: talks, writing, video and community.

The only text is the handle, `@dileepadev` (the `@` one step muted, both Manrope 500), and the
domain, `dileepa.dev` in JetBrains Mono. No name and no photograph: a profile already shows
both next to the cover. Everything else is the site's own parts - app-icon tiles,
hairlines, Lucide icons and the dot grid - in the semantic palette from
[`../brand-tokens.css`](../brand-tokens.css).

## Files

Each cover is a PNG for upload and a JPG for the platforms that re-encode anyway or cap file size.

| File             | Size      | Where it goes                        | How it is laid out                                                    |
| ---------------- | --------- | ------------------------------------ | --------------------------------------------------------------------- |
| `linkedin-cover` | 1584x396  | LinkedIn profile                     | The master. The profile photo covers the bottom-left, which is empty  |
| `x-header`       | 1500x500  | X profile header; the profile README | Raised, so the avatar's overlay and the mobile crop miss the artwork  |
| `youtube-banner` | 2560x1440 | YouTube channel                      | All content inside the 1546x423 safe area; the rest is the dot grid   |
| `facebook-cover` | 1640x624  | Facebook page                        | Held to the central 68% that the mobile crop keeps                    |
| `reddit-banner`  | 1920x384  | Reddit profile                       | Fills the height; the avatar overlaps the empty left                  |
| `github-social`  | 1280x640  | A repository's Social preview        | A large handle above the artwork, for use as a link preview           |
| `twitch-banner`  | 1200x480  | Twitch profile                       | The master, scaled to the width                                       |
| `discord-banner` | 600x240   | Discord profile (Nitro)              | Scaled down with larger type; the avatar covers the empty bottom-left |

Nothing is stretched: each cover scales the same artwork to fit and extends the ground line and
dot grid to the edges. The approved link-preview cards are not here; they are
[`../og.png`](../og.png) and [`../og2.png`](../og2.png).

## Regenerating

```sh
node docs/brand/covers/generate.mjs            # all eight
node docs/brand/covers/generate.mjs x-header   # one
```

The script draws each cover as SVG, renders it in headless Chrome and writes the PNG and JPG
beside it. It needs Google Chrome on `PATH`, Manrope and JetBrains Mono installed, and the site
checked out as `../dileepa-dev` with `npm install` run, for the Lucide icon data and `sharp`.
Edit the `SPECS` list to change a size or placement, and the `art()` function to change the
illustration.
