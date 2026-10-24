# Part 1: Experience Template

> Product: **"Maa, Sunao Na"**, a digital keepsake gifted by children to their mother.
> Current edition: **Mamma's Birthday** (occasion module: `birthday`).
> Companion docs:
> - `02-questions-and-context-template.md` (family profile + question bank, fill-in template)
> - `03-generated-experience-mamma-birthday.md` (this template + filled data = the actual edition)

This document is the **build spec**. An agent handed this file plus the other two should be able to bootstrap the feature inside an existing Next.js project (or a fresh one), seed it with placeholder data, and make everything editable from an admin view.

---

## 0. Instructions for the implementing agent

1. **Read the local Next.js docs first.** This project uses Next 16. Before writing code, read:
   - `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` (`middleware.ts` is now `proxy.ts`)
   - `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` (`import { ViewTransition } from 'react'`)
   - `node_modules/next/dist/docs/01-app/02-guides/authentication.md`
   - `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`
   Follow those docs over your memory wherever they conflict.
2. **Namespace everything** so it can live in an existing app without collisions:
   - Code: `src/features/sunao/**`
   - Routes: `src/app/(sunao)/**` (public) and `src/app/sunao-admin/**` (admin)
   - DB tables: prefix `ss_`
   - Env vars: prefix `SS_` (R2 vars prefix `R2_`)
   - CSS tokens: prefix `--ss-`
3. **Stack constraints (use only what exists, plus one tiny dep):**
   - Next 16 App Router, React 19, TypeScript, Tailwind 4, Drizzle ORM + `@libsql/client` (Turso), Radix Dialog/Slot, zustand, lucide-react, clsx, tailwind-merge.
   - **Allowed new dependency:** `aws4fetch` (pinned exact version) to sign R2 requests. Alternatively hand-roll SigV4 with Web Crypto. No other deps without asking.
   - No animation library. Motion = CSS + SVG + Web Animations API + React `<ViewTransition>`.
   - Audio = `MediaRecorder` + Web Audio `AnalyserNode`. Offline buffer = IndexedDB (raw API or a ~50-line wrapper, no dep).
4. **Seed with placeholder data** from Part 3 (`03-generated-experience-mamma-birthday.md`, section "Seed payload"). Every string, question, person, image slot and greeting must be editable from admin.
5. **Do not hardcode** any family-specific text in components. All content comes from DB (seeded) or the `ss_copy` table.
6. Deployment target: a **separate Vercel account**, with **Cloudflare R2** as the only media store. `@vercel/blob` must not be used for this feature.

---

## 1. Product overview

### 1.1 The idea in one line
Children gift their mother a beautiful, private, Hinglish "album" on her birthday. It opens with greetings from the whole family, then becomes a book of questions she answers over the following weeks by speaking or writing, so her life story is kept in her own voice.

### 1.2 Two halves of the artifact
| Half | When | What | Who creates content |
|---|---|---|---|
| **Tohfa (The Gift)** | Birthday reveal | Diya lighting, cake & candles, family greetings (text/voice/video/photo), photo memories | Family (via contributor links) + admin |
| **Kitaab (The Book)** | Birthday onwards, at her pace | Chapters of questions from childhood to today; she speaks or writes | Mamma |

A third surface, **Padho (Reader)**, lets the children listen to and read what Mamma has kept, respecting sealed letters.

### 1.3 Personas
| Persona | Device reality | Needs |
|---|---|---|
| **Mamma (recipient)** | Android or iPhone, WhatsApp-native, may have larger font settings, may type slowly in Roman script | Big type, voice-first, zero jargon, nothing lost, no pressure |
| **Children / admin (Sunny, Mickey, Gunjan)** | Laptop + phone | Edit everything, collect greetings, upload photos, preview as Mamma, listen to answers, export |
| **Family contributors (Papaji, Mamaji, cousins)** | Phone via WhatsApp link | Leave a greeting in under 2 minutes without signing up |

### 1.4 Design principles (non-negotiable)
1. **Ek sawaal, ek screen.** One question per screen, nothing competing.
2. **Koi pressure nahi.** No percentages, word counts, timers that matter, or "required".
3. **Kuch bhi khona nahi chahiye.** Autosave text on every change (debounced); audio chunks saved locally and uploaded continuously.
4. **Unki raftaar.** Skip, come back, re-record, "Aaj nahi" for any question.
5. **Apnapan over polish.** Paper, ink, diya light, marigold. Slow motion. Warm Hinglish copy.
6. **Respect.** Always "aap". Heavier questions are opt-in. Losses are honoured gently, never on the birthday reveal unless admin explicitly enables it.

---

## 2. Information architecture & routes

All recipient routes are scoped by an unguessable edition share token: `/m/[shareToken]`.

### 2.1 Recipient (Mamma)
| Route | Screen | Notes |
|---|---|---|
| `/m/[t]` | Entry gate | Decides: pre-unlock countdown, PIN, or resume |
| `/m/[t]/pehchaan` | PIN entry | 4 digits, big keypad |
| `/m/[t]/janamdin` | Birthday reveal sequence | Occasion module; only once by default, replayable from album |
| `/m/[t]/shubhkamnayein` | Family greetings wall | Approved greetings, ordered |
| `/m/[t]/tohfa` | Gift explanation | Voice note from children introducing the Kitaab |
| `/m/[t]/album` | Home: chapter album | Table of contents as photo-album pages |
| `/m/[t]/adhyay/[chapterKey]` | Chapter opening | Full-bleed title + rangoli draw + chapter photo |
| `/m/[t]/sawaal/[questionKey]` | Question screen | Speak / Write |
| `/m/[t]/chitthiyan` | Letters chapter shortcut | Inland-letter theme |
| `/m/[t]/kitaab` | Her finished book | Read/listen to her own answers |

### 2.2 Contributors (family greetings)
| Route | Screen |
|---|---|
| `/g/[inviteToken]` | Greeting submission: name prefilled, choose text / voice / video / photo, preview, submit |
| `/g/[inviteToken]/shukriya` | Thank-you screen |

### 2.3 Readers (children)
| Route | Screen |
|---|---|
| `/padho/[readerToken]` | Read-only book: chapters, answers, audio players, emotion filter. Sealed items show as closed envelopes with open conditions. |

