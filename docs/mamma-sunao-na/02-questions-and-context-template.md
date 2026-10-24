# Part 2: Questions & Family Context Template

> This is the **reusable, fill-in template**. A family fills the profile (section 2), picks or edits questions from the bank (section 7), and the build (Part 1) turns it into an edition.
> Part 3 shows this template filled for **Mamma's birthday**.

---

## 1. How this template is used

```
 Family Profile (sec 2)  ─┐
                          ├──▶  Template engine (sec 4)  ──▶  Resolved questions  ──▶  Seed JSON  ──▶  DB (editable in admin)
 Question Bank (sec 7)  ──┘
 Greetings plan (sec 8), Photo shot list (sec 9), Intro note (sec 10)  ──────────────────────────▶  Seed JSON
```

- Templates are stored **unresolved** in the DB (`prompt_template`) so that editing a person's name/call name in admin updates every question automatically.
- Admin shows a live **resolved preview** for every question.
- Anything marked `PLACEHOLDER` must be visible in admin with a yellow "fill me" badge, and the recipient UI must **never** render a question containing an unresolved placeholder (it is auto-skipped until filled).
- Values prefixed `CONFIRM:` (e.g. `"CONFIRM:Sanjhle Mamaji"`) are **usable defaults**: the text after the prefix is rendered, but admin shows a blue "please confirm" badge until someone edits or confirms it. The seed script strips the prefix and sets a `needs_confirm` flag on the field (store as a JSON list `needs_confirm: string[]` on the row).

---

## 2. Family profile template (fill this in)

Copy this YAML, fill it, and keep it as `src/features/sunao/seed/<edition>.profile.yaml` (or convert directly to JSON).

```yaml
edition:
  slug: "<occasion>-<recipient>-<year>"        # e.g. mamma-birthday-2026
  title: "<AddressWord>, Sunao Na"
  occasion: birthday                           # birthday | anniversary | mothers_day | none
  occasion_date: "YYYY-MM-DD"
  occasion_age: null                           # number or null (we never show age unless set)
  unlock_at_local: "YYYY-MM-DD 00:00"          # Asia/Kolkata
  timezone: Asia/Kolkata
  locale_default: hinglish                     # hinglish | hindi
  theme: maa-haldi
  pin_hint: "<hint shown on PIN screen>"       # never the PIN itself
  help_contact: { label: "<child>", phone: "+91XXXXXXXXXX" }

recipient:
  key: recipient
  address_word: "<Maa | Mummy | Mamma | Amma | Ammi | Aai>"
  formal_name: "<her real name>"
  nicknames: ["<ghar ka naam>"]
  gender: f
  born_year_approx: "<YYYY or decade>"
  birthplace: "<city/village>"
  hometown: "<city where she grew up>"
  hometown_areas: ["<mohalla / colony / gali>"]   # e.g. "Karol Bagh", "Lajpat Nagar"
  marital_city: "<city after marriage>"
  current_city: "<city now>"
  mother_tongue: "<Hindi | Punjabi | ...>"
  languages: ["Hindi", "Punjabi", "English"]
  religion_festivals: ["Diwali", "Holi", "Karva Chauth", "Raksha Bandhan", "Bhai Dooj", "Lohri"]
  schooling: "<school name / till which class>"
  work: "<homemaker | teacher | ...>"
  favourites:
    songs: []
    films: []
    actors: []
    food_she_makes_best: []
    food_she_loves: []
    places: []
    sarees_or_suits: []
  known_stories: []                              # stories the children already half-know; seeds follow-ups
  avoid_topics: []                               # admin-only; questions touching these are disabled

spouse:
  key: <key>                                     # e.g. papaji
  call_name_by_kids: "<Papa | Papaji | Daddy>"
  call_name_by_recipient: "<how she refers to him>"   # often "inke papa", "ye", or name
  is_alive: true
  marriage_year_approx: "<YYYY>"
  marriage_type: "<arranged | love | love-cum-arranged | PLACEHOLDER>"
  first_meeting_known: "<what kids know, or PLACEHOLDER>"

children:                                        # in birth order
  - key: <key>
    display_name: "<name>"
    gender: m | f | x | unknown
    birth_order: 1
    birth_year_approx: "<YYYY>"
    birth_city: "<city/hospital, optional>"
    spouse_key: <key or null>

children_in_law:
  - key: <key>
    display_name: "<name>"
    gender: f | m
    spouse_of: <child key>
    joined_family_year: "<YYYY>"
    call_name_for_recipient: "<Mummy | Mummyji | Mamma>"   # what the in-law calls her

grandchildren: []                                # same shape as children

parents:
  - key: <key>               # e.g. nanaji
    relation: father
    call_name_by_kids: "<Nanaji>"
    call_name_by_recipient: "<Pitaji | Papa | Bauji | Daarji>"
    is_alive: true | false | null              # null = unknown, treat gently
    work: "<occupation>"
  - key: <key>               # e.g. naniji
    relation: mother
    call_name_by_kids: "<Naniji>"
    call_name_by_recipient: "<Bebe | Maa | Amma | Biji>"
    is_alive: true | false | null

siblings:                                        # include ALL, in birth order, including deceased
  - key: <key>
    relation: brother | sister
    birth_order: 1
    is_elder_to_recipient: true
    display_name: "<real name or PLACEHOLDER>"
    call_name_by_recipient: "<Bhaiya | Bade Bhaiya | Jiji | Didi | name>"
    call_name_by_kids: "<Mamaji | Mausiji | 'Raju Mama'>"
    is_alive: true
    spouse_call_name_by_kids: "<Mamiji | Mausaji>"
    notes: "<nicknames, known fights, shared stories>"

recipient_birth_order: <n>                       # her position among all siblings (1 = eldest)

extended:                                        # optional: cousins, friends, neighbours, teachers
  - key: <key>
    relation_label: "<Mamma ki bachpan ki saheli>"
    display_name: "<name>"
    is_alive: true

places:                                          # used in templates as {{place.<key>}}
  childhood_home: "<description: 'Delhi wala ghar, Paharganj'>"
  nani_ghar: "<if different>"
  sasural: "<city/house>"
  current_home: "<city/house>"

eras:                                            # helps date-appropriate questions
  childhood_decade: "<1960s | 1970s | 1980s>"
  marriage_decade: "<1980s | 1990s>"
```

