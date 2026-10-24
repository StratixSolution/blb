# Part 3: Generated Experience: "Mamma, Sunao Na" (Mamma's Birthday)

> This is Part 1 (experience template) + Part 2 (questions & context template), **filled in for our family**.
> The implementing agent should use **section 4 "Seed payload"** to seed the database. Everything here is editable from admin later.
>
> Markers:
> - `PLACEHOLDER` = unknown; anything that depends on it stays hidden from Mamma until filled.
> - `CONFIRM:<value>` = sensible default that is used now, but flagged in admin for the family to check.

---

## 1. Edition at a glance

| Item | Value |
|---|---|
| Title | **Mamma, Sunao Na** |
| Occasion | Mamma's birthday |
| Recipient address word | **Mamma** |
| Gift from | Sunny (elder child), Gunjan (Sunny's wife, Mamma's bahu), Mickey (younger child), with Papaji |
| Mamma's hometown | Delhi |
| Mamma's siblings | 7 children in her parents' home: 2 elder sisters (both departed), 4 brothers (eldest and third alive; second and youngest departed), and Mamma |
| Birthday date | `PLACEHOLDER` (YYYY-MM-DD) |
| Unlock | Birthday, 00:00 IST (link is shared in person during the presentation ritual, section 3) |
| Theme | `maa-haldi` |
| Language | Hinglish default, Hindi toggle |
| Help contact on screen | Sunny, `PLACEHOLDER` phone |

### 1.1 What the experience covers (life arc)
1. **Janamdin Special**: her birthdays, then and now
2. **Shuruaat**: name, first memories
3. **Delhi Wala Ghar**: the childhood home, Delhi summers and winters, festivals
4. **Nanaji aur Naniji**: her parents
5. **Saat Bhai-Behen**: life with 6 siblings: fights, games, Rakhi, Bhai Dooj, who protected whom
6. **Badi Jiji, Chhoti Jiji**: her elder sisters, their weddings, their care (light memories, warm framing)
7. **Bhaiya Log**: the four brothers, one by one
8. **School, Saheliyan aur Shararatein**
9. **Jab Mamma Jawan Thi**: youth, films, songs, dreams
10. **Rishta aur Shaadi**: Papaji, the wedding, bidaai
11. **Sasural, Naya Ghar**
12. **Papaji aur Aap**
13. **Sunny Aaya**
14. **Mickey Ka Aana**
15. **Maa Banna**: being a mother of two
16. **Ghar, Zimmedari aur Beech ke Saal**: the middle years
17. **Gunjan Aur Naye Rishte**: Sunny's wedding, becoming a saas, the family growing
18. **Jo Yaadon Mein Hain**: the four siblings who have passed (gated, gentle, optional)
19. **Choti Choti Khushiyan**
20. **Aaj Ki Mamma**
21. **Jo Aapne Seekha**
22. **Chitthiyan**: letters to Sunny, Mickey, Gunjan, Papaji, her brothers, future grandchildren (sealable)

That's 22 chapters and ~175 questions. It's meant to be answered **over weeks or months**, not in one sitting. Admin can disable any of it.

---

## 2. Family map

```
                         Nanaji ─────── Naniji                    (is_alive: PLACEHOLDER)
                                  │
   ┌────────────┬────────────┬────┴───────┬────────────┬────────────┬────────────┐
 Badi Jiji   Chhoti Jiji   Bade Bhaiya  Manjhle      Sanjhle       MAMMA      Chhote
 (Badi       (Chhoti       (Bade        Bhaiya       Bhaiya                   Bhai
  Mausiji)    Mausiji)      Mamaji)     (Manjhle     (Sanjhle                 (Chhote
  🪔 departed 🪔 departed   alive        Mamaji)      Mamaji)                  Mamaji)
                                         🪔 departed  alive                   🪔 departed
                                                                │
                                                     Papaji ────┘
                                                                │
                                         ┌──────────────────────┴──────────┐
                                    Sunny ── Gunjan                      Mickey
                                    (elder)  (bahu)                     (younger)
```

**Birth order is `CONFIRM`.** The diagram shows a sensible default only: both sisters are elder to Mamma; the eldest brother is the eldest son; the second brother next; the third brother is "older than the youngest"; Mamma's exact position relative to the brothers is unknown. Fix `birth_order` and `is_elder_to_recipient` in admin. Questions are written so they read correctly either way.