### 2.4 Admin
Base: `/sunao-admin` (protected; see section 9).
| Route | Purpose |
|---|---|
| `/sunao-admin/login` | Password login |
| `/sunao-admin` | Dashboard: unlock countdown, greetings collected, answers so far, latest activity, "copy next question link for WhatsApp" |
| `/sunao-admin/edition` | Edition settings: title, recipient, address word, occasion, date, unlock time, PIN, theme, language default, reveal toggles |
| `/sunao-admin/people` | Family people CRUD (recipient, children, in-laws, spouse, siblings, parents, alive/deceased, call names, gender, photos) |
| `/sunao-admin/chapters` | Chapter CRUD, reorder (drag or up/down), enable, cover image, motif |
| `/sunao-admin/questions` | Question CRUD per chapter, template editor with live preview of resolved text, weight, emotions, asked-by, sealed default, enable, reorder |
| `/sunao-admin/media` | Upload/manage photos, captions, year, place, people tags, attach to chapter/question/greeting/album |
| `/sunao-admin/greetings` | Invites (create link per person, copy WhatsApp message), moderation (approve/reject/edit text), ordering, featured |
| `/sunao-admin/answers` | All of Mamma's answers: listen, read, download, mark favourite, transcript field (manual), export ZIP/JSON |
| `/sunao-admin/copy` | Edit every UI string (key/value), Roman and Devanagari |
| `/sunao-admin/preview` | "Preview as Mamma" with a **time-travel date** override (simulate before/on/after birthday) |

### 2.5 API surface (route handlers under `src/app/api/ss/**`)
Use **Server Actions** for simple form mutations (admin CRUD, text answers). Use **route handlers** for anything called from client-side media code.

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /api/ss/auth/pin` | none + rate limit | Verify PIN, set recipient cookie |
| `POST /api/ss/upload/sign` | recipient / contributor / admin | Returns presigned R2 `PUT` URL for a given purpose, mime, size |
| `POST /api/ss/recordings` | recipient (or contributor) | Create recording row, returns `recordingId` + key prefix |
| `POST /api/ss/recordings/[id]/chunk` | same | Registers an uploaded chunk (index, key, bytes) |
| `POST /api/ss/recordings/[id]/finalize` | same | Compose chunks into final object, set duration, mark complete |
| `GET /api/ss/media/[id]` | session-scoped | 302 to short-lived presigned R2 `GET` (5 min) |
| `PUT /api/ss/answers/[questionId]` | recipient | Upsert text, language, status |
| `POST /api/ss/answers/[questionId]/seal` | recipient | Set seal (kind, date, person) |
| `POST /api/ss/greetings` | contributor token | Submit greeting |
| `GET /api/ss/admin/export` | admin | ZIP/JSON export |

---

## 3. Data model (Drizzle, SQLite/Turso)

File: `src/features/sunao/db/schema.ts`. If the host project has a single `schema.ts` used by `drizzle.config.ts`, re-export from it. IDs are text (`crypto.randomUUID()`), timestamps are integer epoch ms. JSON columns are `text` with `mode: 'json'`. Every content table (`ss_edition`, `ss_person`, `ss_chapter`, `ss_question`, `ss_greeting`, `ss_invite`, `ss_media`) also has `needs_confirm: json string[]` (field names seeded with a `CONFIRM:` value; see Part 2 section 1) and `admin_edited: integer bool` (set on any admin save, so re-seeding never overwrites edits).

```ts
// Pseudocode-level schema. Implement with drizzle-orm/sqlite-core.

ss_edition {
  id: text pk
  slug: text unique                 // "mamma-birthday-2026"
  title: text                       // "Mamma, Sunao Na"
  recipient_person_id: text fk ss_person
  address_word: text                // "Mamma"
  occasion: text                    // 'birthday' | 'anniversary' | 'mothers_day' | 'none'
  occasion_date: text               // ISO date "YYYY-MM-DD"
  occasion_age: integer null        // age turning, used for candles copy
  timezone: text                    // "Asia/Kolkata"
  unlock_at: integer                // epoch ms; default occasion_date 00:00 IST
  status: text                      // 'draft' | 'published'
  share_token_hash: text            // sha256(base64url token)
  reader_token_hash: text
  pin_hash: text                    // PBKDF2-SHA256, 100k iters, salt
  pin_salt: text
  theme: text                       // 'maa-haldi' (default) | future 'papa-khaki'
  locale_default: text              // 'hinglish' | 'hindi'
  settings: json                    // see 3.1
  created_at, updated_at: integer
}

ss_person {
  id: text pk
  edition_id: text fk
  role: text        // 'recipient'|'child'|'child_in_law'|'spouse'|'sibling'|'parent'|'grandchild'|'relative'|'friend'
  display_name: text            // "Sunny"
  formal_name: text null        // real name if different
  call_name_by_kids: text null  // how children address this person: "Bade Mamaji"
  call_name_by_recipient: text null // how Mamma addresses them: "Bade Bhaiya", "Jiji"
  relation_label: text          // "Mamma ke bade bhai"
  gender: text                  // 'm' | 'f' | 'x' | 'unknown'  (for Hindi verb agreement)
  is_alive: integer (bool)
  birth_order: integer null     // among siblings incl. recipient (1 = eldest)
  is_elder_to_recipient: integer null (bool)
  parent_of_child_id: text null // e.g. Gunjan -> spouse of Sunny via 'spouse_of'
  spouse_of_person_id: text null
  photo_media_id: text null
  notes: text null              // admin-only notes: nicknames, stories to seed follow-ups
  sort: integer
}

ss_chapter {
  id: text pk
  edition_id: text fk
  key: text                     // 'mayka', 'bhai-behen' (unique per edition)
  number: integer               // display number (Adhyay 1..n)
  title: text                   // Roman Hinglish: "Mayka, Wo Ghar"
  title_deva: text              // "मायका, वो घर"
  subtitle: text                // one-line invitation
  life_stage: text              // 'childhood'|'youth'|'marriage'|'motherhood'|'middle'|'now'|'reflection'|'letters'
  motif: text                   // 'rangoli-lotus'|'jaali'|'paisley'|'diya'|'inland-letter'|'kite'|'mango'
  palette: text                 // token key: 'haldi'|'sindoor'|'inland'|'leaf'|'dusk'
  cover_media_id: text null
  enabled: integer bool
  sort: integer
}

ss_question {
  id: text pk
  chapter_id: text fk
  key: text                     // stable key 'mayka.rasoi-khushboo'
  prompt_template: text         // Hinglish with {{vars}} (see Part 2 syntax)
  subprompt_template: text null // the soft nudge under the question
  followups: json string[]      // shown after an answer: "Aur batao…"
  emotions: json string[]       // ['yaadein','khushi',...]
  weight: text                  // 'light' | 'medium' | 'heavy'  (heavy => gate)
  asked_by: json string[]       // person ids or ['hum'] (all children)
  condition: text null          // expression, see Part 2
  for_each: text null           // generator expression, see Part 2
  generated_from: text null     // parent template key if expanded
  sealed_default: integer bool
  media_id: text null           // optional photo shown above question ("Ye photo yaad hai?")
  enabled: integer bool
  sort: integer
}

ss_answer {
  id: text pk
  edition_id: text fk
  question_id: text fk
  status: text                  // 'draft'|'kept'|'skipped'|'not_today'
  text: text null
  language_hint: text null      // 'hinglish'|'hindi'|'punjabi'|...
  is_favourite: integer bool    // admin-side
  transcript: text null         // admin manual or future STT
  updated_at, created_at
}