### 2.1 Sensitive data handling
- `is_alive: false` people are referenced only in **heavy** or **Yaadon Mein** questions, never in light ones, never on the birthday reveal (unless `settings.reveal.tributeOnReveal = true`).
- `is_alive: null` means unknown: questions about this person use **past-tense childhood framing only** ("bachpan mein…"), which is true either way.
- `avoid_topics` disables any question whose `tags` intersect it.

---

## 3. Chapter arc (life stages)

The book walks from childhood to marriage to children and beyond, then turns to wisdom and letters. The emotional curve is **light → deep → light → tender**. Never end a chapter on a heavy question, and never place two heavy questions back to back.

| # | Key | Title (Roman) | Title (Devanagari) | Life stage | Palette | Motif | Weight mix |
|---|---|---|---|---|---|---|---|
| 0 | `janamdin` | Janamdin Special | जन्मदिन स्पेशल | now | haldi | diya | light only |
| 1 | `shuruaat` | Shuruaat | शुरुआत | childhood | haldi | rangoli-lotus | light |
| 2 | `mayka` | Mayka, Wo Ghar | मायका, वो घर | childhood | haldi | jaali | light/medium |
| 3 | `maa-baap` | {{nanaji}} aur {{naniji}} | — | childhood | leaf | paisley | medium, 1 heavy |
| 4 | `bhai-behen` | Bhai-Behen | भाई-बहन | childhood | marigold | kite | light/medium |
| 5 | `school-saheliyan` | School, Saheliyan aur Shararatein | स्कूल, सहेलियाँ और शरारतें | youth | haldi | mango | light |
| 6 | `jawani` | Jab Aap Jawan Thi | जब आप जवान थीं | youth | dusk | paisley | light/medium |
| 7 | `rishta-shaadi` | Rishta aur Shaadi | रिश्ता और शादी | marriage | sindoor | rangoli-star | medium, 1 heavy |
| 8 | `sasural` | Sasural, Naya Ghar | ससुराल, नया घर | marriage | leaf | jaali | medium |
| 9 | `jeevansathi` | {{spouse}} aur Aap | — | marriage | sindoor | diya | light/medium |
| 10 | `child-<key>` (one per child) | {{child}} ka Aana | — | motherhood | haldi | rangoli-lotus | light/medium |
| 11 | `maa-banna` | Maa Banna | माँ बनना | motherhood | marigold | rangoli-star | medium, 1 heavy |
| 12 | `beech-ke-saal` | Ghar, Zimmedari aur Beech ke Saal | — | middle | dusk | jaali | medium, 1–2 heavy |
| 13 | `naye-rishte` | Naye Rishte (bahu/damaad, grandkids) | नए रिश्ते | middle | leaf | paisley | light |
| 14 | `yaadon-mein` | Jo Yaadon Mein Hain | जो यादों में हैं | reflection | dusk | diya | heavy (gated chapter) |
| 15 | `khushiyan` | Choti Choti Khushiyan | छोटी छोटी खुशियाँ | now | haldi | mango | light |
| 16 | `aaj` | Aaj Ki {{addressWord}} | — | now | marigold | toran | light |
| 17 | `seekh` | Jo Aapne Seekha | जो आपने सीखा | reflection | leaf | rangoli-lotus | light/medium |
| 18 | `chitthiyan` | Chitthiyan | चिट्ठियाँ | letters | inland | inland-letter | medium, sealable |

Chapters can be disabled or reordered in admin. `yaadon-mein` is auto-enabled only if any sibling/parent has `is_alive: false`. The whole chapter sits behind a heavy gate on entry.

---

## 4. Template engine spec

Implement in `src/features/sunao/lib/template.ts`. Pure function: `resolve(template, ctx) → { text, missing: string[] }`.