**Naming conventions used in questions** (children's POV, since the children are asking):
| Person | Kids call them | Mamma calls them | Alive |
|---|---|---|---|
| Eldest sister | `CONFIRM:Badi Mausiji` | `CONFIRM:Badi Jiji` | No |
| Second sister | `CONFIRM:Chhoti Mausiji` | `CONFIRM:Chhoti Jiji` | No |
| Eldest brother | `CONFIRM:Bade Mamaji` | `CONFIRM:Bade Bhaiya` | Yes |
| Second brother | `CONFIRM:Manjhle Mamaji` | `CONFIRM:Manjhle Bhaiya` | No |
| Third brother | `CONFIRM:Sanjhle Mamaji` | `CONFIRM:Sanjhle Bhaiya` | Yes |
| Youngest brother | `CONFIRM:Chhote Mamaji` | `PLACEHOLDER` (his name/nickname; she likely calls him by name if he's younger) | No |
| Father | `CONFIRM:Nanaji` | `CONFIRM:Pitaji` | `PLACEHOLDER` |
| Mother | `CONFIRM:Naniji` | `CONFIRM:Mummy` (her own word for her mother, e.g. Bebe/Biji/Amma) | `PLACEHOLDER` |
| Husband | Papaji | `CONFIRM:Papaji` | Yes |

> Many families call uncles by name ("Raju Mamaji"). If so, edit `call_name_by_kids` once in admin; every question updates.

---

## 3. The birthday: presentation ritual & timeline

### 3.1 Presentation ritual (in person, on the birthday)
The digital artifact should arrive as a **physical moment** too:

1. **Physical envelope:** an inland-letter blue envelope tied with a red mauli thread. Inside, a card (printed, ideally handwritten by Sunny/Mickey/Gunjan) says:
   > "Mamma, ye aapka tohfa hai. Phone se ye QR scan kariye. Aapka khaas number: Sunny ka janamdin (DDMM)."
   It also has the QR code of the share link (generated from admin), plus a small dried marigold.
2. **Where:** after the cake-cutting, when everyone is home. Sit beside her and let her hold her own phone. Don't take over; help only if asked.
3. **The reveal plays on her phone** (diya → candles she blows out → "Janamdin mubarak ho, Mamma" → family montage).
4. **Optional, together:** cast the greetings wall to the TV (Chromecast / screen mirroring) so the family watches the greetings together. Keep the Kitaab for her to explore privately later.
5. **First question together:** at the end, Sunny/Mickey can say: "Mamma, bas ek sawaal abhi?" and open the **Janamdin Special** chapter, which is light and joyful by design.

### 3.2 Timeline
| When | Who | What |
|---|---|---|
| T-30 days | Sunny | Fill `PLACEHOLDER`s, confirm `CONFIRM`s, upload first photos |
| T-25 | Sunny + Gunjan | Create greeting invites, send WhatsApp messages (section 6) |
| T-21 | Mickey | Collect old photos from Mamaji/cousins (shot list, section 7); scan |
| T-14 | All | Record children's intro voice note; write handwritten note |
| T-7 | Gunjan | Reminder to pending invitees; call elders (Bade Mamaji, Sanjhle Mamaji) and record their voice over the phone if they struggle with links (admin can upload files) |
| T-3 | Sunny | Moderate & order greetings; pick `play_in_reveal` clips; test on Mamma-like phone |
| T-1 | Sunny | Admin "Preview as Mamma" with simulated birthday date; print envelope card + QR |
| T-0 | Family | Presentation ritual |
| T+2 onward | Children | One WhatsApp nudge every 2–3 days with "Aaj ka sawaal" (section 9) |
| T+60 | Sunny | Export a backup ZIP; listen together with Mamma if she wants |

---

## 4. Seed payload

The implementing agent converts this section into `src/features/sunao/seed/mamma-birthday.json` (shape in Part 2, section 12).

**Question defaults** (omit in YAML when equal to default): `weight: light`, `asked_by: [hum]`, `sealed_default: false`, `followups: []`, `condition: null`, `tags: []`, `photo_slot: null`.

### 4.1 Edition & settings
```yaml
edition:
  slug: mamma-birthday-2026
  title: "Mamma, Sunao Na"
  occasion: birthday
  occasion_date: PLACEHOLDER          # "2026-MM-DD"
  occasion_age: null                  # we don't show age
  unlock_at_local: "<occasion_date> 00:00"
  timezone: Asia/Kolkata
  locale_default: hinglish
  theme: maa-haldi
  pin: PLACEHOLDER                    # 4 digits; suggested: Sunny's birthday DDMM
  pin_hint: "Sunny ka janamdin (DDMM)"
  help_contact: { label: "Sunny", phone: PLACEHOLDER }
  settings:
    reveal:
      enabled: true
      playOncePerDevice: true
      diyaIntro: true
      cake: { enabled: true, candles: symbolic, symbolicCount: 5, blowToExtinguish: true }
      # 5 candles = Papaji, Sunny, Gunjan, Mickey, and Mamma herself: "aapka ghar"
      montage: { enabled: true, maxSeconds: 90 }
      tributeOnReveal: false          # never show departed siblings on birthday reveal
    greetings: { enabled: true, showBeforeKitaab: true, allowVideo: true, maxVideoSeconds: 60, maxAudioSeconds: 180 }
    kitaab: { suggestedStartChapter: janamdin, showAskedBy: true, followupsEnabled: true, unlockAllChapters: true }
    recording: { segmentMaxSeconds: 600, chunkSeconds: 10, silenceNudgeSeconds: 8, bitrate: 48000 }
    privacy: { readerSeesUnsealedOnly: true, noindex: true }
    pwa: { promptInstallAfterAnswers: 3 }
```

### 4.2 People
```yaml
people:
  - key: mamma
    role: recipient
    display_name: "Mamma"
    formal_name: PLACEHOLDER
    nicknames: [PLACEHOLDER]           # her ghar ka naam in her mayka
    gender: f
    is_alive: true
    birth_order: CONFIRM:6
    notes: "Hometown Delhi. 7 siblings total including her."

  - key: papaji
    role: spouse
    display_name: "Papaji"
    call_name_by_kids: "Papaji"
    call_name_by_recipient: "CONFIRM:Papaji"
    gender: m
    is_alive: true

  - key: sunny
    role: child
    display_name: "Sunny"
    gender: m
    birth_order: 1
    spouse_of_person_id: gunjan
    call_name_for_recipient: "Mamma"

  - key: mickey
    role: child
    display_name: "Mickey"
    gender: CONFIRM:unknown            # set m/f in admin for correct Hindi verbs; questions avoid gendered verbs meanwhile
    birth_order: 2
    call_name_for_recipient: "Mamma"

  - key: gunjan
    role: child_in_law
    display_name: "Gunjan"
    gender: f
    spouse_of_person_id: sunny
    call_name_for_recipient: "CONFIRM:Mummy"
    relation_label: "Mamma ki bahu"

  - key: nanaji
    role: parent
    relation_label: "Mamma ke Pitaji"
    call_name_by_kids: "CONFIRM:Nanaji"
    call_name_by_recipient: "CONFIRM:Pitaji"
    gender: m
    is_alive: PLACEHOLDER
    notes: "Occupation PLACEHOLDER"

  - key: naniji
    role: parent
    relation_label: "Mamma ki Mummy"
    call_name_by_kids: "CONFIRM:Naniji"
    call_name_by_recipient: "CONFIRM:Mummy"
    gender: f
    is_alive: PLACEHOLDER

  - key: jiji_badi
    role: sibling
    relation: sister
    relation_label: "Mamma ki sabse badi behen"
    display_name: PLACEHOLDER
    call_name_by_kids: "CONFIRM:Badi Mausiji"
    call_name_by_recipient: "CONFIRM:Badi Jiji"
    gender: f
    is_alive: false
    birth_order: CONFIRM:1
    is_elder_to_recipient: true

  - key: jiji_chhoti
    role: sibling
    relation: sister
    relation_label: "Mamma ki doosri badi behen"
    display_name: PLACEHOLDER
    call_name_by_kids: "CONFIRM:Chhoti Mausiji"
    call_name_by_recipient: "CONFIRM:Chhoti Jiji"
    gender: f
    is_alive: false
    birth_order: CONFIRM:3
    is_elder_to_recipient: true

  - key: bhaiya_bade
    role: sibling
    relation: brother
    relation_label: "Mamma ke sabse bade bhai"
    display_name: PLACEHOLDER
    call_name_by_kids: "CONFIRM:Bade Mamaji"
    call_name_by_recipient: "CONFIRM:Bade Bhaiya"
    gender: m
    is_alive: true
    birth_order: CONFIRM:2
    is_elder_to_recipient: true
    spouse_call_name_by_kids: "CONFIRM:Badi Mamiji"

  - key: bhaiya_manjhle
    role: sibling
    relation: brother
    relation_label: "Mamma ke doosre bhai"
    display_name: PLACEHOLDER
    call_name_by_kids: "CONFIRM:Manjhle Mamaji"
    call_name_by_recipient: "CONFIRM:Manjhle Bhaiya"
    gender: m
    is_alive: false
    birth_order: CONFIRM:4
    is_elder_to_recipient: CONFIRM:true

  - key: bhaiya_sanjhle
    role: sibling
    relation: brother
    relation_label: "Mamma ke teesre bhai"
    display_name: PLACEHOLDER
    call_name_by_kids: "CONFIRM:Sanjhle Mamaji"
    call_name_by_recipient: "CONFIRM:Sanjhle Bhaiya"
    gender: m
    is_alive: true
    birth_order: CONFIRM:5
    is_elder_to_recipient: CONFIRM:true
    spouse_call_name_by_kids: "CONFIRM:Sanjhli Mamiji"

  - key: bhai_chhote
    role: sibling
    relation: brother
    relation_label: "Mamma ke sabse chhote bhai"
    display_name: PLACEHOLDER
    call_name_by_kids: "CONFIRM:Chhote Mamaji"
    call_name_by_recipient: PLACEHOLDER          # his name/nickname
    gender: m
    is_alive: false
    birth_order: CONFIRM:7
    is_elder_to_recipient: CONFIRM:false

places:
  childhood_home: "CONFIRM:Delhi wala ghar"     # e.g. "Karol Bagh wala ghar"; area PLACEHOLDER
  hometown: "Delhi"
  sasural: PLACEHOLDER
  current_home: PLACEHOLDER

recipient_extra:
  religion_festivals: ["CONFIRM:Diwali", "CONFIRM:Holi", "CONFIRM:Raksha Bandhan", "CONFIRM:Bhai Dooj", "CONFIRM:Karva Chauth", "CONFIRM:Lohri"]
  eras: { childhood_decade: "CONFIRM:1970s", marriage_decade: "CONFIRM:1990s" }
  favourites: { songs: [], films: [], food_she_makes_best: [] }   # fill if known; seeds follow-ups
  avoid_topics: []                                                # e.g. [health] if needed
```

### 4.3 Chapters
```yaml
chapters:
  - { key: janamdin,        number: 0,  title: "Janamdin Special",                     title_deva: "जन्मदिन स्पेशल",              subtitle: "Aaj aapka din hai. Shuruaat yahin se.",                     life_stage: now,        palette: haldi,    motif: diya,           cover: P-CH-JANAMDIN }
  - { key: shuruaat,        number: 1,  title: "Shuruaat",                             title_deva: "शुरुआत",                     subtitle: "Jahan se sab shuru hua.",                                    life_stage: childhood,  palette: haldi,    motif: rangoli-lotus,  cover: P-CH-SHURUAAT }
  - { key: delhi-ghar,      number: 2,  title: "Delhi Wala Ghar",                      title_deva: "दिल्ली वाला घर",               subtitle: "Aangan, chhat, aur wo galiyan.",                              life_stage: childhood,  palette: haldi,    motif: jaali,          cover: P-CH-DELHI }
  - { key: nanaji-naniji,   number: 3,  title: "Nanaji aur Naniji",                    title_deva: "नानाजी और नानीजी",             subtitle: "Jinhone aapko banaya.",                                      life_stage: childhood,  palette: leaf,     motif: paisley,        cover: P-CH-PARENTS }
  - { key: saat-bhai-behen, number: 4,  title: "Saat Bhai-Behen",                      title_deva: "सात भाई-बहन",                 subtitle: "Ek ghar, saat bachche, aur bahut saara shor.",               life_stage: childhood,  palette: marigold, motif: kite,           cover: P-CH-SIBLINGS }
  - { key: jiji,            number: 5,  title: "Badi Jiji, Chhoti Jiji",               title_deva: "बड़ी जीजी, छोटी जीजी",          subtitle: "Do badi behenein, jo maa jaisi bhi thi.",                    life_stage: childhood,  palette: dusk,     motif: paisley,        cover: P-CH-JIJI }
  - { key: bhaiya-log,      number: 6,  title: "Bhaiya Log",                           title_deva: "भैया लोग",                    subtitle: "Chaar bhai, chaar kahaniyan.",                               life_stage: childhood,  palette: marigold, motif: kite,           cover: P-CH-BHAIYA }
  - { key: school,          number: 7,  title: "School, Saheliyan aur Shararatein",    title_deva: "स्कूल, सहेलियाँ और शरारतें",     subtitle: "Sach batana, koi nahi sun raha.",                            life_stage: youth,      palette: haldi,    motif: mango,          cover: P-CH-SCHOOL }
  - { key: jawani,          number: 8,  title: "Jab Mamma Jawan Thi",                  title_deva: "जब मम्मा जवान थीं",             subtitle: "Gaane, filmein aur sapne.",                                   life_stage: youth,      palette: dusk,     motif: paisley,        cover: P-CH-JAWANI }
  - { key: rishta-shaadi,   number: 9,  title: "Rishta aur Shaadi",                    title_deva: "रिश्ता और शादी",               subtitle: "Papaji kaise aaye zindagi mein.",                            life_stage: marriage,   palette: sindoor,  motif: rangoli-star,   cover: P-CH-SHAADI }
  - { key: sasural,         number: 10, title: "Sasural, Naya Ghar",                   title_deva: "ससुराल, नया घर",               subtitle: "Ek naya aangan, naye log.",                                  life_stage: marriage,   palette: leaf,     motif: jaali,          cover: P-CH-SASURAL }
  - { key: papaji-aur-aap,  number: 11, title: "Papaji aur Aap",                       title_deva: "पापाजी और आप",                subtitle: "Itne saal, itni baatein.",                                   life_stage: marriage,   palette: sindoor,  motif: diya,           cover: P-CH-PAPAJI }
  - { key: sunny-aaya,      number: 12, title: "Sunny Aaya",                           title_deva: "सनी आया",                    subtitle: "Jab aap pehli baar Mamma bani.",                             life_stage: motherhood, palette: haldi,    motif: rangoli-lotus,  cover: P-CH-SUNNY }
  - { key: mickey-aaya,     number: 13, title: "Mickey Ka Aana",                       title_deva: "मिकी का आना",                 subtitle: "Ghar mein ek aur shararti.",                                 life_stage: motherhood, palette: haldi,    motif: rangoli-lotus,  cover: P-CH-MICKEY }
  - { key: maa-banna,       number: 14, title: "Maa Banna",                            title_deva: "माँ बनना",                    subtitle: "Do bachche, ek Mamma.",                                      life_stage: motherhood, palette: marigold, motif: rangoli-star,   cover: P-CH-MAA }
  - { key: beech-ke-saal,   number: 15, title: "Ghar, Zimmedari aur Beech ke Saal",    title_deva: "घर, ज़िम्मेदारी और बीच के साल",   subtitle: "Jo aapne chupchaap sambhala.",                               life_stage: middle,     palette: dusk,     motif: jaali,          cover: P-CH-BEECH }
  - { key: gunjan-naye-rishte, number: 16, title: "Gunjan aur Naye Rishte",            title_deva: "गुंजन और नए रिश्ते",            subtitle: "Ghar mein bahu aayi, aur Mamma bani saas.",                 life_stage: middle,     palette: leaf,     motif: paisley,        cover: P-CH-GUNJAN }
  - { key: yaadon-mein,     number: 17, title: "Jo Yaadon Mein Hain",                  title_deva: "जो यादों में हैं",              subtitle: "Unki baatein, unki hasi.",                                   life_stage: reflection, palette: dusk,     motif: diya,           cover: null, gated: true }
  - { key: khushiyan,       number: 18, title: "Choti Choti Khushiyan",                title_deva: "छोटी छोटी खुशियाँ",            subtitle: "Jo din ko achha bana dein.",                                 life_stage: now,        palette: haldi,    motif: mango,          cover: P-CH-KHUSHIYAN }
  - { key: aaj-ki-mamma,    number: 19, title: "Aaj Ki Mamma",                         title_deva: "आज की मम्मा",                 subtitle: "Abhi, isi pal.",                                             life_stage: now,        palette: marigold, motif: toran,          cover: P-COVER }
  - { key: seekh,           number: 20, title: "Jo Aapne Seekha",                      title_deva: "जो आपने सीखा",                subtitle: "Zindagi ki asli padhai.",                                    life_stage: reflection, palette: leaf,     motif: rangoli-lotus,  cover: null }
  - { key: chitthiyan,      number: 21, title: "Chitthiyan",                           title_deva: "चिट्ठियाँ",                    subtitle: "Kuch baatein, band lifafon mein.",                          life_stage: letters,    palette: inland,   motif: inland-letter,  cover: null }
```

**Chapter `yaadon-mein` special opening:** instead of a rangoli, the opening shows **four unlit diyas** in a row, each with a name label beneath (Badi Mausiji, Chhoti Mausiji, Manjhle Mamaji, Chhote Mamaji, in birth order). Copy: "Mamma, ye unke liye hain jo ab saath nahi, par hamesha saath hain. Ek ek karke diya jalaiye." Tapping lights each diya (same ignite animation, slower: 900ms). When all four are lit: "Unki baatein karein?" with "Haan" / "Phir kabhi". Tribute greetings (`placement: tribute`) appear at the end of this chapter as "Sabki yaadein unke baare mein".

### 4.4 Questions

**Name tokenisation (required at seed time).** For readability, the prompts below are written with names already filled in. The seed script must convert these exact strings into template variables before storing `prompt_template` / `subprompt_template`, so renaming a person in admin updates every question:

| Literal in text | Stored as |
|---|---|
| `Mamma` (address) | `{{addressWord}}` |
| `Papaji` | `{{papaji}}` |
| `Sunny` / `Mickey` / `Gunjan` | `{{sunny}}` / `{{mickey}}` / `{{gunjan}}` |
| `Nanaji` / `Naniji` | `{{nanaji}}` / `{{naniji}}` |
| `Badi Mausiji` / `Chhoti Mausiji` | `{{jiji_badi}}` / `{{jiji_chhoti}}` |
| `Bade Mamaji` / `Manjhle Mamaji` / `Sanjhle Mamaji` / `Chhote Mamaji` | `{{bhaiya_bade}}` / `{{bhaiya_manjhle}}` / `{{bhaiya_sanjhle}}` / `{{bhai_chhote}}` |
| `Badi Mamiji` | `{{bhaiya_bade.spouse}}` (spouse_call_name_by_kids) |
| `Delhi` | `{{hometown}}` |

Replace longest matches first (e.g. "Badi Mamiji" before "Mamma"). Generic words like "Jiji", "Jijiyon", "bhaiyon" stay literal.

Questions whose `asked_by` is only `gunjan` are written with "Mummy" (what Gunjan calls her); in those questions the literal `Mummy` is stored as `{{askerAddress}}`.

#### Adhyay 0: Janamdin Special (`janamdin`)
```yaml
- key: janamdin.bachpan-ka-janamdin
  prompt: "Mamma, bachpan mein Delhi wale ghar mein aapka janamdin kaise manaya jaata tha?"
  sub: "Koi khaas khana, naye kapde, Naniji ka koi tohfa… jo bhi yaad ho."
  followups: ["Kisi saal ka janamdin jo sabse zyada yaad hai?"]
  emotions: [yaadein, khushi]
  photo_slot: P-Q-BACHPAN-JANAMDIN
- key: janamdin.bhaiyon-ka-tohfa
  prompt: "Saat bhai-behenon wale ghar mein janamdin pe sabse zyada pyaar kaun dikhata tha?"
  sub: "Aur sabse zyada chidhata kaun tha?"
  emotions: [pyaar, hasi]
- key: janamdin.sabse-yaadgar-tohfa
  prompt: "Aaj tak ka sabse yaadgar tohfa kaunsa tha, aur kisne diya tha?"
  emotions: [khushi, pyaar]
- key: janamdin.papaji-wala
  prompt: "Shaadi ke baad Papaji ne pehla janamdin kaise manaya tha? Sach batana!"
  asked_by: [sunny, mickey]
  emotions: [pyaar, hasi]
- key: janamdin.humne-kab-bhula
  prompt: "Kabhi humne aapka janamdin bhula diya tha kya? Hum maafi maang lete hain pehle hi."
  asked_by: [sunny]
  emotions: [hasi, ladai-sulah]
- key: janamdin.khwahish
  prompt: "Is janamdin pe aapki ek khwahish kya hai, Mamma? Sach mein wali."
  sub: "Hum sun rahe hain."
  emotions: [sapne]
```

#### Adhyay 1: Shuruaat (`shuruaat`)
```yaml
- key: shuruaat.naam
  prompt: "Mamma, aapka naam kisne rakha tha? Uske peeche koi kahani hai?"
  sub: "Aur ghar mein sab aapko pyaar se kya bulaate the?"
  emotions: [yaadein]
- key: shuruaat.pehli-yaad
  prompt: "Aapko sabse pehli cheez kya yaad hai? Bilkul pehli."
  sub: "Aankhein band kariye. Koi rang, koi aawaaz, koi chehra…"
  emotions: [yaadein]
- key: shuruaat.chidhana
  prompt: "Bachpan mein bhai-behen aapko kis naam se chidhate the?"
  emotions: [hasi]
- key: shuruaat.kaisi-bachchi
  prompt: "Aap bachpan mein kaisi thi? Shant, shararti, ya ziddi?"
  sub: "Naniji kya kehti thi aapke baare mein?"
  emotions: [hasi, yaadein]
- key: shuruaat.pehli-photo
  prompt: "Ye aapki sabse purani photo hai jo humein mili. Is din ke baare mein kuch yaad hai?"
  emotions: [yaadein]
  photo_slot: P-Q-BACHPAN-PHOTO
```

#### Adhyay 2: Delhi Wala Ghar (`delhi-ghar`)
```yaml
- key: delhi-ghar.darwaza
  prompt: "Aankhein band karke Delhi wale ghar ke darwaze se andar aaiye. Kya dikhta hai?"
  sub: "Aangan, seedhiyan, chhat, kaunsa kamra kiska tha… dheere dheere batao."
  emotions: [yaadein]
  photo_slot: P-Q-DELHI-GHAR
- key: delhi-ghar.mohalla
  prompt: "Ghar kis mohalle mein tha? Wo gali kaisi thi, padosi kaise the?"
  followups: ["Koi padosi jo ghar ke jaise hi the?"]
  emotions: [yaadein]
- key: delhi-ghar.rasoi
  prompt: "Naniji ki rasoi kaisi mehekti thi? Koi ek khushboo jo aaj bhi yaad hai?"
  emotions: [yaadein, pyaar]
- key: delhi-ghar.garmi
  prompt: "Delhi ki garmi ki chhuttiyan kaise beet-ti thi? Chhat pe sona, matke ka paani, aam, kulfi… sab batao."
  emotions: [yaadein, khushi]
- key: delhi-ghar.sardi
  prompt: "Aur Delhi ki sardi? Dhoop mein baith ke moongphali, gajak, rewari… kaun sabse zyada kha jaata tha?"
  emotions: [yaadein, hasi]
- key: delhi-ghar.diwali
  prompt: "Diwali ki tayyari kaise hoti thi? Safai, mithai, patakhe… aapki duty kya hoti thi?"
  emotions: [yaadein, khushi]
- key: delhi-ghar.dussehra-ramlila
  prompt: "Dussehra pe Ramlila dekhne jaate the? Kiske saath, aur kaisa lagta tha?"
  emotions: [yaadein, khushi]
- key: delhi-ghar.ghoomna
  prompt: "Bachpan mein Delhi mein ghoomne kahan jaate the? India Gate, Chandni Chowk, Qutub Minar…?"
  sub: "Koi ek trip jo aaj bhi yaad hai."
  emotions: [khushi, yaadein]
- key: delhi-ghar.tv-radio
  prompt: "Ghar mein pehla TV ya radio kab aaya tha? Sab milke kya dekhte ya sunte the?"
  sub: "Chitrahaar, Sunday ki filmein, Vividh Bharati…"
  emotions: [yaadein, khushi]
- key: delhi-ghar.aawaaz
  prompt: "Us ghar ki koi aawaaz jo aap ek baar phir sunna chahengi?"
  sub: "Mandir ki ghanti, sabziwale ki pukaar, kisi ki hasi…"
  emotions: [kami, yaadein]
  weight: medium
- key: delhi-ghar.akela-kona
  prompt: "Ghar ka wo kona kaunsa tha jahan aap akele baithna pasand karti thi?"
  emotions: [yaadein]
```

#### Adhyay 3: Nanaji aur Naniji (`nanaji-naniji`)
```yaml
- key: nanaji-naniji.naniji-haath
  prompt: "Naniji ke haath kaise the, Mamma? Wo hamesha kya karte rehte the?"
  emotions: [pyaar, yaadein]
  weight: medium
  photo_slot: P-Q-NANAJI-NANIJI
- key: nanaji-naniji.nanaji-baat
  prompt: "Nanaji ki koi baat jo aaj bhi aapke kaan mein goonjti hai?"
  emotions: [pyaar, seekh]
  weight: medium
- key: nanaji-naniji.kaam
  prompt: "Nanaji kya kaam karte the? Ghar ka kharcha kaise chalta tha saat bachchon ke saath?"
  emotions: [himmat, yaadein]
  weight: medium
- key: nanaji-naniji.daant
  prompt: "Sabse zyada daant kisse padti thi, Nanaji se ya Naniji se? Aur kis baat pe?"
  emotions: [hasi, yaadein]
- key: nanaji-naniji.ladli
  prompt: "Saat bachchon mein Nanaji ka ladla ya ladli kaun tha? Sach batana!"
  emotions: [hasi, pyaar]
- key: nanaji-naniji.bina-kahe
  prompt: "Unhone kabhi khul ke nahi kaha, par aapko pata tha ki wo aapse kitna pyaar karte the. Kaise pata chalta tha?"
  emotions: [pyaar]
  weight: medium
- key: nanaji-naniji.naniji-sikhaya
  prompt: "Naniji ne aapko kya sikhaya jo aapne humein bhi sikhaya?"
  sub: "Koi dish, koi aadat, koi pooja, koi kahawat…"
  emotions: [seekh, pyaar]
- key: nanaji-naniji.pooch-nahi-paayi
  prompt: "Unse koi baat jo aap poochhna chahti thi, par poochh nahi paayi?"
  emotions: [kami, dard]
  weight: heavy
  tags: [death]
  condition: "nanaji.is_alive == false || naniji.is_alive == false"
- key: nanaji-naniji.unki-jaisi
  prompt: "Aap mein Naniji jaisa kya hai, aur Nanaji jaisa kya?"
  emotions: [pyaar, seekh]
```

#### Adhyay 4: Saat Bhai-Behen (`saat-bhai-behen`)
```yaml
- key: bhai-behen.mahaul
  prompt: "Saat bachche ek ghar mein! Ghar ka mahaul kaisa hota tha, Mamma?"
  sub: "Shor, ladai, khana, sona… sab kaise hota tha?"
  emotions: [yaadein, hasi]
  photo_slot: P-Q-SAATON
- key: bhai-behen.sona-kaise
  prompt: "Garmi mein sab chhat pe sote the? Kiske paas sone ke liye ladai hoti thi?"
  emotions: [hasi, yaadein]
- key: bhai-behen.sabse-badi-ladai
  prompt: "Bhai-behenon mein sabse badi ladai kis baat pe hui thi? Aur phir sulah kaise hui?"
  emotions: [ladai-sulah, hasi]
- key: bhai-behen.mithai-hissa
  prompt: "Mithai ya khane ka bada hissa kiske paas jaata tha? Aur aap apna hissa kaise bachati thi?"
  emotions: [hasi]
- key: bhai-behen.khel
  prompt: "Aap sab milke kaunse khel khelte the?"
  sub: "Pithu, kho-kho, stapu, ludo, carrom, patang…"
  emotions: [khushi, yaadein]
- key: bhai-behen.patang
  prompt: "Patang udane mein aap bhaiyon ki madad karti thi ya khud udati thi? Charkhi kaun pakadta tha?"
  emotions: [khushi, hasi]
- key: bhai-behen.rakhi
  prompt: "Chaar bhaiyon ko rakhi! Wo din kaisa hota tha? Sabse achha tohfa kisne diya tha?"
  emotions: [pyaar, yaadein]
  photo_slot: P-Q-RAKHI
- key: bhai-behen.bhai-dooj
  prompt: "Bhai Dooj pe tika kaise hota tha? Koi saal jo khaas yaad hai?"
  emotions: [pyaar, yaadein]
- key: bhai-behen.kaun-bachata
  prompt: "Jab aapko daant padti thi, toh kaun bachane aata tha?"
  emotions: [pyaar]
- key: bhai-behen.chugli
  prompt: "Kaun sabse zyada chugli karta tha Nanaji-Naniji se? Aur aapne kabhi kiski chugli ki?"
  emotions: [hasi, ladai-sulah]
- key: bhai-behen.raaz
  prompt: "Koi raaz jo aap bhai-behenon ne milke Nanaji-Naniji se chhupaya tha?"
  sub: "Ab toh bata sakti hain!"
  emotions: [hasi]
- key: bhai-behen.ek-saath-photo
  prompt: "Ye photo dekhiye. Ye kab ki hai, aur us din kya hua tha?"
  emotions: [yaadein, kami]
  weight: medium
  photo_slot: P-Q-SIBLINGS-GROUP
```

#### Adhyay 5: Badi Jiji, Chhoti Jiji (`jiji`)
> Both sisters have passed. This chapter is about **light, living memories** (braids, clothes, weddings, care). The heavier "missing them" questions are in `yaadon-mein`. Light-weight here is deliberate, but every question uses past tense and warm framing. Admin may set the whole chapter to `medium`.
```yaml
- key: jiji.choti-banana
  prompt: "Mamma, bachpan mein aapki choti kaun banati thi? Badi Mausiji ya Chhoti Mausiji?"
  sub: "Aur kaun zor se khinchti thi?"
  emotions: [pyaar, hasi]
- key: jiji.kapde-chappal
  prompt: "Jijiyon ke kapde, chappal, chudiyan… chupke se pehne kabhi? Pakdi gayi thi?"
  emotions: [hasi]
- key: jiji.badi-jiji-kaisi
  prompt: "Badi Mausiji kaisi thi? Unki koi aadat jo aap mein bhi aa gayi?"
  emotions: [pyaar, yaadein]
  weight: medium
  photo_slot: P-Q-JIJI-BADI
- key: jiji.chhoti-jiji-kaisi
  prompt: "Chhoti Mausiji ke saath aapki jodi kaisi thi? Saheli jaisi ya didi jaisi?"
  emotions: [pyaar, yaadein]
  weight: medium
  photo_slot: P-Q-JIJI-CHHOTI
- key: jiji.badi-jiji-shaadi
  prompt: "Badi Mausiji ki shaadi aapko yaad hai? Aapne kya pehna tha, kya kiya tha, kis gaane pe naachi thi?"
  emotions: [khushi, yaadein]
- key: jiji.ghar-khali
  prompt: "Jab Jijiyon ki shaadi ho gayi, ghar kaisa lagne laga? Aapki zimmedariyan badh gayi thi kya?"
  emotions: [kami, himmat]
  weight: medium
- key: jiji.chitthi
  prompt: "Shaadi ke baad Jijiyon se baat kaise hoti thi? Chitthi, phone, ya milne jaana?"
  emotions: [kami, pyaar]
  weight: medium
- key: jiji.unki-salah
  prompt: "Aapki shaadi ke time Jijiyon ne aapko kya samjhaya tha?"
  emotions: [seekh, pyaar]
  weight: medium
```

#### Adhyay 6: Bhaiya Log (`bhaiya-log`)
> Living brothers get light, playful questions. Departed brothers get one gentle, light-memory question here; the deeper ones live in `yaadon-mein`.
```yaml
- key: bhaiya-log.bade-shararat
  prompt: "Bade Mamaji ke saath bachpan ki koi shararat jo yaad karke aaj bhi hasi aati hai?"
  emotions: [hasi, pyaar]
  photo_slot: P-Q-BADE-MAMAJI
- key: bhaiya-log.bade-rakhwala
  prompt: "Bade Mamaji sabse bade the. Kya wo aapke liye doosre Nanaji jaise the? Unse darr lagta tha ya pyaar?"
  emotions: [pyaar, yaadein]
- key: bhaiya-log.bade-scooter
  prompt: "Bade Mamaji kabhi aapko cycle ya scooter pe ghumane le jaate the? Kahan?"
  emotions: [khushi, yaadein]
- key: bhaiya-log.sanjhle-ladai
  prompt: "Sanjhle Mamaji se sabse zyada ladai kis baat pe hoti thi? Remote, radio, ya khaana?"
  emotions: [ladai-sulah, hasi]
  photo_slot: P-Q-SANJHLE-MAMAJI
- key: bhaiya-log.sanjhle-saathi
  prompt: "Sanjhle Mamaji aur aap milke kya kya karte the jo baaki kisi ko pata nahi tha?"
  emotions: [hasi, pyaar]
- key: bhaiya-log.manjhle-hasi
  prompt: "Manjhle Mamaji kaise the bachpan mein? Unki koi mazedaar baat?"
  sub: "Bas ek chhoti si yaad bhi chalegi."
  emotions: [hasi, kami]
  weight: medium
- key: bhaiya-log.chhote-god
  prompt: "Chhote Mamaji sabse chhote the. Aapne unhe god mein khilaya tha? Wo aapke peeche peeche ghoomte the?"
  emotions: [pyaar, kami]
  weight: medium
- key: bhaiya-log.bhabhi-aayi
  prompt: "Jab Bade Mamaji ki shaadi hui aur Badi Mamiji ghar aayi, aapko kaisa laga? Unse dosti kaise hui?"
  emotions: [khushi, yaadein]
- key: bhaiya-log.bhaiyon-ne-kya-kiya
  prompt: "Aapki shaadi mein bhaiyon ne kya kya kiya tha? Koi bhai roya tha?"
  emotions: [pyaar, kami]
  weight: medium
- key: bhaiya-log.aaj-bhi
  prompt: "Aaj bhi Bade Mamaji aur Sanjhle Mamaji se baat hoti hai toh kya baatein hoti hain?"
  emotions: [pyaar]
```

#### Adhyay 7: School, Saheliyan aur Shararatein (`school`)
```yaml
- key: school.kaunsa
  prompt: "Mamma, aap kaunse school mein padhi? School tak kaise jaati thi?"
  sub: "Paidal, rickshaw, DTC bus…?"
  emotions: [yaadein]
  photo_slot: P-Q-SCHOOL
- key: school.kaisi-student
  prompt: "School mein aap kaisi student thi? Sach batana!"
  emotions: [hasi]
- key: school.favourite-teacher
  prompt: "Koi teacher jo aaj bhi yaad hain? Kyun?"
  emotions: [yaadein, shukriya]
- key: school.saheli
  prompt: "Aapki sabse pakki saheli kaun thi? Dono milke kya karti thi?"
  followups: ["Aaj bhi unse baat hoti hai?"]
  emotions: [khushi, hasi]
- key: school.tiffin
  prompt: "Tiffin mein kya le jaati thi? Kiska tiffin chura ke khaati thi?"
  emotions: [hasi, yaadein]
- key: school.pakdi-gayi
  prompt: "Kabhi school ya ghar mein koi shararat karte hue pakdi gayi ho?"
  emotions: [hasi]
- key: school.result
  prompt: "Result wala din kaisa hota tha ghar mein? Nanaji kya kehte the?"
  emotions: [yaadein, hasi]
```

#### Adhyay 8: Jab Mamma Jawan Thi (`jawani`)
```yaml
- key: jawani.gaana
  prompt: "Koi gaana jo sunte hi aap solah saal ki ho jaati ho?"
  sub: "Gungunao bhi toh chalega."
  emotions: [khushi, yaadein]
- key: jawani.cinema
  prompt: "Pehli baar cinema hall mein kaunsi film dekhi thi? Kiske saath, aur ghar pe pata chala tha?"
  emotions: [khushi, hasi]
- key: jawani.hero
  prompt: "Aapka favourite hero aur heroine kaun the? Unki kaunsi film baar baar dekhi?"
  emotions: [khushi, hasi]
- key: jawani.fashion
  prompt: "Us zamane mein aapka fashion kya tha? Koi suit ya saree jo aapko bahut pasand tha?"
  emotions: [khushi, yaadein]
  photo_slot: P-Q-JAWANI
- key: jawani.sapna
  prompt: "Badi hokar aap kya banna chahti thi, Mamma?"
  followups: ["Wo sapna kahan gaya?"]
  emotions: [sapne]
  weight: medium
- key: jawani.shopping
  prompt: "Shopping karne kahan jaati thi? Kamla Nagar, Karol Bagh, Lajpat Nagar, Sarojini…?"
  emotions: [khushi, yaadein]
- key: jawani.azaadi
  prompt: "Kya ghar mein ladkiyon ke liye zyada rok-tok thi? Aapne kabhi koi niyam toda?"
  emotions: [himmat, hasi]
  weight: medium
```

#### Adhyay 9: Rishta aur Shaadi (`rishta-shaadi`)
```yaml
- key: rishta.pehli-baar-suna
  prompt: "Mamma, Papaji ke baare mein pehli baar kab suna tha? Kisne bataya?"
  emotions: [yaadein, hasi]
- key: rishta.pehli-mulaqat
  prompt: "Papaji se pehli baar kab mili thi? Pehli nazar mein kya laga?"
  sub: "Sach batana, Papaji nahi sun rahe."
  emotions: [pyaar, hasi]
- key: rishta.papaji-ka-sawaal
  prompt: "Mujhe pehli baar dekh ke aapne kya socha tha? Sach sach."
  asked_by: [papaji]
  emotions: [pyaar, hasi]
- key: rishta.marzi
  prompt: "Rishta kaise pakka hua? Aapki kya marzi thi, aur ghar mein kisne kya kaha?"
  emotions: [yaadein]
  weight: medium
  tags: [marriage]
- key: rishta.bhaiyon-ki-jaanch
  prompt: "Bhaiyon ne Papaji ki 'jaanch' kaise ki thi? Kisi ne koi sawaal poochha tha?"
  emotions: [hasi, pyaar]
- key: rishta.shaadi-ka-din
  prompt: "Shaadi wala din kaisa tha? Aapka joda kaisa tha, mehendi kaisi rachi thi?"
  emotions: [khushi, yaadein]
  photo_slot: P-Q-SHAADI
- key: rishta.shaadi-ka-kissa
  prompt: "Shaadi mein koi mazedaar kissa hua tha? Joote churai mein kitne paise mile?"
  emotions: [hasi, khushi]
- key: rishta.bidaai
  prompt: "Bidaai wala din kaisa tha, Mamma?"
  sub: "Jitna mann ho utna hi batana."
  emotions: [kami, pyaar]
  weight: heavy
  tags: [marriage]
- key: rishta.mayke-ki-yaad
  prompt: "Shaadi ke baad mayke ki sabse zyada yaad kis cheez ki aati thi?"
  emotions: [kami, yaadein]
  weight: medium
```

#### Adhyay 10: Sasural, Naya Ghar (`sasural`)
```yaml
- key: sasural.pehla-din
  prompt: "Sasural mein pehla din kaisa laga? Kisne sabse pehle apnapan dikhaya?"
  emotions: [yaadein, shukriya]
  weight: medium
  tags: [inlaws]
- key: sasural.pehli-rasoi
  prompt: "Sasural mein pehli baar kya banaya tha? Sabne kya kaha?"
  emotions: [hasi, yaadein]
- key: sasural.naye-niyam
  prompt: "Sasural ke kaunse tareeke aapke mayke se bilkul alag the?"
  emotions: [hasi, yaadein]
  tags: [inlaws]
- key: sasural.pehli-karva-chauth
  prompt: "Pehla Karva Chauth kaisa tha? Chaand kitni der se nikla tha?"
  emotions: [pyaar, hasi]
- key: sasural.ghar-banaya
  prompt: "Kab laga ki ye ghar ab aapka apna ghar hai?"
  emotions: [pyaar, himmat]
  weight: medium
- key: sasural.mayke-jaana
  prompt: "Shaadi ke baad pehli baar mayke gayi, tab bhai-behenon ne kaise swagat kiya?"
  emotions: [pyaar, khushi]
```

#### Adhyay 11: Papaji aur Aap (`papaji-aur-aap`)
```yaml
- key: papaji.choti-aadat
  prompt: "Papaji ki koi choti si aadat jispe aapko aaj bhi pyaar aata hai?"
  emotions: [pyaar]
- key: papaji.chidhaane-wali-aadat
  prompt: "Aur Papaji ki kaunsi aadat se aaj bhi gussa aata hai? Ye bhi batao!"
  emotions: [hasi, ladai-sulah]
- key: papaji.ladai-sulah
  prompt: "Aap dono ki sabse mazedaar ladai kis baat pe hui thi? Aur sulah kisne ki?"
  emotions: [ladai-sulah, hasi]
- key: papaji.pehli-trip
  prompt: "Papaji ke saath pehli baar kahan ghoomne gayi thi?"
  emotions: [khushi, pyaar]
  photo_slot: P-Q-PAPAJI-TRIP
- key: papaji.papaji-ka-sawaal-2
  prompt: "Itne saalon mein maine aapke liye sabse achha kya kiya? Aur kya nahi kar paya?"
  asked_by: [papaji]
  emotions: [pyaar, shukriya]
  weight: medium
- key: papaji.mushkil-mein-saath
  prompt: "Kabhi koi mushkil waqt jab Papaji ne aapka saath diya, ya aapne unka?"
  emotions: [himmat, pyaar]
  weight: medium
- key: papaji.jodi-ka-raaz
  prompt: "Itne saal saath rehne ka raaz kya hai, Mamma?"
  emotions: [seekh, pyaar]
```

#### Adhyay 12: Sunny Aaya (`sunny-aaya`)
```yaml
- key: sunny.pata-chala
  prompt: "Mamma, jab pata chala ki main aane wala hoon, aapne sabse pehle kise bataya?"
  asked_by: [sunny]
  emotions: [khushi, pyaar]
- key: sunny.janam
  prompt: "Mere janam wala din… jo bhi yaad hai, sab batao."
  sub: "Kaunsa hospital, kaun saath tha, mausam kaisa tha…"
  asked_by: [sunny]
  emotions: [pyaar, khushi]
  photo_slot: P-Q-SUNNY-BABY
- key: sunny.pehli-baar-god
  prompt: "Mujhe pehli baar god mein liya, tab kya socha tha?"
  asked_by: [sunny]
  emotions: [pyaar]
- key: sunny.naam
  prompt: "Mera naam 'Sunny' kisne rakha? Aur asli naam kaise chuna?"
  asked_by: [sunny]
  emotions: [yaadein, hasi]
- key: sunny.mama-log
  prompt: "Mamaji log aur Mausiji log mujhe pehli baar dekhne aaye toh kya laaye, kya bole?"
  asked_by: [sunny]
  emotions: [pyaar, yaadein]
- key: sunny.pareshan
  prompt: "Bachpan mein maine aapko sabse zyada kab pareshan kiya? Sach batao, main sun sakta hoon."
  asked_by: [sunny]
  emotions: [hasi, ladai-sulah]
- key: sunny.pehla-din-school
  prompt: "Mera school ka pehla din yaad hai? Kaun zyada roya tha, main ya aap?"
  asked_by: [sunny]
  emotions: [hasi, pyaar]
- key: sunny.garv
  prompt: "Kab mujh pe sabse zyada garv hua, par aapne kabhi bataya nahi?"
  asked_by: [sunny]
  emotions: [garv, pyaar]
  weight: medium
```

#### Adhyay 13: Mickey Ka Aana (`mickey-aaya`)
> Mickey's gender is `CONFIRM`; these prompts avoid gendered verbs. After gender is set, admin may refine wording with `{{g mickey ...}}`.
```yaml
- key: mickey.pata-chala
  prompt: "Mamma, jab pata chala ki ghar mein ek aur bachcha aane wala hai, Sunny ka kya reaction tha?"
  asked_by: [mickey]
  emotions: [hasi, khushi]
- key: mickey.janam
  prompt: "Mere janam wala din… jo bhi yaad hai, sab batao."
  sub: "Kaun saath tha, Sunny kahan tha, kaisa laga…"
  asked_by: [mickey]
  emotions: [pyaar, khushi]
  photo_slot: P-Q-MICKEY-BABY
- key: mickey.naam
  prompt: "Mera naam 'Mickey' kaise pada? Ye kiska idea tha?"
  asked_by: [mickey]
  emotions: [hasi, yaadein]
- key: mickey.pehli-baar-god
  prompt: "Mujhe pehli baar god mein lene pe kya mehsoos hua? Doosri baar Mamma banna alag tha?"
  asked_by: [mickey]
  emotions: [pyaar]
- key: mickey.shararat
  prompt: "Meri sabse badi shararat kaunsi thi jo aapne Papaji se chhupa li?"
  asked_by: [mickey]
  emotions: [hasi]
- key: mickey.dono-ki-ladai
  prompt: "Sunny aur meri ladai mein aap kiski side leti thi? Ab toh sach bata do!"
  asked_by: [mickey, sunny]
  emotions: [hasi, ladai-sulah]
- key: mickey.garv
  prompt: "Kab mujh pe sabse zyada garv hua, par aapne kabhi kaha nahi?"
  asked_by: [mickey]
  emotions: [garv, pyaar]
  weight: medium
```

#### Adhyay 14: Maa Banna (`maa-banna`)
```yaml
- key: maa-banna.darr
  prompt: "Maa bante waqt sabse zyada darr kis baat ka lagta tha?"
  emotions: [himmat]
  weight: medium
- key: maa-banna.naniji-ki-seekh
  prompt: "Naniji ne aapko Maa banne ke baare mein kya sikhaya tha?"
  emotions: [seekh, pyaar]
- key: maa-banna.lori
  prompt: "Humein sulane ke liye kaunsi lori ya kahani sunati thi? Ek baar phir suna do."
  sub: "Bol ke hi sunana, Mamma."
  emotions: [pyaar, yaadein]
- key: maa-banna.bimari
  prompt: "Hum mein se koi bimaar padta tha toh aapki raatein kaisi hoti thi?"
  emotions: [himmat, pyaar]
  weight: medium
- key: maa-banna.dono-alag
  prompt: "Sunny aur Mickey mein sabse bada fark kya tha bachpan mein?"
  emotions: [hasi, pyaar]
- key: maa-banna.chupke-garv
  prompt: "Kabhi chupke se hum dono pe garv hua ho, par kabhi bataya na ho?"
  asked_by: [sunny, mickey]
  emotions: [garv, pyaar]
  weight: medium
- key: maa-banna.jo-chhoda
  prompt: "Humare liye aapne kya chhoda jo shayad humne kabhi notice hi nahi kiya?"
  asked_by: [sunny, mickey]
  emotions: [pyaar, kami]
  weight: heavy
- key: maa-banna.apne-liye-waqt
  prompt: "Hum chhote the tab aap apne liye waqt kab nikaalti thi? Nikaalti bhi thi?"
  emotions: [himmat, hasi]
```

#### Adhyay 15: Ghar, Zimmedari aur Beech ke Saal (`beech-ke-saal`)
```yaml
- key: beech.ghar-chalana
  prompt: "Ghar kaise chalaya jaata hai, iska asli raaz kya hai, Mamma?"
  emotions: [seekh, hasi]
- key: beech.bachat
  prompt: "Kabhi chupke se paise bacha ke rakhe the? Kis cheez ke liye?"
  sub: "Atte ke dabbe wale paise bhi count honge!"
  emotions: [hasi, himmat]
- key: beech.himmat
  prompt: "Kab aap itni himmat wali bani jitna kisi ko pata bhi nahi chala?"
  emotions: [himmat]
  weight: heavy
- key: beech.sabse-khushi-ka-saal
  prompt: "Shaadi ke baad ka sabse khushi wala saal kaunsa tha? Kyun?"
  emotions: [khushi]
- key: beech.naya-sikha
  prompt: "Bachche bade ho gaye toh aapne apne liye kya naya seekha ya shuru kiya?"
  emotions: [sapne, garv]
- key: beech.mushkil-faisla
  prompt: "Koi mushkil faisla jo aapne liya, aur aaj lagta hai sahi tha?"
  emotions: [himmat, seekh]
  weight: medium
- key: beech.ghar-khali
  prompt: "Jab hum padhai ya kaam ke liye bahar gaye, ghar kaisa lagne laga?"
  asked_by: [sunny, mickey]
  emotions: [kami, pyaar]
  weight: medium
```

#### Adhyay 16: Gunjan aur Naye Rishte (`gunjan-naye-rishte`)
```yaml
- key: gunjan.pehli-baar
  prompt: "Mummy, mujhe pehli baar dekh ke aapne kya socha tha? Sach sach batana."
  asked_by: [gunjan]
  emotions: [pyaar, hasi]
  photo_slot: P-Q-GUNJAN-FIRST
- key: gunjan.sunny-ne-bataya
  prompt: "Sunny ne aapko mere baare mein sabse pehle kya bataya tha?"
  asked_by: [gunjan]
  emotions: [hasi, pyaar]
- key: gunjan.sunny-ki-shaadi
  prompt: "Mamma, meri shaadi wale din aapko kaisa lag raha tha? Aapki shaadi yaad aayi?"
  asked_by: [sunny]
  emotions: [pyaar, khushi]
  photo_slot: P-Q-SUNNY-WEDDING
- key: gunjan.saas-banna
  prompt: "Saas banne pe kya socha tha? Apni saas jaisi banna hai ya bilkul alag?"
  emotions: [hasi, seekh]
  weight: medium
  tags: [inlaws]
- key: gunjan.sunny-ka-raaz
  prompt: "Mummy, Sunny ki koi bachpan ki baat batao jo usne mujhe kabhi nahi batayi!"
  asked_by: [gunjan]
  emotions: [hasi]
- key: gunjan.recipe
  prompt: "Mummy, aapki kaunsi recipe aap mujhe sabse pehle sikhana chahengi? Abhi bata do, step by step."
  asked_by: [gunjan]
  emotions: [pyaar, seekh]
- key: gunjan.ummeed
  prompt: "Gunjan aur Sunny ke liye aapki sabse badi dua kya hai?"
  emotions: [pyaar]
  weight: medium
- key: gunjan.nani-dadi
  prompt: "Jab aap Dadi ya Nani banengi, toh kaisi Dadi-Nani banna chahengi?"
  emotions: [sapne, hasi]
```

#### Adhyay 17: Jo Yaadon Mein Hain (`yaadon-mein`, gated)
> Every question is `heavy` (gate shown). Ordered by sibling birth order. Framing: laughter, habits, love. Never "how did they die". Each departed sibling has 3 questions; the "ek baat kehni ho" ones are `sealed_default`.
```yaml
# Badi Mausiji
- key: yaadon.jiji_badi.hasi
  prompt: "Badi Mausiji ki koi baat jo yaad karke aaj bhi hasi aa jaati hai?"
  sub: "Unki koi aadat, koi dialogue, koi shararat…"
  emotions: [hasi, kami]
  weight: heavy
  tags: [death]
  photo_slot: P-Q-JIJI-BADI
- key: yaadon.jiji_badi.sikhaya
  prompt: "Badi Mausiji ne aapko kya sikhaya jo aap aaj bhi karti ho?"
  emotions: [seekh, kami]
  weight: heavy
  tags: [death]
- key: yaadon.jiji_badi.kehna
  prompt: "Agar aaj Badi Mausiji se ek baat keh paati, toh kya kehti?"
  emotions: [kami, pyaar]
  weight: heavy
  sealed_default: true
  tags: [death]

# Chhoti Mausiji
- key: yaadon.jiji_chhoti.hasi
  prompt: "Chhoti Mausiji ki koi baat jo yaad karke aaj bhi hasi aa jaati hai?"
  emotions: [hasi, kami]
  weight: heavy
  tags: [death]
  photo_slot: P-Q-JIJI-CHHOTI
- key: yaadon.jiji_chhoti.saath
  prompt: "Chhoti Mausiji ke saath aakhri baar kab khul ke hasi thi? Kya baat thi?"
  emotions: [kami, khushi]
  weight: heavy
  tags: [death]
- key: yaadon.jiji_chhoti.kehna
  prompt: "Agar aaj Chhoti Mausiji se ek baat keh paati, toh kya kehti?"
  emotions: [kami, pyaar]
  weight: heavy
  sealed_default: true
  tags: [death]

# Manjhle Mamaji
- key: yaadon.bhaiya_manjhle.hasi
  prompt: "Manjhle Mamaji ki koi baat jo yaad karke aaj bhi hasi aa jaati hai?"
  emotions: [hasi, kami]
  weight: heavy
  tags: [death]
  photo_slot: P-Q-MANJHLE-MAMAJI
- key: yaadon.bhaiya_manjhle.pasand
  prompt: "Manjhle Mamaji ko kya khana sabse pasand tha? Aap unke liye kya banati thi?"
  emotions: [pyaar, kami]
  weight: heavy
  tags: [death]
- key: yaadon.bhaiya_manjhle.kehna
  prompt: "Agar aaj Manjhle Mamaji se ek baat keh paati, toh kya kehti?"
  emotions: [kami, pyaar]
  weight: heavy
  sealed_default: true
  tags: [death]

# Chhote Mamaji
- key: yaadon.bhai_chhote.hasi
  prompt: "Chhote Mamaji ki koi baat jo yaad karke aaj bhi hasi aa jaati hai?"
  emotions: [hasi, kami]
  weight: heavy
  tags: [death]
  photo_slot: P-Q-CHHOTE-MAMAJI
- key: yaadon.bhai_chhote.rakhi
  prompt: "Chhote Mamaji ke saath ki koi Rakhi ya Bhai Dooj jo sabse zyada yaad hai?"
  emotions: [pyaar, kami]
  weight: heavy
  tags: [death]
- key: yaadon.bhai_chhote.kehna
  prompt: "Agar aaj Chhote Mamaji se ek baat keh paati, toh kya kehti?"
  emotions: [kami, pyaar]
  weight: heavy
  sealed_default: true
  tags: [death]

# All of them
- key: yaadon.sab-milke
  prompt: "Agar saaton bhai-behen ek din ke liye phir se Delhi wale ghar ki chhat pe ikatthe ho jaayein, toh kya karenge?"
  sub: "Ek sapna hi sahi, Mamma."
  emotions: [kami, khushi, pyaar]
  weight: heavy
  tags: [death]
- key: yaadon.kaise-yaad-karti
  prompt: "Aap unhe kaise yaad karti ho? Koi pooja, koi gaana, koi din?"
  emotions: [kami, pyaar]
  weight: heavy
  tags: [death]
```
Note: chapter ends on `yaadon.kaise-yaad-karti`, which is gentle. The chapter opening has the four-diya ritual (section 4.3), and its tribute greetings follow the last question, so the chapter closes with others' warm memories, not with grief.

#### Adhyay 18: Choti Choti Khushiyan (`khushiyan`)
```yaml
- key: khushiyan.aam-sa-din
  prompt: "Ek bilkul aam sa din jo aaj bhi sabse khoobsurat lagta hai?"
  emotions: [khushi]
- key: khushiyan.hasi
  prompt: "Kis baat pe aap itna hasti ho ki aansu aa jaate hain?"
  emotions: [hasi]
- key: khushiyan.recipe
  prompt: "Aapki wo dish jo sirf aap hi sahi banati ho. Recipe batao, andaaze se nahi, sach mein!"
  sub: "Bol ke batana best rahega. Hum likh lenge."
  emotions: [pyaar, hasi]
- key: khushiyan.saree
  prompt: "Aapki sabse pasandeeda saree ya suit kaunsa hai? Uski kahani kya hai?"
  emotions: [khushi, yaadein]
- key: khushiyan.chai
  prompt: "Aapki perfect chai kaisi hoti hai, aur kiske saath peena sabse achha lagta hai?"
  emotions: [khushi, pyaar]
- key: khushiyan.gaana-aaj
  prompt: "Aajkal kaunsa gaana sun ke aapka mood achha ho jaata hai?"
  emotions: [khushi]
```

#### Adhyay 19: Aaj Ki Mamma (`aaj-ki-mamma`)
```yaml
- key: aaj.subah
  prompt: "Mamma, aapki subah kaise shuru hoti hai? Pehla kaam kya hota hai?"
  emotions: [yaadein]
- key: aaj.apna-din
  prompt: "Agar ek din sirf apne liye mile, koi zimmedari nahi, toh kya karogi?"
  emotions: [sapne, khushi]
- key: aaj.ghoomna
  prompt: "Ek jagah jahan aap abhi bhi jaana chahti ho? Hum le chalenge."
  emotions: [sapne]
- key: aaj.seekhna
  prompt: "Kuch naya jo aap abhi seekhna chahti ho?"
  emotions: [sapne]
- key: aaj.humse-shikayat
  prompt: "Humse koi ek shikayat? Aaj sab maaf hai, khul ke bolo."
  asked_by: [sunny, mickey, gunjan]
  emotions: [hasi, ladai-sulah]
- key: aaj.khush-kya-karta
  prompt: "Hum aisa kya karein jisse aapko sabse zyada khushi milti hai?"
  asked_by: [sunny, mickey, gunjan]
  emotions: [pyaar]
```

#### Adhyay 20: Jo Aapne Seekha (`seekh`)
```yaml
- key: seekh.bees-saal
  prompt: "Bees saal ki apne aap ko ek baat kehni ho, toh kya kahogi?"
  emotions: [seekh]
  weight: medium
- key: seekh.zaroori
  prompt: "Pehle jo cheezein bahut zaroori lagti thi, ab nahi lagti. Kaunsi? Aur ab kya zaroori lagta hai?"
  emotions: [seekh]
  weight: medium
- key: seekh.rishte
  prompt: "Itne bade parivaar mein rishte nibhane ka raaz kya hai?"
  emotions: [seekh, pyaar]
- key: seekh.gussa
  prompt: "Gussa aaye toh aap kya karti ho? Humein bhi sikha do."
  emotions: [seekh, hasi]
- key: seekh.kahawat
  prompt: "Naniji ki ya aapki koi kahawat jo hamesha sahi nikli?"
  emotions: [seekh, yaadein]
- key: seekh.yaad-rakhein
  prompt: "Aap chahti ho log aapko kaise yaad rakhein?"
  emotions: [seekh, pyaar]
  weight: medium
```

#### Adhyay 21: Chitthiyan (`chitthiyan`, sealable)
```yaml
- key: chitthi.sunny
  prompt: "Sunny ke liye ek chitthi. Jo dil mein hai, bol do."
  emotions: [pyaar]
  weight: medium
  sealed_default: true
- key: chitthi.mickey
  prompt: "Mickey ke liye ek chitthi. Jo dil mein hai, bol do."
  emotions: [pyaar]
  weight: medium
  sealed_default: true
- key: chitthi.gunjan
  prompt: "Gunjan ke liye ek chitthi, apni bahu ke liye."
  emotions: [pyaar]
  weight: medium
  sealed_default: true
- key: chitthi.papaji
  prompt: "Papaji ke liye ek baat jo aap unse kabhi keh nahi paayi."
  emotions: [pyaar]
  weight: medium
  sealed_default: true
- key: chitthi.bhaiyon-ke-liye
  prompt: "Bade Mamaji aur Sanjhle Mamaji ke liye ek chitthi. Unhe sunaayein?"
  sub: "Aap chahein toh hum unhe bhej denge."
  emotions: [pyaar, kami]
  weight: medium
  sealed_default: true
- key: chitthi.pote-poti
  prompt: "Apne pote-potiyon ke liye… jo abhi aaye bhi nahi."
  emotions: [pyaar, seekh]
  weight: medium
  sealed_default: true
- key: chitthi.chhoti-mamma
  prompt: "Delhi wale ghar ki chhat pe baithi us chhoti si bachchi ke liye ek chitthi."
  emotions: [pyaar, kami]
  weight: medium
- key: chitthi.raaz
  prompt: "Ek baat jo aapne aaj tak kisi ko nahi batayi."
  sub: "Ye band lifafe mein rahegi. Aap tay karengi kab khule."
  emotions: [pyaar]
  weight: medium
  sealed_default: true
- key: chitthi.jo-poocha-nahi
  prompt: "Kuch aisa jo humne poochha hi nahi, par aap batana chahti ho?"
  emotions: [pyaar, seekh]
```
Seal suggestions for this edition (shown in the "Kisi khaas mauke pe" field): "Mickey ki shaadi pe", "Pehle pote/poti ke janam pe", "Sunny-Gunjan ki 10th anniversary pe", "Mere agle janamdin pe".

---

## 5. The birthday reveal, resolved for Mamma

| Beat | Screen | Content for this edition |
|---|---|---|
| Countdown (if opened early) | Night, unlit diya | "Kuch khaas aapka intezaar kar raha hai…" + time left |
| PIN | Keypad | "Apna khaas number daaliye" · hint "Sunny ka janamdin (DDMM)" |
| 1. Andhera | Night + dust | "Mamma, ek diya jalaiye" · "Tap kariye" |
| 2. Roshni | Diya ignites, night turns to paper | (silence; audio now unlocked) |
| 3. Pehli awaaz | Children's intro voice note plays; Kalam lines appear | Lines: "Happy Birthday Mamma!" → "Ye aapke liye hai…" → "…Sunny, Gunjan aur Mickey ki taraf se" |
| 4. Cake | Cream cake, marigold piping, **5 candles**, with a small name in Kalam under each: Papaji, Sunny, Gunjan, Mickey, Mamma | "Ab candles bujhaiye… phoonk maariye!" · "Ya yahan tap kariye" |
| 5. Phoonk | Blow detection → candles go out left to right with smoke wisps | — |
| 6. Mubarak | Petal shower; "जन्मदिन मुबारक हो, Mamma" (Tiro Devanagari) + "Janamdin mubarak ho, Mamma" | — |
| 7. Montage | Up to 90s of voice excerpts in this order: Papaji → Sunny → Gunjan → Mickey → Bade Mamaji → Sanjhle Mamaji → (one cousin) | "Sabne aapke liye kuch kaha hai…" |
| 8. Next | Button | "Sabki shubhkamnayein dekhein" |

`tributeOnReveal: false`, so **no departed family appears in the reveal**. Their memory lives in the gated chapter only.

### 5.1 Tohfa letter (`/tohfa`, Kalam, inland letter)
```
Mamma,
Aapne hamesha humari kahaniyan suni. Ab humari baari hai sunne ki.

Isme kuch sawaal hain: Delhi wala ghar, Nanaji-Naniji, aapke saat bhai-behen,
school ki saheliyan, Papaji, Sunny aur Mickey ka aana, Gunjan ka ghar aana…
aur wo sab jo humne kabhi poochha hi nahi.

Jab mann ho, ek sawaal ka jawab dijiye. Bol ke, ya likh ke. Koi jaldi nahi.
Jo sawaal achha na lage, use chhod dijiye.

Aapki aawaaz humare liye sabse keemti tohfa hai.

Happy Birthday, Mamma.
– Sunny, Gunjan aur Mickey
```
Optional voice note (same text, read by Sunny, 30–40s) plays with the letter.

### 5.2 Children's intro voice note script (beat 3, 10–20s)
```
Sunny:  "Happy birthday, Mamma!"
Mickey: "Ye aapke liye hai…"
Gunjan: "…aur ab aapko humein saari kahaniyan sunani padengi!"
All:    "Love you, Mamma!"
```
Record in a quiet room, phone 20cm from mouth, no background music (the app adds none).

---

## 6. Greetings plan

Collect by: **birthday − 2 days**. Ask everyone for: **one wish + one memory with Mamma** (+ optional photo). Voice preferred: elders tell stories better by speaking.

### 6.1 Invites
```yaml
greetings:
  collect_by: PLACEHOLDER                 # occasion_date - 2 days
  invites:
    - { person_key: papaji,  label: "Papaji",  relation_label: "Mamma ke jeevansathi", sort: 1, featured: true,  play_in_reveal: true,
        prompt_override: "Mamma ke liye kuch aisa kahiye jo aap roz nahi keh paate. Aur pehli mulaqat ki ek yaad." }
    - { person_key: sunny,   label: "Sunny",   relation_label: "Bada beta", sort: 2, featured: false, play_in_reveal: true,
        prompt_override: "Bachpan ki ek yaad jab Mamma ne aapke liye kuch khaas kiya." }
    - { person_key: gunjan,  label: "Gunjan",  relation_label: "Bahu", sort: 3, featured: false, play_in_reveal: true,
        prompt_override: "Pehli baar jab aap Mummy se mili, aur ab wo aapke liye kya hain." }
    - { person_key: mickey,  label: "Mickey",  relation_label: "Chhota bachcha", sort: 4, featured: false, play_in_reveal: true,
        prompt_override: "Bachpan ki ek yaad jab Mamma ne aapke liye kuch khaas kiya." }

    - { person_key: bhaiya_bade,    label: "Bade Mamaji",    relation_label: "Mamma ke bade bhai",   sort: 5, featured: true, play_in_reveal: true,
        prompt_override: "Delhi wale ghar ki ek kahani jisme aapki choti behen ho: koi shararat, koi ladai, ya koi pyaari baat. Aur ek ashirwad." }
    - { person_key: null, label: "Badi Mamiji", relation_label: "Bade Mamaji ki patni", sort: 6 }
    - { person_key: bhaiya_sanjhle, label: "Sanjhle Mamaji", relation_label: "Mamma ke bhai",        sort: 7, featured: true, play_in_reveal: true,
        prompt_override: "Bachpan ki ek kahani jisme aap aur Mamma saath the: shararat, ladai, ya koi raaz. Aur ek shubhkamna." }
    - { person_key: null, label: "Sanjhli Mamiji", relation_label: "Sanjhle Mamaji ki patni", sort: 8 }

    # Families of departed siblings: deeply meaningful, ask gently
    - { person_key: null, label: "PLACEHOLDER (Badi Mausiji ke bachche)",  relation_label: "Mamma ki bhaanji/bhaanja", sort: 9,
        prompt_override: "Mausi ke liye ek shubhkamna, aur unke saath ki ek yaad. Agar mann ho, toh apni Mummy aur Mausi ki koi baat bhi." }
    - { person_key: null, label: "PLACEHOLDER (Chhoti Mausiji ke bachche)", relation_label: "Mamma ki bhaanji/bhaanja", sort: 10, prompt_override: same-as-above }
    - { person_key: null, label: "PLACEHOLDER (Manjhle Mamaji ka parivaar)", relation_label: "Mamma ki bhabhi / bhatije", sort: 11,
        prompt_override: "Bua ke liye ek shubhkamna, aur unke saath ki ek yaad." }
    - { person_key: null, label: "PLACEHOLDER (Chhote Mamaji ka parivaar)",  relation_label: "Mamma ki bhabhi / bhatije", sort: 12, prompt_override: same-as-above }
    - { person_key: null, label: "PLACEHOLDER (Mausaji, if alive)", relation_label: "Jijaji", sort: 13 }

    # Others
    - { person_key: null, label: "PLACEHOLDER (Gunjan ke Mummy-Papa)", relation_label: "Samdhi-Samdhan", sort: 14 }
    - { person_key: null, label: "PLACEHOLDER (Papaji ke bhai-behen)", relation_label: "Sasural parivaar", sort: 15 }
    - { person_key: null, label: "PLACEHOLDER (Mamma ki saheli)",      relation_label: "Bachpan / school ki saheli", sort: 16,
        prompt_override: "Aapki dosti ki ek yaad, aur ek shubhkamna." }
    - { person_key: null, label: "PLACEHOLDER (Padosi / kitty friends)", relation_label: "Dost", sort: 17 }
```

### 6.2 Tribute memories (placement: `tribute`)
In a **separate, optional** ask (second message after they've sent their birthday greeting), invite Bade Mamaji, Sanjhle Mamaji and the families of departed siblings:
> "Ek aur chhoti si guzarish: Mamma ke liye ek kitaab ban rahi hai jisme unke bhai-behenon ki yaadein bhi hain. Kya aap Badi Mausiji, Chhoti Mausiji, Manjhle Mamaji ya Chhote Mamaji ke saath Mamma ki koi yaad bhej sakte hain? Ye janamdin pe nahi, baad mein ek alag hisse mein dikhegi."

Tribute greetings are created with `placement: tribute`, `play_in_reveal: false`, and appear only at the end of the `yaadon-mein` chapter.

### 6.3 WhatsApp messages (copy-ready from admin)
**Invite:**
```
Namaste {{label}} 🙏
{{occasionDate}} ko Mamma ka janamdin hai, aur hum unke liye ek khaas digital album bana rahe hain.
Kya aap unke liye ek chhoti si shubhkamna aur unke saath ki ek yaad bhej denge? Bol ke bhi bhej sakte hain, bas 2 minute.
👉 {{inviteLink}}
Ye surprise hai, Mamma ko mat batana 🤫
– Sunny, Gunjan aur Mickey
```
**Reminder (T-7, T-3):** `Bas yaad dila rahe the 🌼 Mamma ke janamdin ke liye aapki aawaaz ka intezaar hai: {{inviteLink}}`
**For elders who can't use links:** call them, put the call on speaker, record with another phone, and upload via admin "Create greeting" (voice file). Type their message text yourself.

---

## 7. Photo shot list

Required ★. Upload via admin; the app shows a soft paper placeholder (with dominant colour) until filled. **Alt text is required**; suggested alt text is given.

| ID | Target | What to find | Suggested alt text |
|---|---|---|---|
| ★ P-COVER | album_cover, chapter `aaj-ki-mamma` | Best recent portrait of Mamma, smiling, natural light | "Mamma muskura rahi hain" |
| ★ P-REVEAL-1 | reveal (after "Mubarak") | Whole family recent photo: Papaji, Mamma, Sunny, Gunjan, Mickey | "Poora parivaar ek saath" |
| P-REVEAL-2..6 | reveal montage backgrounds | Photo of each montage speaker (Papaji, Sunny, Gunjan, Mickey, Bade Mamaji, Sanjhle Mamaji) | "{name} ki photo" |
| P-CH-JANAMDIN | chapter | Any past birthday of Mamma (cake, family) | "Mamma ka ek purana janamdin" |
| ★ P-CH-SHURUAAT / P-Q-BACHPAN-PHOTO | chapter + question | Oldest available photo of Mamma as a child | "Bachpan mein Mamma" |
| P-Q-BACHPAN-JANAMDIN | question | Any childhood festive photo | "Bachpan ka ek tyohaar" |
| ★ P-CH-DELHI / P-Q-DELHI-GHAR | chapter + question | The Delhi house (exterior, chhat, aangan), even if recent | "Delhi wala ghar" |
| ★ P-CH-PARENTS / P-Q-NANAJI-NANIJI | chapter + question | Nanaji and Naniji together | "Nanaji aur Naniji" |
| ★ P-CH-SIBLINGS / P-Q-SAATON | chapter + question | Any photo with many of the seven siblings | "Mamma apne bhai-behenon ke saath" |
| P-Q-SIBLINGS-GROUP | question | A second group photo (a wedding/family function) | "Parivaar ki ek shaadi mein sab bhai-behen" |
| P-Q-RAKHI | question | Rakhi / Bhai Dooj photo with brothers | "Rakhi pe Mamma aur unke bhai" |
| P-CH-JIJI | chapter | Mamma with one or both elder sisters | "Mamma apni Jijiyon ke saath" |
| P-Q-JIJI-BADI | question (jiji, yaadon) | Badi Mausiji portrait | "Badi Mausiji" |
| P-Q-JIJI-CHHOTI | question (jiji, yaadon) | Chhoti Mausiji portrait | "Chhoti Mausiji" |
| P-CH-BHAIYA | chapter | Mamma with brothers | "Mamma apne bhaiyon ke saath" |
| P-Q-BADE-MAMAJI | question | Bade Mamaji (young if possible) | "Bade Mamaji" |
| P-Q-SANJHLE-MAMAJI | question | Sanjhle Mamaji (young if possible) | "Sanjhle Mamaji" |
| P-Q-MANJHLE-MAMAJI | question (yaadon) | Manjhle Mamaji portrait | "Manjhle Mamaji" |
| P-Q-CHHOTE-MAMAJI | question (yaadon) | Chhote Mamaji portrait | "Chhote Mamaji" |
| P-CH-SCHOOL / P-Q-SCHOOL | chapter + question | School photo / class photo / report card | "School ke dinon mein Mamma" |
| P-CH-JAWANI / P-Q-JAWANI | chapter + question | Young Mamma portrait (teen/20s) | "Jawani mein Mamma" |
| ★ P-CH-SHAADI / P-Q-SHAADI | chapter + question | Wedding photo of Mamma & Papaji | "Mamma aur Papaji ki shaadi" |
| P-CH-SASURAL | chapter | Early photo in sasural / new home | "Shaadi ke baad naye ghar mein Mamma" |
| P-CH-PAPAJI / P-Q-PAPAJI-TRIP | chapter + question | Mamma & Papaji on an early trip | "Mamma aur Papaji ek safar par" |
| ★ P-CH-SUNNY / P-Q-SUNNY-BABY | chapter + question | Mamma holding baby Sunny | "Mamma ki god mein chhota Sunny" |
| ★ P-CH-MICKEY / P-Q-MICKEY-BABY | chapter + question | Mamma holding baby Mickey | "Mamma ki god mein chhota Mickey" |
| P-CH-MAA | chapter | Mamma with both kids (young) | "Mamma, Sunny aur Mickey" |
| P-CH-BEECH | chapter | 90s/2000s family photo (festival, trip) | "Parivaar ka ek purana tyohaar" |
| ★ P-CH-GUNJAN / P-Q-SUNNY-WEDDING | chapter + question | Sunny-Gunjan wedding with Mamma | "Sunny aur Gunjan ki shaadi mein Mamma" |
| P-Q-GUNJAN-FIRST | question | Earliest photo of Mamma with Gunjan | "Mamma aur Gunjan ki pehli photo" |
| P-CH-KHUSHIYAN | chapter | Mamma laughing, candid | "Mamma khul ke hans rahi hain" |
| P-Y-1..4 | tribute (yaadon-mein opening, under each diya) | Small portrait of each departed sibling | "{name}" |

Scanning: 600 dpi, slight warmth kept, no AI face "restoration". Ask Bade Mamaji / Sanjhle Mamaji / cousins for the old albums; childhood and sibling photos are most likely with them.

---

## 8. Copy overrides for this edition
Everything in Part 2 section 11 applies with `addressWord = Mamma`, `helpLabel = Sunny`. Edition-specific overrides:

| Key | Value |
|---|---|
| `book.coverTitle` | Mamma ki Kahani |
| `album.title` | Mamma, Sunao Na |
| `album.subtitle` | Sunny, Gunjan aur Mickey ki taraf se, aapke janamdin par |
| `chapter.yaadon.intro` | Mamma, ye unke liye hain jo ab saath nahi, par hamesha saath hain. Ek ek karke diya jalaiye. |
| `chapter.yaadon.ready` | Unki baatein karein? |
| `chapter.yaadon.tributes` | Sabki yaadein unke baare mein |
| `wall.title` | Sabki Shubhkamnayein |
| `g.welcome` | Mamma ke janamdin ke liye kuch kahiye 🌼 |
| `pin.hint` | Sunny ka janamdin (DDMM) |
| `og.title` | Mamma ke liye 🌼 |
| `og.description` | Ek chhota sa tohfa, pyaar se |

OG image: paper texture + lit diya + "Mamma ke liye" in Fraunces. **No photos or names** in the OG image (WhatsApp previews are visible to anyone the link is forwarded to).

---

## 9. After the birthday: nudge schedule

Children send one WhatsApp nudge every 2–3 days with a deep link from admin ("Copy next question"). Suggested first 15, light and joyful first, building trust before deeper chapters:

| # | Question key | Sent by |
|---|---|---|
| 1 | `janamdin.khwahish` (on the day itself, together) | All |
| 2 | `shuruaat.naam` | Sunny |
| 3 | `delhi-ghar.garmi` | Mickey |
| 4 | `bhai-behen.sabse-badi-ladai` | Gunjan |
| 5 | `school.kaisi-student` | Mickey |
| 6 | `bhaiya-log.bade-shararat` | Sunny |
| 7 | `rishta.pehli-mulaqat` | Gunjan |
| 8 | `khushiyan.recipe` | Gunjan |
| 9 | `jiji.choti-banana` | Mickey |
| 10 | `sunny.janam` | Sunny |
| 11 | `mickey.naam` | Mickey |
| 12 | `delhi-ghar.diwali` (or nearest festival) | All |
| 13 | `bhai-behen.rakhi` | Sunny |
| 14 | `jawani.gaana` | Mickey |
| 15 | `papaji.choti-aadat` | Papaji forwards it 😄 |

Rules: never nudge a `heavy` question; let her find those herself. If she doesn't answer two nudges in a row, pause for a week. When she answers, the sender replies on WhatsApp with something personal ("Mamma, ye sun ke maza aa gaya ❤️"), since the reply is part of the experience.

Nudge template: `Mamma, aaj ka sawaal 🌼 "{{questionText}}" Jab mann ho tab: {{deepLink}}`

---

## 10. Open items (fill before seeding to production)

**PLACEHOLDER (blocking):**
- [ ] Birthday date (`occasion_date`) and therefore `unlock_at`, `collect_by`
- [ ] PIN (4 digits) and confirm the hint
- [ ] Help contact phone (Sunny)
- [ ] Mamma's formal name and ghar ka naam (nickname)
- [ ] Nanaji / Naniji: alive or not (controls one heavy question)
- [ ] Real names of all six siblings (for admin and alt text; questions use call names)
- [ ] What Mamma calls her youngest brother
- [ ] Sasural city/house, current home
- [ ] Greeting invitees marked PLACEHOLDER (names + phone numbers)

**CONFIRM (non-blocking defaults in use):**
- [ ] Mickey's gender (for Hindi verb agreement and asked-by line)
- [ ] Sibling birth order and Mamma's position
- [ ] Kids' call names for each Mamaji/Mausiji (Bade/Manjhle/Sanjhle/Chhote Mamaji; Badi/Chhoti Mausiji) or name-based ("Raju Mamaji")
- [ ] Mamma's call names for her siblings (Bade Bhaiya, Badi Jiji…) and her parents (Pitaji, Mummy/Bebe/Biji)
- [ ] What Gunjan calls Mamma ("Mummy" assumed)
- [ ] Festivals the family celebrates (Diwali, Holi, Rakhi, Bhai Dooj, Karva Chauth, Lohri assumed)
- [ ] Mohalla/area of the Delhi home (adds richness to `delhi-ghar.*`)
- [ ] Decades: childhood 1970s, marriage 1990s assumed (affects TV/film references)

**Nice to have (enriches follow-ups):**
- [ ] Known family stories (a famous fight, a funny wedding incident, a sibling's catchphrase) → admin adds as `followups`
- [ ] Her favourite songs, films, dishes → used in follow-ups like "Aapka favourite '…' wala gaana?"
- [ ] Topics to avoid (health, property, a specific in-law matter) → `avoid_topics`

---

## 11. Acceptance criteria for this edition
- [ ] Seed runs with zero errors and prints the PLACEHOLDER list above; no recipient-facing screen shows a raw `{{var}}`, `PLACEHOLDER` or `CONFIRM:`.
- [ ] Every question in section 4.4 appears in admin under the correct chapter with resolved preview, editable.
- [ ] Renaming "Bade Mamaji" in People updates every question, greeting label and copy string mentioning him.
- [ ] Before `unlock_at`, `/m/[t]` shows only the countdown.
- [ ] Reveal shows 5 candles, the children's voice note, and a montage with ≤ 90s audio from approved `play_in_reveal` greetings; no departed sibling appears.
- [ ] Album suggests `janamdin.*` first; heavy questions are never suggested.
- [ ] `yaadon-mein` opens with the four-diya ritual and the heavy gate; tribute greetings appear at its end only.
- [ ] Gunjan's questions show "GUNJAN POOCHH RAHI HAI" and say "Mummy"; Papaji's show "PAPAJI POOCHH RAHE HAIN".
- [ ] Mickey's asked-by line shows "MICKEY KA SAWAAL" until gender is confirmed.
- [ ] Chitthiyan questions open the seal sheet; sealed answers are hidden from `/padho` until their condition.
- [ ] All photo slots render placeholders with alt text until uploaded; ★ slots flagged in the admin dashboard.