ss_recording {
  id: text pk
  edition_id: text fk
  owner_type: text              // 'answer' | 'greeting' | 'intro'
  owner_id: text
  take: integer                 // 1..n, re-records increment
  segment: integer              // 'Aur batana hai' appends segment within a take
  is_active: integer bool       // false for hidden earlier takes (never deleted)
  mime: text                    // 'audio/webm;codecs=opus' | 'audio/mp4'
  r2_key: text null             // final composed object
  chunk_prefix: text            // 'ed/{edition}/rec/{id}/chunk-'
  chunk_count: integer
  bytes: integer
  duration_ms: integer
  status: text                  // 'recording'|'uploading'|'complete'|'failed'
  created_at, updated_at
}

ss_seal {
  answer_id: text pk fk
  kind: text                    // 'date' | 'event' | 'after_me' | 'person'
  open_on: text null            // ISO date for 'date'
  event_label: text null        // "Mickey ki shaadi pe kholna"
  for_person_id: text null
  opened_at: integer null       // admin marks opened
}

ss_media {
  id: text pk
  edition_id: text fk
  kind: text                    // 'image'|'audio'|'video'
  r2_key: text                  // original or 'large' variant
  r2_key_thumb: text null       // 600px webp
  mime, bytes, width, height, duration_ms
  dominant_color: text null     // hex, for placeholder bg
  caption: text null            // Hinglish caption
  year_approx: text null        // "1984", "80s"
  place: text null              // "Chandni Chowk, Delhi"
  people: json string[]         // person ids
  alt_text: text                // REQUIRED for images (accessibility)
  uploaded_by: text             // 'admin'|'contributor'|'recipient'
  created_at
}

ss_media_link {
  id: text pk
  media_id: text fk
  target_type: text             // 'chapter'|'question'|'greeting'|'reveal'|'album_cover'|'tribute'
  target_id: text
  sort: integer
}

ss_greeting {
  id: text pk
  edition_id: text fk
  invite_id: text null fk
  from_person_id: text null
  from_name: text               // "Bade Mamaji"
  relation_label: text          // "Mamma ke bade bhai"
  text: text null
  memory_text: text null        // "Ek yaad Mamma ke saath" (prompted separately)
  recording_id: text null       // voice
  video_media_id: text null
  photo_media_ids: json string[]
  status: text                  // 'pending'|'approved'|'rejected'
  placement: text               // 'wall' (birthday greetings) | 'tribute' (memories of departed family, shown only inside the gated 'yaadon-mein' chapter)
  featured: integer bool        // big card
  play_in_reveal: integer bool  // included in reveal montage
  sort: integer
  created_at
}

ss_invite {
  id: text pk
  edition_id: text fk
  token_hash: text
  for_person_id: text null
  label: text                   // "Bade Mamaji"
  prompt_override: text null    // custom ask for this person
  max_submissions: integer      // default 3
  submissions: integer
  expires_at: integer           // default unlock_at - 1h
}

ss_copy {
  edition_id: text
  key: text                     // 'cta.begin', 'answer.saved' ...
  value: text
  value_deva: text null
  pk(edition_id, key)
}

ss_activity {                   // lightweight, admin dashboard only
  id: text pk, edition_id, actor: 'recipient'|'contributor'|'admin',
  type: text                    // 'opened'|'answered'|'recorded'|'sealed'|'greeting_submitted'
  ref_id: text null, at: integer
}

ss_auth_attempt {               // PIN brute-force protection
  key: text pk                  // edition_id + ip hash
  count: integer, window_start: integer, locked_until: integer null
}
```

### 3.1 `ss_edition.settings` JSON
```json
{
  "reveal": {
    "enabled": true,
    "playOncePerDevice": true,
    "diyaIntro": true,
    "cake": { "enabled": true, "candles": "age|symbolic", "symbolicCount": 7, "blowToExtinguish": true },
    "montage": { "enabled": true, "maxSeconds": 90 },
    "tributeOnReveal": false
  },
  "greetings": { "enabled": true, "showBeforeKitaab": true, "allowVideo": true, "maxVideoSeconds": 60, "maxAudioSeconds": 180 },
  "kitaab": { "suggestedStartChapter": "shuruaat", "showAskedBy": true, "followupsEnabled": true, "unlockAllChapters": true },
  "recording": { "segmentMaxSeconds": 600, "chunkSeconds": 10, "silenceNudgeSeconds": 8, "bitrate": 48000 },
  "privacy": { "readerSeesUnsealedOnly": true, "noindex": true },
  "pwa": { "promptInstallAfterAnswers": 3 }
}
```

### 3.2 R2 key layout
```
ed/{editionId}/media/{mediaId}/large.webp
ed/{editionId}/media/{mediaId}/thumb.webp
ed/{editionId}/media/{mediaId}/original.{ext}        (optional)
ed/{editionId}/rec/{recordingId}/chunk-0001.{webm|mp4}
ed/{editionId}/rec/{recordingId}/final.{webm|m4a}
ed/{editionId}/greet/{greetingId}/video.{webm|mp4}
ed/{editionId}/export/{timestamp}.zip
```

---

## 4. Environment & infrastructure

### 4.1 Env vars (`.env.local`, and Vercel project env)
| Var | Purpose |
|---|---|
| `SS_DATABASE_URL` | Turso URL (`libsql://...`) or `file:./sunao.db` locally |
| `SS_DATABASE_AUTH_TOKEN` | Turso token |
| `SS_ADMIN_PASSWORD` | Admin login password (long) |
| `SS_SESSION_SECRET` | HMAC secret for recipient/admin/contributor cookies (32+ random bytes) |
| `SS_APP_URL` | Public base URL, used for WhatsApp links and OG tags |
| `R2_ACCOUNT_ID` | Cloudflare account id |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 API token scoped to one bucket, Object Read & Write |
| `R2_BUCKET` | e.g. `sunao-media` |

Never expose R2 credentials to the client. Never commit `.env*`.

### 4.2 R2 bucket
- **Private** bucket (no public access, no r2.dev URL).
- CORS policy (allow direct browser PUT/GET from app origin only):
```json
[
  {
    "AllowedOrigins": ["https://<SS_APP_URL host>", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["content-type", "content-length"],
    "ExposeHeaders": ["etag"],
    "MaxAgeSeconds": 3600
  }
]
```
- Presigned PUT TTL: 10 min. Presigned GET TTL: 5 min. Endpoint: `https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com/{bucket}/{key}`, region `auto`, service `s3`.
- Server validates on sign: purpose, mime allowlist (`image/webp`, `image/jpeg`, `image/png`, `audio/webm`, `audio/mp4`, `video/webm`, `video/mp4`), max bytes (image 8MB, audio chunk 2MB, video 60MB), and that the key belongs to the caller's edition.

