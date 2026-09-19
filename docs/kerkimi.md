# Si funksionon kërkimi

## Ideja

Fjalori ka rreth 40 mijë zëra dhe burimi i tij (`data/dictionary.json`) peshon rreth 14 MB. Zgjidhja e
zakonshme do të ishte një server me bazë të dhënash që i përgjigjet çdo kërkese kërkimi. Ky projekt nuk e
ka atë: faqja shërbehet **vetëm si skedarë statikë** dhe kërkimi ndodh **tërësisht në shfletues**.

Që kjo të jetë e mundur pa e detyruar përdoruesin ta shkarkojë gjithë fjalorin, puna ndahet në dy pjesë:

1. **Gjatë ndërtimit (build)** fjalori përpunohet një herë dhe copëtohet në qindra **nënindekse** të vogla
   `JSON`, secili me një emër të parashikueshëm.
2. **Në shfletues** kërkimi llogarit se cili nënindeks i duhet për atë që shkroi përdoruesi, shkarkon
   vetëm atë skedar dhe pastaj punon lokalisht.

Kështu një kërkim kushton një kërkesë të vetme `HTTP` për disa kilobajt, dhe hostingu mbetet një dosje e
thjeshtë me skedarë — pa server, pa bazë të dhënash, pa kod që ekzekutohet nga ana e serverit.

## Hapi 1 — përpunimi i fjalorit

Skripta `src/scripts/preprocess.ts` (ekzekutohet nga `pnpm prebuild`) lexon `data/dictionary.json`,
largon dublikatat dhe zërat e shënuar me `skip`, dhe e shndërron çdo zë të papërpunuar në një zë të
pastruar:

```jsonc
// burimi
{ "term": "ACAR m. ", "definition": ["1. Të ftohtë i madh ...", " 2. kryes. sh. ..."] }

// rezultati
{
  "term": "ACAR",
  "attributes": ["m."],          // shkurtesat gramatikore ndahen nga termi
  "definitions": ["Të ftohtë i madh ...", "kryes. sh. ..."],
  "stems": ["acar"],             // çelësi i kërkimit
  "slug": "acar"                 // çelësi i adresës
}
```

Pjesët e termit që mbarojnë me pikë (`m.`, `ndajf.`, `krahin.`) konsiderohen atribute gramatikore dhe
ndahen nga vetë fjala. Numërimi `1.`, `2.` në fillim të kuptimeve hiqet kur zëri ka më shumë se një
kuptim.

### Dy çelësa të ndryshëm

Nga i njëjti term nxirren dy forma të normalizuara (`src/lib/process.ts`), të cilat shërbejnë për qëllime
të ndryshme:

| | `stems` | `slug` |
| :-- | :-- | :-- |
| Përdoret për | kërkimin | adresën e faqes |
| `ë` bëhet | `e` | `ee` |
| `ç` bëhet | `c` | `cc` |
| Fjalët | ndahen, një `stem` për fjalë | bashkohen me `-` |
| Shembull: `ÇDOHERË` | `["cdohere"]` | `ccdoheree` |

Kërkimi e bën `ë → e` dhe `ç → c` me qëllim: kështu përdoruesi që shkruan `cdohere` nga tastiera pa
shkronja shqipe e gjen `çdoherë`. Për adresat kjo do të ishte problem, sepse dy fjalë të ndryshme do të
përfundonin në të njëjtin `slug`; prandaj aty përdoret dyfishimi `ë → ee` dhe `ç → cc`, i cili mbetet i
kthyeshëm dhe unik.

### Copëtimi në nënindekse

Një indeks i vetëm me të gjithë fjalorin do ta zhbënte qëllimin — shfletuesi do të shkarkonte prapë
dhjetëra megabajt. Prandaj zërat grupohen sipas **tri shkronjave të para** të çelësit
(funksioni `getStemPrefix`), dhe secili grup shkruhet si skedar më vete:

```text
src/data/gen/
├── slugDictionary.json   # slug → zërat, përdoret për të parandërtuar faqet /f/<fjala>
├── stem/
│   ├── aca.json          # { "acar": [...], "acap": [...], ... }
│   ├── acc.json
│   └── _.json            # çelësat me më pak se 3 shkronja
└── slug/
    ├── aca.json
    └── ...
```

Prefiksi prej tri shkronjash është një kompromis: sa më i gjatë, aq më të vogla skedarët, por aq më
shumë skedarë gjithsej (dhe hostingu ka kufij — CloudFlare Pages lejon 20 mijë skedarë). Tri shkronja i
mbajnë nënindekset në disa kilobajt secili.