### 4.1 Variables
| Syntax | Resolves to |
|---|---|
| `{{addressWord}}` | recipient.address_word ("Mamma") |
| `{{recipient.name}}` | recipient formal name |
| `{{recipient.nickname}}` | first nickname or PLACEHOLDER |
| `{{hometown}}` | recipient.hometown |
| `{{place.childhood_home}}` etc. | places.* |
| `{{<personKey>}}` | that person's **call_name_by_kids** (children's POV, the default voice) |
| `{{<personKey>.her}}` | **call_name_by_recipient** (use when quoting how she'd say it) |
| `{{<personKey>.name}}` | display_name |
| `{{spouse}}` / `{{spouse.her}}` | alias of the spouse person |
| `{{child1}}`, `{{child2}}` … | children by birth order (display name) |
| `{{eldestChild}}`, `{{youngestChild}}` | aliases |
| `{{childInLaw1}}` | first child-in-law |
| `{{siblingsCount}}` | total siblings excluding recipient |
| `{{siblingsTotalWithHer}}` | including her (e.g. "saat") as Hindi number word |
| `{{brothersCount}}` / `{{sistersCount}}` | Hindi number words ("chaar", "do") |
| `{{siblingsWord}}` | "bhai-behen" (or "bhai" / "behenein" if only one kind) |
| `{{festival1}}`, `{{festival2}}` | recipient.religion_festivals[0], [1] |
| `{{childrenNames}}` | children + in-laws joined Hindi-style: "Sunny, Gunjan aur Mickey" |
| `{{occasionDate}}` | occasion_date formatted "12 November" |
| `{{askerAddress}}` | how the (single) asker addresses her: their `call_name_for_recipient` (e.g. Gunjan → "Mummy"), else `addressWord` |
| `{{it}}`, `{{it.her}}`, `{{it.name}}` | current item inside `for_each` |
| `{{askedBy}}` | rendered asked-by line, see 4.4 |

Unknown variable or value `PLACEHOLDER` ⇒ added to `missing`; question hidden from recipient until fixed.

### 4.2 Gender agreement helper
Hindi verbs and adjectives agree with gender. Syntax:
```
{{g <personKey> "<masc>" "<fem>" ["<neutral/plural>"]}}
```
Examples:
- `jab {{child1}} {{g child1 "hua" "hui" "hua/hui"}} tha` → "jab Sunny hua tha"
- `{{it}} {{g it "kaisa" "kaisi"}} tha/thi` — prefer writing the whole phrase: `{{g it "kaise the" "kaisi thi"}}`.
If gender is `unknown`, use the third value; if no third value is given, the question is flagged in admin ("gender needed"). **Prefer rephrasing to avoid gendered verbs** (e.g. use "{{child2}} ka janam" instead of "{{child2}} hua/hui").

Respect: elders (parents, elder siblings, spouse) take **plural-respect verbs** ("Nanaji kehte the", "Jiji karti thi"). The helper `{{r <personKey> "<masc-resp>" "<fem-resp>"}}` exists as an alias of `g` for readability.

### 4.3 Conditions (`condition`)
A tiny expression language evaluated against the profile. Supported: `&&`, `||`, `!`, `==`, `!=`, `>`, `<`, parentheses, dotted paths, `count(<list>)`, `any(<list>, <expr>)`.

Examples:
- `spouse.is_alive == true`
- `count(children) > 1`
- `any(siblings, it.is_alive == false)`
- `recipient.religion_festivals contains "Raksha Bandhan"` (`contains` operator for arrays)

### 4.4 Asked-by
`asked_by: ["sunny"]`, `["sunny","mickey"]`, `["hum"]` (all children), or include in-laws `["gunjan"]`.
Rendered line (small caps above the question):
- one male: "{NAME} POOCHH RAHA HAI"
- one female: "{NAME} POOCHH RAHI HAI"
- one elder (role `spouse`, `parent`, or `is_elder_to_recipient`), any gender: respect plural "{NAME} POOCHH RAHE HAIN"
- unknown gender: "{NAME} KA SAWAAL"
- two or more: "{A} AUR {B} POOCHH RAHE HAIN"; `hum`: "HUM SAB POOCHH RAHE HAIN"
The question text itself should then be written in that voice, e.g. Gunjan's questions use "aapne Sunny ko…", a child's use "aapne mujhe…". When `asked_by` is multiple children, write "humein / hum".

### 4.5 `for_each` generators
Generate one question per matching person. Syntax: `for_each: "siblings where is_alive == true"`. Expansion happens at seed time **and** on demand in admin ("Regenerate"). Generated rows store `generated_from` and are individually editable; manual edits are preserved on regenerate (match by `key`).
Generated key: `<template.key>.<person.key>`.

### 4.6 Validation rules (admin + seed)
- Max 160 characters for `prompt` after resolution (one screen, no scroll at 30px on a 360px wide phone ≈ 5–6 lines).
- Sub-prompt max 120 characters.
- No English tech words (lint list: upload, submit, record, save, error, login, click).
- Must contain "aap/aapka/aapki/aapne/aapko" or an imperative with "-iye/-o" respect form. Warn if "tum/tera/tumhara" appears.
- Heavy questions must not be first or last in a chapter.

---

## 5. Emotion taxonomy (tags)

| Tag | Hinglish label | Meaning | Reader filter colour |
|---|---|---|---|
| `yaadein` | Yaadein | nostalgia, sensory recall | haldi |
| `khushi` | Khushi | joy | marigold |
| `hasi` | Hasi-Mazaak | humour, mischief | marigold-light |
| `pyaar` | Pyaar | love, tenderness | sindoor-light |
| `garv` | Garv | pride | gold |
| `himmat` | Himmat | courage, resilience | leaf |
| `dard` | Dard | grief, loss | dusk |
| `kami` | Kami | longing, missing someone | inland |
| `shukriya` | Shukriya | gratitude | leaf-light |
| `seekh` | Seekh | wisdom | ink-soft |
| `sapne` | Sapne | dreams, aspirations | dusk-light |
| `ladai-sulah` | Ladai aur Sulah | conflict and reconciliation | sindoor |

Each question has 1–3 tags.

### 5.1 Weight
| Weight | Meaning | UX |
|---|---|---|
| `light` | Easy, joyful, sensory | Suggested as "Aaj ka sawaal" |
| `medium` | Personal, reflective | Shown normally, not suggested on day 1 |
| `heavy` | Loss, pain, regret | Heavy gate, never suggested, never on birthday |

---

## 6. Question-writing guide (for families editing the bank)

1. **Be specific and sensory.** "Nani ki rasoi kaisi mehekti thi?" beats "Bachpan kaisa tha?".
2. **One ask per question.** Put the second ask in `followups`.
3. **Use the children's voice.** "Mamma, mujhe batao…", "Humne kabhi poocha hi nahi…". Gunjan's voice: "Mummy, Sunny kehta hai ki…".
4. **Invite stories, not facts.** Ask "Kaisa tha wo din?" not "Kab hua tha?".
5. **Tease a little.** "Sach batana!", "Koi nahi sun raha…": playful is how Indian families talk.
6. **Loss with love.** Ask about laughter and habits of the departed, not their death. "{{it}} ki koi baat jo yaad karke aaj bhi hasi aa jaati hai?"
7. **Fights are welcome, framed with warmth.** "Sabse badi ladai… aur phir sulah kaise hui?"
8. **Never judge.** No questions implying she sacrificed "too much" or regrets marriage/children. Keep `medium/heavy` reflective ones open-ended.
9. **Recipe & ritual questions are gold.** They create heirlooms (her exact steps, her own words).
10. **Sub-prompts lower the barrier.** "Aankhein band kariye…", "Bas ek chhoti si baat bhi chalegi."

---

## 7. Generic question bank (template)

Format = seed format. Each item:
```yaml
- key: chapterKey.slug
  prompt: "<template>"
  sub: "<sub-prompt template>"
  followups: ["..."]
  emotions: [tag, tag]
  weight: light | medium | heavy
  asked_by: [hum]
  condition: null
  for_each: null
  sealed_default: false
  tags: []          # for avoid_topics matching: e.g. [marriage, death, health, money, inlaws]
  photo_slot: null  # shot-list id from sec 9
```

### 0. janamdin
```yaml
- key: janamdin.bachpan-ka-janamdin
  prompt: "{{addressWord}}, bachpan mein aapka janamdin kaise manaya jaata tha?"
  sub: "Koi tohfa, koi pakwaan, koi khaas din… jo bhi yaad ho."
  followups: ["Kisi saal ka janamdin jo sabse zyada yaad hai?"]
  emotions: [yaadein, khushi]
  weight: light
  asked_by: [hum]
- key: janamdin.sabse-yaadgar-tohfa
  prompt: "Aaj tak ka sabse yaadgar tohfa kaunsa tha, aur kisne diya tha?"
  emotions: [khushi, pyaar]
  weight: light
  asked_by: [hum]
- key: janamdin.is-saal-ki-khwahish
  prompt: "Is janamdin pe aapki ek khwahish kya hai? Sach mein wali."
  sub: "Hum sun rahe hain."
  emotions: [sapne]
  weight: light
  asked_by: [hum]
```

### 1. shuruaat
```yaml
- key: shuruaat.naam
  prompt: "{{addressWord}}, aapka naam kisne rakha tha? Uske peeche koi kahani hai?"
  sub: "Ghar ka koi pyaar ka naam bhi tha kya?"
  emotions: [yaadein]
  weight: light
  asked_by: [hum]
- key: shuruaat.pehli-yaad
  prompt: "Aapko sabse pehli cheez kya yaad hai? Bilkul pehli."
  sub: "Aankhein band kariye. Koi rang, koi aawaaz, koi chehra…"
  emotions: [yaadein]
  weight: light
  asked_by: [hum]
- key: shuruaat.chidhana
  prompt: "Bachpan mein sab aapko kis naam se chidhate the?"
  emotions: [hasi]
  weight: light
  asked_by: [hum]
```

### 2. mayka
```yaml
- key: mayka.darwaza
  prompt: "Aankhein band karke {{place.childhood_home}} ke darwaze se andar aaiye. Kya dikhta hai?"
  sub: "Aangan, seedhiyan, chhat… dheere dheere batao."
  emotions: [yaadein]
  weight: light
  asked_by: [hum]
  photo_slot: P-HOME
- key: mayka.rasoi
  prompt: "{{naniji}} ki rasoi kaisi mehekti thi? Koi ek khushboo jo aaj bhi yaad hai?"
  emotions: [yaadein, pyaar]
  weight: light
  asked_by: [hum]
- key: mayka.garmi-chhuttiyan
  prompt: "Garmi ki chhuttiyan kaise beet-ti thi? Chhat pe sona, aam, cooler… sab batao."
  emotions: [yaadein, khushi]
  weight: light
  asked_by: [hum]
- key: mayka.tyohaar
  prompt: "{{festival1}} ki subah aapke ghar mein kaisi hoti thi?"
  emotions: [yaadein, khushi]
  weight: light
  asked_by: [hum]
  condition: "recipient.religion_festivals != empty"
- key: mayka.aawaaz
  prompt: "Bachpan ki koi aawaaz jo aap ek baar phir sunna chahengi?"
  sub: "Mandir ki ghanti, sabziwale ki pukaar, radio, kisi ki hasi…"
  emotions: [kami, yaadein]
  weight: medium
  asked_by: [hum]
- key: mayka.akela-kona
  prompt: "Ghar ka wo kona kaunsa tha jahan aap akele baithna pasand karti thi?"
  emotions: [yaadein]
  weight: light
  asked_by: [hum]
```

### 3. maa-baap
```yaml
- key: maa-baap.maa-ke-haath
  prompt: "{{naniji}} ke haath kaise the, {{addressWord}}? Wo hamesha kya karte rehte the?"
  emotions: [pyaar, yaadein]
  weight: medium
  asked_by: [hum]
- key: maa-baap.pita-ki-baat
  prompt: "{{nanaji}} ki koi baat jo aaj bhi aapke kaan mein goonjti hai?"
  emotions: [pyaar, seekh]
  weight: medium
  asked_by: [hum]
- key: maa-baap.bina-kahe-pyaar
  prompt: "Unhone kabhi khul ke nahi kaha, par aapko pata tha ki wo aapse kitna pyaar karte the. Kaise pata chalta tha?"
  emotions: [pyaar]
  weight: medium
  asked_by: [hum]
- key: maa-baap.daant
  prompt: "Sabse zyada daant kisse padti thi, {{nanaji}} se ya {{naniji}} se? Aur kis baat pe?"
  emotions: [hasi, yaadein]
  weight: light
  asked_by: [hum]
- key: maa-baap.jo-pooch-nahi-paayi
  prompt: "Unse koi baat jo aap poochhna chahti thi, par poochh nahi paayi?"
  emotions: [kami, dard]
  weight: heavy
  asked_by: [hum]
  tags: [death]
```

### 4. bhai-behen
```yaml
- key: bhai-behen.ghar-ka-mahaul
  prompt: "{{siblingsTotalWithHer}} bachche ek ghar mein! Ghar ka mahaul kaisa hota tha?"
  sub: "Shor, ladai, khana, sona… sab kaise hota tha?"
  emotions: [yaadein, hasi]
  weight: light
  asked_by: [hum]
- key: bhai-behen.sabse-badi-ladai
  prompt: "Bhai-behenon mein sabse badi ladai kis baat pe hui thi? Aur phir sulah kaise hui?"
  emotions: [ladai-sulah, hasi]
  weight: light
  asked_by: [hum]
- key: bhai-behen.khel
  prompt: "Aap sab milke kaunse khel khelte the?"
  sub: "Pithu, kho-kho, stapu, ludo, patang…"
  emotions: [khushi, yaadein]
  weight: light
  asked_by: [hum]
- key: bhai-behen.rakhi
  prompt: "Rakhi pe kya hota tha? Sabse achha tohfa kisne diya tha?"
  emotions: [pyaar, yaadein]
  weight: light
  asked_by: [hum]
  condition: "recipient.religion_festivals contains \"Raksha Bandhan\""
- key: bhai-behen.per-sibling-alive
  for_each: "siblings where is_alive == true"
  prompt: "{{it}} ke saath bachpan ki koi shararat jo aaj bhi yaad karke hasi aati hai?"
  emotions: [hasi, pyaar]
  weight: light
  asked_by: [hum]
- key: bhai-behen.kaun-bachata-tha
  prompt: "Jab aapko daant padti thi, toh kaun bachane aata tha?"
  emotions: [pyaar]
  weight: light
  asked_by: [hum]
```

### 5–6. school-saheliyan, jawani
```yaml
- key: school.best-friend
  prompt: "Aapki sabse pakki saheli kaun thi? Dono milke kya karti thi?"
  emotions: [khushi, hasi]
  weight: light
  asked_by: [hum]
- key: school.kaisi-student
  prompt: "School mein aap kaisi student thi? Sach batana!"
  emotions: [hasi]
  weight: light
  asked_by: [hum]
- key: school.sapna
  prompt: "Badi hokar aap kya banna chahti thi?"
  followups: ["Wo sapna kahan gaya, {{addressWord}}?"]
  emotions: [sapne]
  weight: medium
  asked_by: [hum]
- key: jawani.gaana
  prompt: "Koi gaana jo sunte hi aap solah saal ki ho jaati ho?"
  sub: "Gungunao bhi toh chalega."
  emotions: [khushi, yaadein]
  weight: light
  asked_by: [hum]
- key: jawani.cinema
  prompt: "Pehli baar cinema hall mein kaunsi film dekhi thi? Kiske saath?"
  emotions: [khushi, hasi]
  weight: light
  asked_by: [hum]
```

### 7–9. rishta-shaadi, sasural, jeevansathi
```yaml
- key: rishta.pehli-mulaqat
  prompt: "{{spouse}} se pehli baar kab mili thi? Pehli nazar mein kya laga?"
  emotions: [pyaar, hasi]
  weight: light
  asked_by: [hum]
- key: rishta.rishta-kaise-aaya
  prompt: "Rishta kaise aaya tha? Aapki kya marzi thi?"
  emotions: [yaadein]
  weight: medium
  asked_by: [hum]
  tags: [marriage]
- key: rishta.bidaai
  prompt: "Bidaai wala din kaisa tha, {{addressWord}}?"
  sub: "Jitna mann ho utna hi batana."
  emotions: [kami, pyaar]
  weight: heavy
  asked_by: [hum]
  tags: [marriage]
- key: sasural.pehla-din
  prompt: "Sasural mein pehla din kaisa laga? Kisne sabse pehle apnapan dikhaya?"
  emotions: [yaadein, shukriya]
  weight: medium
  asked_by: [hum]
  tags: [inlaws]
- key: sasural.pehli-rasoi
  prompt: "Sasural mein pehli baar kya banaya tha? Sabne kya kaha?"
  emotions: [hasi, yaadein]
  weight: light
  asked_by: [hum]
- key: jeevansathi.choti-aadat
  prompt: "{{spouse}} ki koi choti si aadat jispe aapko aaj bhi pyaar aata hai?"
  emotions: [pyaar]
  weight: light
  asked_by: [hum]
  condition: "spouse.is_alive == true"
- key: jeevansathi.ladai-sulah
  prompt: "Aap dono ki sabse mazedaar ladai kis baat pe hui thi? Aur sulah kisne ki?"
  emotions: [ladai-sulah, hasi]
  weight: light
  asked_by: [hum]
```

### 10–11. child-<key>, maa-banna
```yaml
- key: child.janam
  for_each: "children"
  prompt: "{{it}} ke janam wala din… jo bhi yaad hai, sab batao."
  emotions: [pyaar, khushi]
  weight: light
  asked_by: [hum]
- key: child.pehli-baar-god
  for_each: "children"
  prompt: "{{it}} ko pehli baar god mein liya, tab kya socha tha?"
  emotions: [pyaar]
  weight: light
  asked_by: [hum]
- key: child.sabse-zyada-pareshan
  for_each: "children"
  prompt: "Bachpan mein {{it}} ne aapko sabse zyada kab pareshan kiya?"
  emotions: [hasi, ladai-sulah]
  weight: light
  asked_by: [hum]
- key: maa-banna.darr
  prompt: "Maa bante waqt sabse zyada darr kis baat ka lagta tha?"
  emotions: [himmat]
  weight: medium
  asked_by: [hum]
- key: maa-banna.chupke-garv
  prompt: "Kabhi chupke se humpe garv hua ho, par kabhi bataya na ho?"
  emotions: [garv, pyaar]
  weight: medium
  asked_by: [hum]
- key: maa-banna.jo-chhoda
  prompt: "Humare liye aapne kya chhoda jo shayad humne kabhi notice hi nahi kiya?"
  emotions: [pyaar, kami]
  weight: heavy
  asked_by: [hum]
```

### 12–13. beech-ke-saal, naye-rishte
```yaml
- key: beech.mushkil-waqt
  prompt: "Kab aap itni himmat wali bani jitna kisi ko pata bhi nahi chala?"
  emotions: [himmat]
  weight: heavy
  asked_by: [hum]
- key: beech.ghar-chalana
  prompt: "Ghar kaise chalaya jaata hai, iska asli raaz kya hai?"
  emotions: [seekh, hasi]
  weight: light
  asked_by: [hum]
- key: naye.bahu-aayi
  for_each: "children_in_law"
  prompt: "{{it}} pehli baar ghar aayi thi, tab aapne kya socha tha?"
  emotions: [pyaar, khushi]
  weight: light
  asked_by: [hum]
```

### 14. yaadon-mein (gated chapter)
```yaml
- key: yaadon.hasi-wali-yaad
  for_each: "siblings where is_alive == false"
  prompt: "{{it}} ki koi baat jo yaad karke aaj bhi hasi aa jaati hai?"
  sub: "Unki koi aadat, koi dialogue, koi shararat…"
  emotions: [hasi, kami]
  weight: heavy
  asked_by: [hum]
  tags: [death]
- key: yaadon.unse-kya-kehna
  for_each: "siblings where is_alive == false"
  prompt: "Agar aaj {{it}} se ek baat keh paati, toh kya kehti?"
  emotions: [kami, pyaar]
  weight: heavy
  asked_by: [hum]
  sealed_default: true
  tags: [death]
```

### 15–17. khushiyan, aaj, seekh
```yaml
- key: khushiyan.aam-sa-din
  prompt: "Ek bilkul aam sa din jo aaj bhi sabse khoobsurat lagta hai?"
  emotions: [khushi]
  weight: light
  asked_by: [hum]
- key: khushiyan.recipe
  prompt: "Aapki wo dish jo sirf aap hi sahi banati ho. Recipe batao, andaaze se nahi, sach mein!"
  sub: "Bol ke batana best rahega. Hum likh lenge."
  emotions: [pyaar, hasi]
  weight: light
  asked_by: [hum]
- key: aaj.apna-din
  prompt: "Agar ek din sirf apne liye mile, koi zimmedari nahi, toh kya karogi?"
  emotions: [sapne, khushi]
  weight: light
  asked_by: [hum]
- key: seekh.bees-saal
  prompt: "Bees saal ki apne aap ko ek baat kehni ho, toh kya kahogi?"
  emotions: [seekh]
  weight: medium
  asked_by: [hum]
- key: seekh.kaise-yaad-rakhein
  prompt: "Aap chahti ho log aapko kaise yaad rakhein?"
  emotions: [seekh, pyaar]
  weight: medium
  asked_by: [hum]
```

### 18. chitthiyan (sealable)
```yaml
- key: chitthi.per-child
  for_each: "children"
  prompt: "{{it}} ke liye ek chitthi. Jo dil mein hai, bol do."
  emotions: [pyaar]
  weight: medium
  asked_by: [hum]
  sealed_default: true
- key: chitthi.pote-poti
  prompt: "Apne pote-potiyon ke liye… jo abhi aaye bhi nahi."
  emotions: [pyaar, seekh]
  weight: medium
  asked_by: [hum]
  sealed_default: true
- key: chitthi.raaz
  prompt: "Ek baat jo aapne aaj tak kisi ko nahi batayi."
  sub: "Ye band lifafe mein rahegi. Aap tay karengi kab khule."
  emotions: [pyaar]
  weight: medium
  asked_by: [hum]
  sealed_default: true
- key: chitthi.jo-poocha-nahi
  prompt: "Kuch aisa jo humne poochha hi nahi, par aap batana chahti ho?"
  emotions: [pyaar, seekh]
  weight: light
  asked_by: [hum]
```

---

## 8. Greetings collection template

### 8.1 Who to invite (fill)
```yaml
greetings:
  collect_by: "YYYY-MM-DD"            # 2 days before occasion
  invites:
    - person_key: <key>               # or name if not in people
      label: "<display on card>"
      relation_label: "<Mamma ke bade bhai>"
      ask:                            # what to request from this person
        wish: true
        memory: true                  # "ek yaad unke saath"
        voice: preferred              # preferred | optional | none
        video: optional
        photo: optional
      prompt_override: null           # custom prompt text
      play_in_reveal: true|false
      featured: true|false
      sort: <n>
```

### 8.2 Default prompts by relation
| Relation | Prompt shown on `/g/[token]` |
|---|---|
| Spouse | "{{addressWord}} ke liye kuch aisa kahiye jo aap roz nahi keh paate. Aur pehli mulaqat ki ek yaad." |
| Child | "Ek shubhkamna, aur bachpan ki ek yaad jab {{addressWord}} ne aapke liye kuch khaas kiya." |
| Child-in-law | "Pehli baar jab aap unse mile, aur ab wo aapke liye kya hain." |
| Elder/younger sibling | "Bachpan ki ek kahani jisme {{addressWord}} (aapki behen) ho: shararat, ladai, ya pyaar." |
| Sibling's spouse / children (nephews, nieces) | "Unke saath ki koi pyaari yaad, aur unke liye ek dua." |
| Friend | "Aapki dosti ki ek yaad, aur ek shubhkamna." |
| Grandchild | "Unhe kya bulaate ho aur unki kaunsi baat sabse achhi lagti hai?" |

### 8.3 WhatsApp invite message template
```
Namaste {{inviteeName}} 🙏
{{occasionDate}} ko {{recipient.nickname or addressWord}} ka janamdin hai, aur hum unke liye ek khaas digital album bana rahe hain.
Kya aap unke liye ek chhoti si shubhkamna aur unke saath ki ek yaad bhej denge? Bol ke bhi bhej sakte hain (2 minute).
👉 {{inviteLink}}
Ye surprise hai, unhe mat batana 🤫
– {{senderName}}
```
Reminder (T-3 days): "Bas ek yaad dila rahe the 🌼 {{inviteLink}}"

### 8.4 Ordering guidance
Spouse → children → children-in-law → grandchildren → siblings (eldest first) → siblings' families → late siblings' children → friends → others. Admin can override.

---

## 9. Photo shot-list template

Each slot = one `ss_media` + link. IDs are referenced from questions via `photo_slot`.
```yaml
photos:
  - id: P-COVER
    target: album_cover
    description: "Best recent portrait of her, smiling, warm light"
    required: true
  - id: P-REVEAL-<n>
    target: reveal
    description: "..."
  - id: P-CH-<chapterKey>
    target: chapter
    chapter: <key>
    description: "..."
  - id: P-Q-<slug>
    target: question
    question: <key>
    description: "..."
    prompt_line: "Ye photo yaad hai?"   # shown above the question
```
Guidelines:
- Scan old prints at 600 dpi (phone scanning apps are fine: Google PhotoScan / Apple Notes scan), crop out album pages, keep slight warmth; **don't** over-restore faces with AI.
- Alt text in Hinglish describing people & setting: "Mamma aur Bade Mamaji, Delhi wale ghar ki chhat pe, 1980 ke aas paas".
- Photos of departed family: use in `yaadon-mein` and tribute only.

---

## 10. Children's intro note & voice note template

### 10.1 Handwritten note (shown in `/tohfa` in Kalam font)
```
{{addressWord}},
Aapne hamesha humari kahaniyan suni. Ab humari baari hai sunne ki.
Isme kuch sawaal hain: bachpan, {{hometown}} wala ghar, {{siblingsWord}}, {{spouse}}, hum…
Jab mann ho, ek sawaal ka jawab dijiye. Bol ke, ya likh ke. Koi jaldi nahi.
Aapki aawaaz humare liye sabse keemti tohfa hai.
– {{childrenNames}}
```

### 10.2 Voice note script (10–20s, recorded by the children together, quiet room)
```
{{child1}}: "Happy birthday {{addressWord}}!"
{{child2}}: "Ye aapke liye hai…"
{{childInLaw1}}: "…aur ab aapko humein kahaniyan sunani padengi!"
All: "Love you {{addressWord}}!"
```

---

## 11. Default UI copy keys (template)

| Key | Default (Roman) | Devanagari |
|---|---|---|
| `gate.countdown` | Kuch khaas aapka intezaar kar raha hai… | कुछ ख़ास आपका इंतज़ार कर रहा है… |
| `pin.title` | Apna khaas number daaliye | अपना ख़ास नंबर डालिए |
| `pin.wrong` | Ek baar phir try kijiye | एक बार फिर ट्राई कीजिए |
| `pin.locked` | Thodi der baad try kijiye, ya {{helpLabel}} ko call kar lijiye | |
| `reveal.lightDiya` | {{addressWord}}, ek diya jalaiye | |
| `reveal.tap` | Tap kariye | टैप करिए |
| `reveal.blow` | Ab candles bujhaiye… phoonk maariye! | |
| `reveal.blowTap` | Ya yahan tap kariye | |
| `reveal.wish` | Janamdin mubarak ho, {{addressWord}} | जन्मदिन मुबारक हो, {{addressWord}} |
| `reveal.montage` | Sabne aapke liye kuch kaha hai… | |
| `reveal.toWall` | Sabki shubhkamnayein dekhein | |
| `wall.next` | Aur ab, ek aur tohfa… | |
| `tohfa.open` | Kitaab kholiye | किताब खोलिए |
| `album.today` | Aaj ka sawaal | आज का सवाल |
| `album.answer` | Jawab dein | |
| `chapter.start` | Shuru karein | शुरू करें |
| `q.speak` | Bol ke batayein | बोल के बताएँ |
| `q.write` | Likh ke batayein | लिख के बताएँ |
| `q.later` | Baad mein | बाद में |
| `q.notToday` | Aaj nahi, {{addressWord}} | |
| `q.heavyGate` | Ye sawaal thoda bhaari hai, {{addressWord}}. Abhi baat karein? | |
| `q.heavyYes` | Haan | हाँ |
| `q.heavyNo` | Phir kabhi | फिर कभी |
| `q.saved` | Sambhaal liya | सँभाल लिया |
| `q.saving` | Sambhaal rahe hain… | |
| `q.followupYes` | Haan, batati hoon | |
| `q.next` | Aage chalein | आगे चलें |
| `rec.permission` | Phone aapse puchega ki aawaz sun sakta hai kya. 'Allow' dabaiye, taaki hum aapki aawaz sambhaal sakein. | |
| `rec.permissionOk` | Theek hai | |
| `rec.denied` | Koi baat nahi. Settings mein jaake microphone allow kar dijiye, ya likh ke bhi bata sakti hain. | |
| `rec.pause` | Ruko | |
| `rec.resume` | Aage bolein | |
| `rec.stop` | Bas | |
| `rec.paused` | Ruki hui hai. Jab mann ho, aage boliye. | |
| `rec.silence` | Aaram se, {{addressWord}}… koi jaldi nahi. | |
| `rec.breath` | Thoda saans le lijiye, phir aage bolte hain | |
| `rec.keep` | Rakh lo | |
| `rec.more` | Aur batana hai | |
| `rec.again` | Phir se bolun? | |
| `rec.offline` | Net thoda slow hai, aapki aawaz phone mein safe hai. | |
| `rec.recovered` | Aapki pichhli recording sambhaal li gayi hai. | |
| `write.placeholder` | Yahan likhiye… jis bhasha mein dil kare. | |
| `write.dictateHint` | Keyboard ke mic wale button se bol ke bhi likh sakti hain | |
| `seal.ask` | Isse band lifafe mein rakhein? | |
| `seal.date` | Kisi khaas din kholna | |
| `seal.event` | Kisi khaas mauke pe | |
| `seal.person` | Sirf {{name}} ke liye | |
| `seal.afterMe` | Mere baad | |
| `seal.none` | Nahi, khula rakhein | |
| `seal.confirmOpen` | Ye sab padh payenge. Theek hai? | |
| `menu.replay` | Janamdin phir se dekhein | |
| `menu.greetings` | Sabki shubhkamnayein | |
| `menu.book` | Meri kitaab | मेरी किताब |
| `menu.lessMotion` | Kam animation | |
| `menu.hindi` | Hindi mein dikhayein | हिंदी में दिखाएँ |
| `menu.help` | Madad chahiye? {{helpLabel}} ko call karein | |
| `pwa.install` | Isse apne phone ki home screen pe lagaiye, taaki roz aasaani se khul sake | |
| `g.thanks` | Shukriya! {{addressWord}} ko {{date}} ko ye milega. Ye raaz hai 🤫 | |
| `book.coverTitle` | {{recipient.nickname}} ki Kahani | |

---

## 12. Seed JSON shape (what the build consumes)

```json
{
  "edition": { "...": "section 2 edition + settings" },
  "people": [ { "key": "...", "role": "...", "display_name": "...", "call_name_by_kids": "...", "call_name_by_recipient": "...", "gender": "m", "is_alive": true, "birth_order": 1, "is_elder_to_recipient": true, "notes": "" } ],
  "places": { "childhood_home": "..." },
  "chapters": [ { "key": "...", "number": 1, "title": "...", "title_deva": "...", "subtitle": "...", "life_stage": "...", "palette": "...", "motif": "...", "enabled": true, "questions": [ { "key": "...", "prompt": "...", "sub": "...", "followups": [], "emotions": [], "weight": "light", "asked_by": ["hum"], "condition": null, "for_each": null, "sealed_default": false, "tags": [], "photo_slot": null } ] } ],
  "greetings": { "collect_by": "...", "invites": [] },
  "photos": [ { "id": "P-COVER", "target": "album_cover", "description": "...", "required": true } ],
  "intro": { "note": "...", "voice_script": "..." },
  "copy": { "key": { "value": "...", "value_deva": "..." } }
}
```
The seed script must be **idempotent** (upsert by `key`), never overwrite rows edited in admin unless run with `--force`, and print a list of unresolved `PLACEHOLDER` fields at the end.