### 4.3 Vercel
- Separate Vercel account/project. Node runtime for route handlers that compose audio (not Edge).
- Media never passes through Vercel functions except chunk **composition** (fetch chunks from R2, concatenate, PUT final). A 10-minute opus segment at 48kbps is ~3.6MB, safe in memory.
- `next.config.ts`: add headers for the sunao routes:
  - `Permissions-Policy: microphone=(self), camera=(self)`
  - `X-Robots-Tag: noindex, nofollow`
  - `Referrer-Policy: no-referrer` (tokens live in URLs)
- `robots.txt`: disallow `/m/`, `/g/`, `/padho/`, `/sunao-admin`.

### 4.4 Local dev
- `SS_DATABASE_URL=file:./sunao.db`, run Drizzle push/migrate, then the seed script `scripts/sunao-seed.ts` (reads the seed payload from Part 3, stored as `src/features/sunao/seed/mamma-birthday.json`).
- Microphone needs a secure context: localhost works; for phone testing use a tunnel with HTTPS.

---

## 5. Visual design system

### 5.1 Concept
An old **family photo album** that meets an **inland letter**, lit by a **diya** on a late Delhi afternoon. Elegant and restrained, never kitsch. Indian motifs are used as **thin line art at low opacity**, not as loud decoration.

### 5.2 Color tokens (theme `maa-haldi`)
Define in `src/features/sunao/styles/tokens.css` and map to Tailwind 4 via `@theme`.

| Token | Hex | Use |
|---|---|---|
| `--ss-paper` | `#F6EFE3` | Base background (album paper) |
| `--ss-paper-deep` | `#EDE1CC` | Cards, album page |
| `--ss-paper-edge` | `#E2D3B8` | Borders, photo corners |
| `--ss-ink` | `#2A2018` | Primary text (contrast ≥ 12:1 on paper) |
| `--ss-ink-soft` | `#5B4A3A` | Secondary text (≥ 7:1) |
| `--ss-ink-faint` | `#8A7764` | Hints, timer (use ≥ 18px only) |
| `--ss-haldi` | `#E0A526` | Accent, highlights, diya glow |
| `--ss-marigold` | `#E5822A` | Primary buttons, petals |
| `--ss-sindoor` | `#A8261C` | Rare emphasis: wax seal, mauli thread |
| `--ss-inland` | `#A7C3D6` | Letters chapter background |
| `--ss-inland-ink` | `#1F3A52` | Text on inland |
| `--ss-leaf` | `#5E7D4F` | Success ticks, mango-leaf toran |
| `--ss-gold` | `#B48C3A` | Foil title on final album cover |
| `--ss-night` | `#1A1410` | Reveal screen background |
| `--ss-flame-core` | `#FFF4C2` | Diya flame core |
| `--ss-flame-outer` | `#F2A93B` | Diya flame outer |

Contrast rule: body text only in `ink` or `ink-soft`. Buttons: marigold background with `ink` text (verify ≥ 4.5:1), or ink background with paper text.

### 5.3 Texture
- Paper grain: an inline SVG `feTurbulence` noise at 4–6% opacity, fixed, `pointer-events: none`. Single element, not per card.
- Handloom weave: subtle repeating SVG pattern on album page margins only.
- Photo corners: 4 small triangular SVG mounts in `paper-edge` with a soft shadow.
- Foxing spots: 3–5 faint brown radial gradients at random positions on the album cover only.

### 5.4 Typography
Load via `next/font/google`, `display: 'swap'`, subset `latin` + `devanagari`.
| Role | Font | Size (mobile) | Notes |
|---|---|---|---|
| Question | **Fraunces** (opsz, soft) | 30–34px, line-height 1.3 | max 22ch per line |
| Sub-prompt | Fraunces italic | 20px | `ink-soft` |
| UI / body | **Mukta** (Latin + Devanagari) | 20px base, 18px minimum | |
| Devanagari display | **Tiro Devanagari Hindi** | 34–40px | line-height 1.5 (Devanagari needs room) |
| Handwritten notes | **Kalam** (Latin + Devanagari) | 22–26px | Only for children's notes & greetings |
| Chapter number | Fraunces small caps | 14px, letter-spacing .2em | "ADHYAY 3" |

Respect OS font scaling: use `rem`, never lock `font-size` in px on `html`.

### 5.5 Motif library (SVG components, stroke only)
`src/features/sunao/components/motifs/`:
- `RangoliLotus`, `RangoliStar`: drawn via `stroke-dasharray` animation on chapter open.
- `Jaali`: lattice used as subtle window-light overlay.
- `Toran`: mango-leaf + marigold string across the top of the album home.
- `Diya`: the record button (section 7).
- `InlandLetter`: three-fold letter used in invitation & Chitthiyan.
- `WaxSeal`, `MauliThread`: seal UI.
- `Kite` (patang), `Mango`, `Matka`: small spot illustrations for childhood chapters.
- `Petal`: marigold petal for the save animation.
All motifs accept `className`, `strokeWidth`, `animate?: boolean`, and are `aria-hidden="true"`.

### 5.6 Layout
- Mobile first, single column, max content width 34rem, generous vertical rhythm (8px scale: 8/16/24/40/64/96).
- Safe-area insets respected (`env(safe-area-inset-*)`).
- Primary actions in the bottom third (thumb zone), min 56px tall, full width on mobile.
- No horizontal scrolling anywhere except the greetings wall carousel (also navigable by buttons).

---

## 6. Motion system

### 6.1 Tokens
```css
--ss-ease-soft: cubic-bezier(.22,.61,.36,1);   /* default ease-out */
--ss-ease-breath: cubic-bezier(.45,0,.55,1);    /* in-out, for loops */
--ss-ease-settle: cubic-bezier(.16,1,.3,1);     /* petals landing */
--ss-d-quick: 240ms;    /* taps, toggles */
--ss-d-base: 600ms;     /* fades, small moves */
--ss-d-slow: 900ms;     /* page turns */
--ss-d-story: 1400ms;   /* chapter reveals */
--ss-d-breath: 4000ms;  /* idle glow loop */
--ss-stagger-word: 45ms;
```
Rules: no bounce, no overshoot springs, no shake. Movement distances are small (8–24px). Opacity carries most of the motion.