Kjo dosje **nuk ruhet në git**; ajo rikrijohet në çdo ndërtim.

## Hapi 2 — nënindekset si skedarë statikë

Faqet `src/pages/api/stem-index/[stem].json.ts` dhe `src/pages/api/slug-index/[slug].json.ts` nuk janë
`API` në kuptimin e zakonshëm. Ato ekzekutohen vetëm gjatë ndërtimit: `getStaticPaths` lexon dosjen e
gjeneruar dhe Astro shkruan një skedar të gatshëm për secilin prefiks:

```text
/api/stem-index/aca.json
/api/slug-index/aca.json
```

Në kohën kur faqja shërbehet, këto janë thjesht skedarë `JSON` në disk — i shërben dot çdo server
statik, dhe i ruan në cache çdo `CDN`.

## Hapi 3 — kërkimi në shfletues

`src/components/searchbar/SearchBar.tsx` është një ishull React i ngarkuar me `client:load`. Për çdo
ndryshim në fushën e kërkimit:

1. **Normalizon** atë që shkroi përdoruesi me të njëjtin funksion `getStems` që u përdor gjatë ndërtimit —
   ky është kushti që çelësat të përputhen.
2. **Llogarit prefiksin** e secilës fjalë dhe shkarkon nënindeksin përkatës nga `/api/stem-index/<prefiksi>.json`.
   Kërkesat janë të vonuara me 200ms (`debounce`), kështu që shkrimi i shpejtë nuk gjeneron një kërkesë
   për çdo shkronjë. Çdo nënindeks i shkarkuar mbahet në memorie, prandaj shkronja e katërt, e pestë e
   kështu me radhë nuk kushtojnë asnjë kërkesë të re — prefiksi mbetet i njëjti.
3. **Kryqëzon rezultatet** kur kërkimi ka më shumë se një fjalë: mbahen vetëm zërat që dalin te të gjitha
   fjalët.
4. **Rendit** përputhjet sipas distancës [Levenshtein](https://en.wikipedia.org/wiki/Levenshtein_distance)
   ndaj tekstit origjinal, që zërat më të afërt me atë që u shkrua të dalin të parët, dhe shfaq 10 të
   parët.

Pra, pas kërkesës së parë, shtypja e mëtejshme e shkronjave brenda së njëjtës fjalë kushton zero rrjet.

## Faqja e fjalës: e parandërtuar ose e ngarkuar në shfletues

Faqja `/f/<fjala>` ka dy rrugë, dhe kjo është pasojë e drejtpërdrejtë e kufijve të hostingut statik.

**Rruga e parandërtuar.** `src/pages/f/[slug].astro` merr `slugDictionary.json` dhe gjeneron një faqe
`HTML` për secilin zë. Kjo është rruga e dëshiruar: faqe e plotë, e lexueshme nga motorët e kërkimit,
pa pritur `JavaScript`.

**Rruga dinamike.** Kur faqet nuk janë parandërtuar — sepse `SHOULD_SKIP_STATIC_WORD_PAGES` është i
ndezur, ose sepse `CLOUDFLARE` e kufizoi numrin në ~14 mijë për shkak të kufirit prej 20 mijë skedarësh —
serveri statik e kthen `index.html` si faqe `404`. Aty `DynamicEntries` (`client:only`) lexon adresën nga
`window.location.pathname`, nxjerr `slug`-un prej saj, dhe `EntriesLoader` shkarkon nënindeksin
`/api/slug-index/<prefiksi>.json` për ta shfaqur zërin. Nëse as aty nuk gjendet, shfaqet `404`.

Prandaj `index.astro` duhet të vazhdojë të funksionojë edhe si faqe pritëse për adresat e panjohura — nuk
është vetëm ballina.

## Kufizimet e njohura

- **Fjalët me më pak se tri shkronja** bien të gjitha në nënindeksin `_.json` dhe praktikisht nuk
  kërkohen dot mes njëra-tjetrës.
- **Kërkimi kërkon përputhje të saktë** të një forme të normalizuar. Distanca Levenshtein përdoret vetëm
  për të renditur atë që tashmë u gjet brenda nënindeksit — nuk gjen dot fjalë me gabim drejtshkrimor në
  tri shkronjat e para, sepse ato përcaktojnë se cili skedar shkarkohet.
- **Nuk ka kërkim brenda kuptimeve**, vetëm brenda termave.
- **Fjalori i lakuar nuk njihet**: format e lakuara e të zgjedhuara (`shtëpisë`, `punuam`) nuk lidhen me
  zërin bazë, sepse `stems` është thjesht normalizim shkronjash, jo analizë morfologjike.
