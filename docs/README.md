# FjalorShqip.com

Fjalor i gjuhës shqipe, i ndërtuar me [Astro](https://astro.build) dhe ishuj [React](https://react.dev).

Përveç fjalorit, faqja mban edhe dy lojëra: **Fjalëzën** — fjala e ditës me pesë shkronja (shih
[Fjalëza](fjalez.md)) — dhe **Lëmshin** — pesë a gjashtë fjalë të përziera në ditë, secila me orën e vet
(shih [Lëmshi](lemsh.md)).

Faqja është **tërësisht statike**: nuk ka server aplikacioni, nuk ka bazë të dhënash dhe nuk ka API që
ekzekutohet gjatë kërkimit. Gjithçka që shpërndahet janë skedarë `HTML`, `CSS`, `JS` dhe `JSON`, të cilët
mund të vendosen në çfarëdo hostingu statik (mes tjerash edhe një `static-web-server` brenda Docker-it). I gjithë kërkimi ndodh në shfletuesin e përdoruesit — shih
[Si funksionon kërkimi](kerkimi.md).

## Struktura e projektit

```text
/
├── data/
│   └── dictionary.json        # burimi i papërpunuar i fjalorit (~40 mijë zëra)
├── docs/                      # dokumentimi i projektit
├── public/                    # skedarë statikë (favicon, robots.txt)
└── src/
    ├── components/            # ishujt React (SearchBar, Entries, ...)
    ├── data/fjalez/           # lista e fjalëve pesëshkronjore të Fjalëzës (ruhet në git)
    ├── data/lemsh/            # ditët e Lëmshit: fjalët, lidhjet dhe rendi i përzier (ruhet në git)
    ├── data/gen/              # indekset e gjeneruara gjatë ndërtimit (nuk ruhen në git)
    ├── layouts/
    ├── lib/                   # logjika e përbashkët: stems, slug, lexim/shkrim i skedarëve
    ├── pages/                 # faqet dhe endpoint-et JSON
    └── scripts/
        ├── preprocess.ts      # gjeneruesi i indekseve
        ├── fjalezWords.ts     # gjeneruesi i listës së fjalëve të Fjalëzës
        └── lemshWords.ts      # gjeneruesi i ditëve të Lëmshit
```

## Komandat

Të gjitha komandat thirren nga baza e projektit përmes terminalit. Menaxheri i pakove është
[pnpm](https://pnpm.io).

| Komanda          | Veprimi                                                          |
| :--------------- | :--------------------------------------------------------------- |
| `pnpm install`   | Shkarkon libraritë                                                |
| `pnpm dev`       | Lëshon serverin e zhvillimit në `localhost:4321`                  |
| `pnpm prebuild`  | Gjeneron indekset në `src/data/gen/` nga `data/dictionary.json`   |
| `pnpm build`     | Kontrollon tipat dhe ndërton faqen në `./dist/` (thërret `prebuild`) |
| `pnpm preview`   | Shërben lokalisht atë që u ndërtua në `./dist/`                   |
| `pnpm fjalez:words` | Rigjeneron listën e fjalëve të Fjalëzës nga `data/dictionary.json` |
| `pnpm lemsh:words` | Rigjeneron ditët e Lëmshit nga fjalori i përzgjedhur te `lemshWords.ts`        |

## Ndërtimi lokal

Gjenerimi i indekseve është i kushtëzuar me variabla mjedisi, sepse ndërtimi i plotë i të 40 mijë zërave
merr kohë dhe nxjerr dhjetëra mijëra skedarë. Pa asnjë variabël, `prebuild` nuk shkruan asnjë zë dhe
`astro build` dështon sepse i mungon `src/data/gen/slug`.

Për një ndërtim të shpejtë me një nënbashkësi fjalësh:

```sh
DICTIONARY_SUBSET='["AÇ","ACAR"]' pnpm build
```

Për ndërtimin e plotë (ashtu siç bëhet në prodhim):

```sh
NODE_ENV=production pnpm build
```

Variablat e tjera:

| Variabla                        | Efekti                                                                    |
| :------------------------------ | :------------------------------------------------------------------------ |
| `DICTIONARY_SUBSET`             | Listë `JSON` termash; gjeneron indekse vetëm për ta (për zhvillim)        |
| `NODE_ENV=production`           | Gjeneron të gjithë fjalorin dhe e shkruan `JSON`-in pa formatim           |
| `SHOULD_SKIP_STATIC_WORD_PAGES` | Nuk parandërton faqet `/f/<fjala>`; ato shërbehen dinamikisht nga shfletuesi |
| `META_TAGS`                     | Objekt `JSON` që shtohet si `<meta>` në çdo faqe                          |
| `SITE_URL`                      | Adresa bazë e përdorur në `opensearch.xml` (parazgjedhje `https://fjalorshqip.com/`) |
| `OPENSEARCH_SHORT_NAME`         | Emri i shkurtër i motorit të kërkimit në `opensearch.xml`                 |
| `OPENSEARCH_DESCRIPTION`        | Përshkrimi i motorit të kërkimit në `opensearch.xml`                      |

## Dokumentimi

- [Si funksionon kërkimi](kerkimi.md) — indeksimi gjatë ndërtimit dhe kërkimi në shfletues.
- [Fjalëza](fjalez.md) — rregullat e lojës, shkronjat me dy karaktere dhe ruajtja e rezultatit.
- [Lëmshi](lemsh.md) — fjalët e përziera, ora e secilës dhe si llogariten pikët.

## Kontribuoni

Projekti është `open source`. Për përmirësime, pasurim të fjalorit apo raportim problemesh, hapni një
`Issue` ose `PR` në [GitHub](https://github.com/shqip-dev/fjalorshqip.com), ose shkruani në
contact@shqip.dev.