### 6.2 Moments
| Moment | Spec |
|---|---|
| **Invitation letter unfold** | Inland letter SVG with 3 panels; panels rotate on X (`perspective: 900px`) from 180°→0° sequentially, 700ms each, `ease-soft`, 150ms overlap. Then handwriting text fades in line by line (300ms per line). |
| **Question text reveal** | Split prompt into words (keep punctuation attached). Each word: `opacity 0→1`, `translateY 6px→0`, `filter blur(2px)→0`, 600ms, stagger 45ms. Sub-prompt fades in 400ms after the last word. Total capped at 2.2s; if longer, increase grouping (2 words per span). |
| **Question → next question** | `<ViewTransition>` page-turn: old content `opacity 1→0`, `translateY 0→-16px`, 500ms; new content enters after 150ms with word reveal. A soft paper-shadow gradient sweeps left→right across the screen over 900ms (pseudo-element in `::view-transition-new`). Navigation must be wrapped in `startTransition` so the transition fires. |
| **Chapter opening** | Screen fades to the chapter palette over 600ms. Chapter number fades in, then title in Fraunces + Devanagari below. Rangoli motif strokes draw (`stroke-dashoffset` length→0) over 1400ms behind the title. Chapter cover photo fades in with photo corners last. Tap anywhere or "Shuru karein" to continue; auto-advance never. |
| **Save ("Sambhaal liya")** | A marigold petal SVG appears at the button, drifts down along a gentle S-curve (Web Animations API keyframes, 1600ms, `ease-settle`), rotates 0→140°, and lands in a small bowl icon/the album corner. A leaf-green tick + "Sambhaal liya" fades in for 1.6s. A soft haptic on Android (`navigator.vibrate(12)`). |
| **Album home** | Toran sways ±1.5° on a 6s `ease-breath` loop. Answered questions show a pressed marigold; newly answered one blooms (scale .6→1, 600ms) the first time you return. |
| **Background dust** | 12–18 tiny circles in a fixed canvas-free SVG layer, drifting upward 20–40px over 12–20s, opacity 0→.35→0. Disabled when reduced motion or low battery (`navigator.getBattery` if available, else ignore). |
| **Sealing a letter** | Letter folds (3 panels, reverse of unfold), mauli thread wraps (stroke draw 800ms), wax seal stamps (scale 1.15→1, opacity 0→1, 300ms, then a 1px settle). |
| **Final album close** | When all enabled chapters have ≥1 kept answer (or from `/kitaab`): pages stack (translateZ/rotate tiny offsets), cover closes, gold foil title `"{recipient} ki Kahani"` shimmers once (gradient sweep 1.2s). Plays once; replayable. |

### 6.3 Reduced motion
`@media (prefers-reduced-motion: reduce)`: replace everything with 200ms opacity fades; no word stagger; no dust; no petal flight (tick only); diya flame stays static with a gentle opacity pulse only if the user is recording (essential feedback). Also expose a "Kam animation" toggle in the album settings sheet (stored in localStorage).

### 6.4 Performance budgets
- Animate only `opacity`, `transform`, `filter: blur` (small), `stroke-dashoffset`.
- 60fps target on a mid-range Android (Redmi Note class). Test with 4× CPU throttle.
- JS for the recipient route under 150KB gzipped (excluding fonts). Fonts: preload only Fraunces + Mukta; Devanagari display and Kalam loaded on demand.

---

## 7. Record button: the Diya

### 7.1 States
```
idle ──tap──▶ permission_explain ──allow──▶ arming ──▶ recording ⇄ paused
                         │                                │
                       denied ──▶ denied_help             tap "Bas"
                                                          ▼
                                                   finalizing ──▶ review
                                                                  │  │  │
                                                    "Rakh lo" ◀───┘  │  └──▶ "Phir se bolun?" (new take)
                                                                     └──▶ "Aur batana hai" (new segment, same take)
```

| State | Visual | Copy (from `ss_copy`) |
|---|---|---|
| `idle` | Unlit clay diya (96px), haldi radial glow behind it breathing 0.25→0.45 opacity over 4s | Label under: "Bol ke batayein" |
| `permission_explain` (first time only, before browser prompt) | Sheet with large text and a diya illustration | "Phone aapse puchega ki aawaz sun sakta hai kya. 'Allow' dabaiye, taaki main aapki aawaz sambhaal sakun." Button: "Theek hai" |
| `denied_help` | Calm sheet with illustrated steps per OS (detect iOS/Android) | "Koi baat nahi. Settings mein jaake microphone allow kar dijiye, ya likh ke bhi bata sakti hain." Buttons: "Kaise karein?", "Likh ke batayein" |
| `arming` | Flame ignites: core scales 0→1 with a 3-frame flicker over 500ms | none |
| `recording` | Flame height/sway driven by voice level (see 7.2). Screen vignette darkens 15% (warm, not black). Small timer below in `ink-faint`, mm:ss | Button labels: "Ruko" (pause), "Bas" (stop) |
| `paused` | Flame shrinks to an ember, slow pulse | "Ruki hui hai. Jab mann ho, aage boliye." Button: "Aage bolein" |
| silence ≥ 8s while recording | Recording continues; a line fades in for 4s | "Aaram se, Mamma… koi jaldi nahi." |
| `finalizing` | Ember glows; tiny progress ring if network pending | "Sambhaal rahe hain…" |
| `review` | Ember next to a play button + organic waveform (ink brush style, not bars), duration | "Rakh lo", "Aur batana hai", "Phir se bolun?" |
| offline during record | Small cloud-with-check icon, never blocking | "Net thoda slow hai, aapki aawaz phone mein safe hai." |

Accessibility: the diya is a real `<button>` with `aria-pressed` and an `aria-label` that changes ("Recording shuru karein" / "Recording rokein"). State changes are announced via an `aria-live="polite"` region. Spacebar/Enter toggle. Tap only, never hold.

### 7.2 Voice-reactive flame
- Web Audio: `AudioContext` → `MediaStreamSource` → `AnalyserNode` (`fftSize 1024`, `smoothingTimeConstant 0.8`).
- Each animation frame: compute RMS of time-domain data → `level` 0..1 (map with `clamp((rms - 0.01) / 0.15, 0, 1)` then ease with a low-pass `lvl = lvl*0.85 + target*0.15`).
- Flame SVG path is 2 layered teardrop paths (outer flame-outer, inner flame-core). Apply `transform: scaleY(1 + lvl*0.6) scaleX(1 - lvl*0.1) rotate(sin(t)*2*lvl deg)` with transform-origin at the wick; glow radius `24px + lvl*40px`.
- Update via CSS custom properties on the element (`--lvl`) to avoid React re-renders. Use `requestAnimationFrame`; stop when not recording.

### 7.3 Recording pipeline (must not lose audio)
1. `getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })`.
2. MIME selection: first supported of `audio/webm;codecs=opus`, `audio/mp4;codecs=mp4a.40.2`, `audio/mp4`. Store chosen mime on the recording row.
3. `new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 48000 })`, `start(10_000)` (10s timeslice).
4. On each `dataavailable`:
   - Write chunk to IndexedDB store `ss-chunks` keyed `[recordingId, index]` **first**.
   - Then request presigned PUT, upload, call `/chunk` to register. On success mark chunk `uploaded` in IDB.
   - Upload queue is sequential with exponential backoff (1s, 2s, 4s… max 30s), resumes on `online` event and on next app open.
