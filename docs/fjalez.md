# Fjalëza

**Fjalëz** është loja e fjalëve e faqes: një fjalë me pesë shkronja çdo ditë, gjashtë mundësi për ta
gjetur. Luhet te [`/fjaleez`](https://fjalorshqip.com/fjaleez).

Si gjithçka tjetër në këtë faqe, loja nuk ka server: fjala e ditës, rregullat dhe rezultati juaj
qëndrojnë të gjitha në shfletuesin tuaj.

## Rregullat

Pas çdo prove, secila kuti thotë çfarë di për shkronjën e saj:

| Kutia | Kuptimi |
| :-- | :-- |
| Sfond i kuq (ngjyra e kapakut) | Shkronja është në fjalë **dhe në atë vend**. |
| Sfond i çelët me vijë të kuqe poshtë | Shkronja është në fjalë, por **në një vend tjetër**. |
| Sfond i zbehtë | Shkronja **nuk është** në fjalë. |

Kur një shkronjë përsëritet, numri i kutive të shënuara nuk e kalon numrin e herëve që fjala e
përmban atë shkronjë.

Një provë pranohet vetëm nëse është fjalë e fjalorit. Nëse nuk është, ju thuhet dhe prova nuk
humbet.

## Kutitë dhe tastiera

Çdo kuti mban **një karakter**, ashtu si shkruhet me tastierë. Shkronjat që shkruhen me dy karaktere —
`dh`, `gj`, `ll`, `nj`, `rr`, `sh`, `th`, `xh`, `zh` — zënë dy kuti: `GARDH` është pesë kuti.

Tastiera e lojës është QWERTY, me **Ë** pas `P` dhe **Ç** pas `L` — atje ku tastiera gjermane mban `Ü`,
`Ö` dhe `Ä`. `W` nuk është aty, sepse nuk bën pjesë në alfabetin shqip.

## Dita

Fjala ndërrohet në mesnatë sipas **UTC**, njësoj si *fjala e ditës* në ballinë, që të gjithë ta kenë
të njëjtën fjalë në të njëjtin çast. Data që shkruhet te koka e faqes është data UTC e asaj fjale.

Mund të luani fjalëzën e sotme ose cilëndo të ditëve të kaluara — lista *Ditët e kaluara* poshtë
tabelës i mban të gjitha, me rezultatin tuaj për secilën. Fjalëzat e ditëve që nuk kanë ardhur ende
nuk hapen.

Seria aktuale shkon nga **19 shtatori 2026** deri më **18 nëntor 2026**. Kur të mbarojë, faqja e
thotë hapur; lista zgjatet te `src/lib/fjalez.ts`.

## Rezultati juaj

Rezultatet ruhen vetëm te `localStorage` i shfletuesit tuaj, nën çelësin `fjalez.v1`, të ndara sipas
datës së fjalëzës (`2026-09-19`). Nuk dërgohen
askund dhe nuk mund të lexohen nga faqja në një shfletues tjetër — nëse pastroni të dhënat e faqes
ose kaloni në një pajisje tjetër, historiku nis nga e para.

Butoni *Kopjo rezultatin* kopjon vetëm numrin e fjalëzës, numrin e provave dhe katrorët — **kurrë
fjalën** — që të mund ta ndani pa ia prishur lojën tjetrit.