5. Segment cap 10 min: at 9:30 show a gentle line "Thoda saans le lijiye, phir aage bolte hain"; at 10:00 auto-finalize this segment and immediately start a new segment of the same take (seamless; the user sees one continuous recording).
6. On stop → `finalize`: server lists registered chunks in order, fetches from R2, concatenates bytes (valid for a single MediaRecorder session: the first chunk carries headers), PUTs `final.{ext}`, sets `duration_ms` (client-reported, server-sanity-checked), status `complete`. Chunk objects are kept for 7 days then a cleanup job may delete them (optional cron; never delete before final exists).
7. Review playback uses the local Blob immediately (no wait for network).
8. Wake lock: request `navigator.wakeLock.request('screen')` during recording when supported; release after.
9. Page hide / tab close mid-recording: on `visibilitychange` to hidden call `recorder.requestData()`; on next open, any recording with status `recording` and IDB chunks gets finalized with what exists, and the question shows "Aapki pichhli recording sambhaal li gayi hai."
10. Re-record ("Phir se bolun?") creates `take+1`; the previous take gets `is_active=false` but is **never deleted** (admin can see all takes).

### 7.4 Write mode
- Large `textarea` (20px, line-height 1.6), autogrow, `lang="hi-Latn"`, `autocapitalize="sentences"`, spellcheck off (Hinglish triggers red lines).
- Placeholder: "Yahan likhiye… jis bhasha mein dil kare."
- Autosave debounced 800ms to server + mirror to localStorage immediately. Subtle "Sambhal raha hai…" / "Sambhaal liya" status.
- Hint button "Bolke likhiye" explaining the phone keyboard's mic key (Gboard/iOS dictation), since many mothers prefer dictation.
- Both modes can coexist on one answer (voice + a written line).

---

## 8. Screen-by-screen specification (recipient)

### 8.1 Entry gate `/m/[t]`
- Resolve edition by `sha256(t)`. Unknown → gentle 404 ("Ye pata sahi nahi lag raha.").
- If `now < unlock_at` (with admin preview override): **Countdown screen**: night background, single unlit diya, "Kuch khaas aapka intezaar kar raha hai…", days/hours in large Fraunces numerals. No content leaks. Tip: children should send the link on the day, but this protects early opens.
- If no recipient cookie → `/pehchaan`.
- If cookie and reveal not yet played on this device → `/janamdin`. Else → `/album` (resume last question if mid-answer: "Wahi se shuru karein?").

### 8.2 PIN `/pehchaan`
- Copy: "Apna khaas number daaliye" + hint configured by admin (e.g. "Sunny ka janamdin, DDMM").
- Custom 3×4 keypad, 72px keys, digits in Fraunces. Dots fill with marigold.
- Wrong: dots shake **horizontally 4px once** (exception to no-shake, very small) + "Ek baar phir try kijiye". After 5 wrong in 15 min: lock 15 min, copy "Thodi der baad try kijiye, ya Sunny ko call kar lijiye."
- Success: HttpOnly cookie `ss_r` (HMAC-signed `{editionId, iat}`), 180 days, `Secure`, `SameSite=Lax`, path `/m/`.

### 8.3 Birthday reveal `/janamdin` (occasion module `birthday`)
A guided, tap-paced sequence. Each beat waits for a tap except where noted. Includes a small "Aage" skip link at the bottom from beat 3 onward.

| Beat | What happens | Copy |
|---|---|---|
| 1. Andhera | Night screen, dust motes, single unlit diya centre | "Mamma, ek diya jalaiye" + "Tap kariye" |
| 2. Roshni | Tap → diya lights (ignite animation), warm light radiates and the screen gradually turns to paper over 2.4s. **This tap also unlocks audio autoplay.** | none |
| 3. Pehli awaaz | Optional: the children's intro audio plays (Sunny + Mickey + Gunjan together, 10–20s) with handwritten lines appearing | e.g. "Happy Birthday Mamma!" (Kalam) |
| 4. Cake | Illustrated cake (SVG, flat, elegant: cream frosting, marigold piping) with candles (`age` or `symbolic` count; symbolic recommended, e.g. 1 per family member). Flames flicker. | "Ab candles bujhaiye… phoonk maariye!" + small link "Ya yahan tap kariye" |
| 5. Phoonk | **Blow detection** (also primes mic permission for later, with permission explain sheet first): sustained high RMS (> 0.35 normalized) with energy concentrated < 1.5kHz for ≥ 250ms ⇒ blow. Extinguish candles left→right, 120ms apart, tiny smoke wisps (SVG path fade-up). Fallback: each tap extinguishes one candle. If mic denied: tap mode silently. | none |
| 6. Mubarak | Marigold petal shower (30–40 petals, WAAPI, 3s, then settle and fade). Title in Tiro Devanagari "जन्मदिन मुबारक हो, Mamma" and Roman below. | "Janamdin mubarak ho, Mamma" |
| 7. Montage (optional) | Auto-plays a sequence of `play_in_reveal` greeting voice clips (each 5–10s excerpt or full if short) with the sender's photo + name card crossfading, max 90s total. Pause/next controls. | "Sabne aapke liye kuch kaha hai…" |
| 8. Next | Button to greetings wall | "Sabki shubhkamnayein dekhein" |

Set `localStorage['ss_reveal_done:{editionId}']=1` and log activity. Replay available from album menu ("Janamdin phir se dekhein").

### 8.4 Greetings wall `/shubhkamnayein`
- Vertical stack of **album cards**, one per greeting, ordered by `sort` (admin sets order; recommended spouse → children → in-laws → siblings → grandkids → extended → friends).
- Card anatomy: photo with corners (sender's photo or attached photo), name in Fraunces, relation label in small caps, message in Kalam (handwritten feel), voice play button (small diya-ember play icon + duration), video thumbnail (tap → full-screen Radix Dialog player with captions if provided), optional "Ek yaad" memory block in a slightly indented style.
- Featured greetings render larger (full-bleed photo).
- Audio players: only one plays at a time (zustand store).
- End of wall: "Aur ab, ek aur tohfa…" → `/tohfa`.

### 8.5 Gift explanation `/tohfa`
- Inland letter unfolds (section 6.2) with the children's handwritten note and an optional voice note.
- Explains the Kitaab in 3 short lines: "Ye aapki kitaab hai. Isme humne aapse kuch sawaal poochhe hain. Jab mann ho, ek sawaal ka jawab dijiye: bol ke ya likh ke."
- Button: "Kitaab kholiye" → `/album`.

### 8.6 Album home `/album`
- Top: toran motif + title `"{address_word}, Sunao Na"` + small date line.
- "Aaj ka sawaal" card: suggested next unanswered question (first enabled, non-heavy, in order; heavy ones never suggested). One big button "Jawab dein".
- Chapters as album pages (2-up grid on wide screens, 1-up on mobile): cover photo with corners, Adhyay number, title, Devanagari title, a row of tiny marigold dots (filled = kept answers). No numbers, no percentages.
- Menu sheet (Radix Dialog, bottom sheet style): "Janamdin phir se dekhein", "Sabki shubhkamnayein", "Meri kitaab", "Kam animation", "Hindi mein dikhayein" toggle, "Madad chahiye? Sunny ko call karein" (tel: link from admin settings).

### 8.7 Chapter opening `/adhyay/[key]`
Per section 6.2. Below the title: a list of the chapter's questions as short Hinglish lines (first 6 words + "…"), each with its state (blank / petal / "Aaj nahi" muted). Heavy ones show a small feather icon and no preview text ("Ek thoda bhaari sawaal").

### 8.8 Question screen `/sawaal/[key]`
Layout top→bottom:
1. Back (to chapter) + chapter label "Adhyay 2 · Mayka".
2. Optional linked photo (`media_id`) with corners: "Ye photo yaad hai?".
3. **Asked-by line** (if `showAskedBy`): small caps, e.g. "SUNNY POOCHH RAHA HAI" or "SUNNY AUR MICKEY POOCHH RAHE HAIN" (gender agreement via helpers, see Part 2).
4. **Question** (word reveal).
5. Sub-prompt (italic).
6. Mode chooser (first visit to the question): two stacked large buttons: **"Bol ke batayein"** (primary, with diya icon) and **"Likh ke batayein"** (secondary). Remember last used mode globally.
7. Recorder or text area.
8. Footer: "Baad mein" (skip, go to next), "Aaj nahi, Mamma" (mark `not_today`, hidden from suggestions until she revisits).
9. After "Rakh lo"/text kept: save animation, then optional follow-up card (if `followups` exist and `followupsEnabled`): "Aur batao… {followup}" with "Haan, batati hoon" (adds a segment/text) or "Aage chalein".
10. Sealable questions (chapter Chitthiyan or `sealed_default`): after keeping, a sheet "Isse band lifafe mein rakhein?" with options: "Kisi khaas din kholna" (date picker, big), "Kisi khaas mauke pe" (text field, suggestions from admin: "Mickey ki shaadi pe", "Pehle pote/poti ke liye"), "Sirf {person} ke liye", "Mere baad", "Nahi, khula rakhein". For `sealed_default` questions the sheet opens automatically, but **nothing is pre-selected**; Mamma always chooses explicitly. If she dismisses the sheet, the answer stays unsealed (open to readers) only after a confirm: "Ye sab padh payenge. Theek hai?"

**Heavy gate:** before rendering a `heavy` question: full-screen soft card with a feather motif: "Ye sawaal thoda bhaari hai, Mamma. Abhi baat karein?" Buttons: "Haan" / "Phir kabhi". "Phir kabhi" returns to the chapter without marking anything.

### 8.9 Chitthiyan `/chitthiyan`
Same as a chapter but in the inland palette, each question presented as a blank inland letter. Sealed answers show wax seal + mauli thread + the open condition in Kalam.

### 8.10 Her book `/kitaab`
- Chapters with her kept answers: text in Fraunces, recordings as ember players, linked photos. Sealed ones show the sealed envelope (she can open her own).
- Final album-close animation available here.

---

## 9. Auth, privacy & security

| Surface | Mechanism |
|---|---|
| Recipient | Unguessable share token in URL (32 bytes, base64url, stored hashed) **plus** 4-digit PIN (PBKDF2, rate limited per edition+IP: 5 per 15 min). Signed cookie 180 days. |
| Contributor | Per-person invite token (24 bytes), stored hashed, expires before unlock, max submissions 3. No login. Can only create greetings and upload media for that greeting. |
| Reader | Separate reader token (32 bytes) + optional PIN. Read-only. Respects seals: sealed answers never sent to the client until `opened_at` set or `open_on` passed. |
| Admin | Password from `SS_ADMIN_PASSWORD`, HMAC-signed cookie `ss_admin` (follow the host project's existing admin cookie pattern if present), 7-day expiry, rate-limited login. Optimistic check in `proxy.ts` for `/sunao-admin/*`, **real check in every server action and route handler** (per Next 16 auth guide). |

Additional:
- All tokens compared via hash lookup; never log raw tokens.
- Presigned URLs are scoped to the caller's edition and purpose; server derives the key, never trusts a client-supplied key.
- Seal enforcement is server-side.
- `noindex` everywhere; `Referrer-Policy: no-referrer`.
- No third-party analytics, fonts are self-hosted by `next/font`.
- **Flag to the owner:** anyone with the link and PIN can hear everything. Share the link only with Mamma; use separate reader links for the children.

---

## 10. Admin view

Use the host project's admin visual style if one exists (simple, functional). It doesn't need the artistic treatment, but must be fast and clear.

### 10.1 Dashboard
- Countdown to unlock (or "Live since …").
- Cards: greetings collected (approved / pending), invites sent vs submitted, answers kept, minutes of audio, last activity ("Mamma ne 2 ghante pehle 'Nani ki rasoi' ka jawab diya").
- **WhatsApp helpers:** buttons that copy ready-made messages:
  - Recipient gift message (with link + PIN hint, not the PIN itself).
  - Contributor invite per person.
  - "Next question" nudge: "Mamma, aaj ka sawaal: {question}. {deep link}".

### 10.2 Edition settings
All fields of `ss_edition` + settings JSON as a form (toggles, numbers). PIN set/reset (write-only). Regenerate tokens (with warning: old links stop working).

### 10.3 People
Table + edit drawer. Fields per `ss_person`. Show a small family tree preview (recipient centre; parents above; siblings sideways with alive/deceased marker (a small diya for deceased); spouse; children & in-laws below).

### 10.4 Chapters & Questions
- Chapter list with drag/up-down reorder, enable toggle, cover picker.
- Question editor:
  - Template field with variable autocomplete (`{{` triggers list of available variables from Part 2).
  - **Live preview** of the resolved text using current people data, including gender agreement; shows errors for unknown variables.
  - Weight, emotions (multi-select chips), asked-by (multi-select people or "hum"), condition, for_each (advanced), sealed default, linked photo, follow-ups (list editor).
  - "Generate from template" for `for_each` questions: shows expanded questions as child rows that can be individually edited/disabled.
- Bulk import/export JSON (same format as Part 2 question bank).

### 10.5 Media
- Multi-file upload. **Client-side processing before upload:** decode → apply EXIF orientation → resize to `large` (max 2000px long edge, webp q=0.82) and `thumb` (600px, webp q=0.75) via `<canvas>` / `OffscreenCanvas` → compute dominant color (average of 16×16 downscale) → upload both via presigned PUT.
- Required: alt text. Optional: caption, year, place, people tags.
- Attach to: album cover, chapter cover, question, greeting, reveal montage, tribute.
- Photo slots view: shows the shot list from Part 3 with empty/filled state.

### 10.6 Greetings
- Create invites per person (from People or ad-hoc name), with optional custom prompt; copy WhatsApp message.
- Moderation queue: play/view, edit text typos, approve/reject, toggle featured/play-in-reveal, reorder.
- Admin can also create a greeting directly (e.g. for an elder who sends a voice note on WhatsApp: upload the file).

### 10.7 Answers
- Grouped by chapter. Play all takes (active highlighted), read text, add transcript, favourite, see seal info (admin sees sealed content only behind a "Main samajhta/samajhti hoon ki ye band lifafa hai" confirmation; logged).
- Export: JSON (all text + metadata) and ZIP (audio finals + images + `book.html` static reader) generated server-side and stored to R2 export key, download via presigned GET.

### 10.8 Copy
Key/value table with Roman and Devanagari columns, searchable, with "reset to default". Default keys listed in Part 3.

### 10.9 Preview as Mamma
Opens recipient routes in an iframe/new tab with an admin-only `ss_preview` cookie that: bypasses PIN, allows a `simulateNow` date, never writes real answers (writes to a throwaway preview namespace or no-ops with a banner "Preview: kuch save nahi hoga").

---

## 11. Contributor greeting flow `/g/[inviteToken]`

1. Welcome card (paper style, lighter treatment): "Mamma ke janamdin ke liye kuch kahiye 🌼", sender name prefilled (editable), relation label.
2. Prompt (from invite `prompt_override` or default): "Mamma ke liye ek shubhkamna, aur agar ho sake toh unke saath ki ek pyaari yaad."
3. Choose any combination:
   - **Likhein:** message textarea + optional "Ek yaad" textarea.
   - **Bolein:** same diya recorder (max 3 min).
   - **Video:** `<input type="file" accept="video/*" capture="user">` (max 60s / 60MB; show duration check client-side); no in-browser video recording needed.
   - **Photo:** up to 5 images (client-side resize like admin).
4. Preview → "Bhej dijiye". Thank-you screen: "Shukriya! Mamma ko {date} ko ye milega. Ye raaz hai 🤫".
5. Constraints: works on WhatsApp in-app browser (test), and if the in-app browser blocks mic, show "Chrome/Safari mein kholiye" helper with copy-link.

---

## 12. Copy & language system

- All UI strings live in `ss_copy` with defaults in `src/features/sunao/copy/defaults.ts` (seeded). Components call `t('key', vars)`.
- Language toggle: Hinglish (Roman) default; Hindi (Devanagari) uses `value_deva` where provided, else falls back to Roman.
- Voice & tone rules (enforce in reviews):
  - Always "aap", never "tum" when addressing Mamma.
  - Address word `{{addressWord}}` used at most once per screen.
  - No English tech words in recipient UI: no "upload", "submit", "error", "save", "record", "login". Use: "bhejna", "sambhaalna", "bolna", "kholna".
  - Short sentences. Warm, a little playful, never sugary.
  - Never mention death bluntly. Use "yaadon mein", "jo ab saath nahi hain", "{{name}} ki yaad".
- Hindi gender agreement handled by template helpers (Part 2).

---

## 13. Accessibility & elder-friendliness checklist
- Base text 20px; minimum 18px; question 30px+.
- Touch targets ≥ 56px; spacing between targets ≥ 12px.
- Contrast ≥ 7:1 for body text (AAA-ish target), ≥ 4.5:1 minimum anywhere.
- No hold/drag gestures required. No timeouts that lose state.
- Every image has alt text; decorative motifs `aria-hidden`.
- Focus visible (2px marigold outline offset 3px).
- Screen-reader labels in Hinglish; `lang` attributes (`hi-Latn` for Hinglish, `hi` for Devanagari).
- Works with OS font size at 130%.
- Reduced motion respected + manual toggle.
- Full validation requires manual testing with real assistive tech and, most importantly, a session with the actual recipient.

---

## 14. PWA (light)
- `manifest.webmanifest` for the recipient scope `/m/`: name "Mamma, Sunao Na", theme `#F6EFE3`, icon = diya on paper.
- After 3 kept answers, a one-time card: "Isse apne phone ki home screen pe lagaiye, taaki roz aasaani se khul sake" with OS-specific steps. No web push notifications (children nudge via WhatsApp).

---

## 15. Implementation phases (for the agent)

| Phase | Deliverable | Done when |
|---|---|---|
| 1. Foundation | Folder structure, env, Drizzle schema + migration, R2 client (aws4fetch), signed-cookie utils, `proxy.ts` matcher additions | `drizzle push` works; can sign & PUT a test object to R2 |
| 2. Seed & admin CRUD | Seed script from Part 3 JSON; admin login; editions, people, chapters, questions (with template preview), copy | Admin can edit every seeded item |
| 3. Design system | Tokens, fonts, textures, motif SVGs, base components (Button, AlbumCard, PhotoFrame, Sheet) | Storybook-free visual page `/sunao-admin/preview/kit` renders all |
| 4. Recipient core | Gate, PIN, album, chapter, question (write mode), autosave, ViewTransitions | Can answer by text end to end |
| 5. Diya recorder | Recorder state machine, analyser flame, IDB queue, chunk upload, finalize, review, takes | Record 12 min on iOS Safari & Android Chrome with airplane mode toggled mid-way; nothing lost |
| 6. Media | Admin upload pipeline, media links, presigned GET route, photos on chapters/questions | Shot-list slots filled with placeholders |
| 7. Greetings | Invites, contributor flow, moderation, wall | 3 test greetings (text, voice, video) approved and visible |
| 8. Birthday reveal | Diya intro, cake + blow detection, petals, montage, tohfa letter | Full sequence on a mid-range Android at 60fps |
| 9. Seals, Kitaab, Reader | Seal sheet, server enforcement, `/kitaab`, `/padho` | Sealed answer invisible in reader until condition |
| 10. Polish & QA | Reduced motion, a11y pass, copy pass, export ZIP, PWA, WhatsApp previews (OG image) | Checklist in section 16 all green |

---

## 16. QA checklist
- [ ] iPhone Safari (latest + one older iOS), Android Chrome on a budget device, WhatsApp in-app browser (Android + iOS).
- [ ] Mic permission: allow, deny, deny-then-allow via settings.
- [ ] Record 30s, 5 min, 12 min (segment rollover). Pause/resume. Re-record keeps old take hidden.
- [ ] Network: throttle to slow 3G, go offline mid-record, close tab mid-record, reopen: recording recovered.
- [ ] Text autosave survives refresh and offline.
- [ ] Before unlock: countdown, no data leaks in HTML/JSON.
- [ ] Wrong PIN rate limit and lockout copy.
- [ ] Heavy-question gate always shown; heavy never suggested as "Aaj ka sawaal".
- [ ] Sealed answers absent from reader API responses.
- [ ] Reduced-motion mode and "Kam animation" toggle.
- [ ] OS font at 130%: no clipped text.
- [ ] All images have alt text; screen reader reads question, asked-by, and recorder state.
- [ ] WhatsApp link preview shows OG image (paper + diya + "Mamma ke liye") without revealing private content.
- [ ] Admin export ZIP opens `book.html` offline with working audio.

---

## 17. Future editions
- `theme` + `occasion` + question bank are swappable. **Papa edition** later: theme `papa-khaki` (khaki, slate blue, brass), record metaphor = **transistor radio dial** (needle swings with voice), motifs = scooter, HMT watch, newspaper, cricket. Same schema; new seed.
- Occasion modules: `anniversary` (two diyas), `mothers_day`, `none` (no reveal; straight to tohfa).
