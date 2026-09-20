# Lëmshi

**Lëmsh** është loja e dytë e faqes: pesë a gjashtë fjalë të përziera çdo ditë, secila me orën e vet.
Luhet te [`/leemsh`](https://fjalorshqip.com/leemsh).

Si gjithçka tjetër në këtë faqe, loja nuk ka server: fjalët e ditës, rregullat dhe rezultati juaj
qëndrojnë të gjitha në shfletuesin tuaj.

## Rregullat

Çdo fjalë vjen me shkronjat e saj të përziera. I vendosni në rendin e duhur — duke klikuar mbi to ose
duke i shkruar me tastierë — dhe fjala kontrollohet vetë sapo të mbushen të gjitha kutitë. Nëse rendi
nuk është i drejtë, ju thuhet dhe provoni prapë; nuk humbni asgjë veç kohës.

Butoni *Pastro* i kthen të gjitha shkronjat në vend, *Përzie* i rendit ndryshe kutitë e poshtme, dhe
*Kaloje* e dorëzon fjalën dhe kalon te tjetra.

Ora nis kur shfaqet fjala dhe vlen **vetëm për atë fjalë**: një fjalë e humbur nuk e mbyll ditën, sepse
fjala e radhës vjen me orën e vet të plotë. Koha varet nga gjatësia — tetë sekonda për shkronjë, dhe
kurrë më pak se gjysmë minute.

## Pikët

| Burimi | Pikët |
| :-- | :-- |
| Fjalë e zgjidhur | 10 pikë për çdo shkronjë |
| Koha e mbetur | 1 pikë për çdo sekondë të mbetur kur e zgjidhët |
| Fjalë e pazgjidhur | 0 |

Nuk zbritet asnjë pikë për një fjalë që ju iku: ora e bëri tashmë atë punë, duke i marrë sekondat
fjalëve që erdhën pas saj. Në fund shfaqet e gjithë dita — çdo fjalë me kohën dhe pikët e veta — dhe
secila fjalë është lidhje drejt kuptimit të saj në fjalor.

## Kutitë

Çdo kuti mban **një karakter**, njësoj si te [Fjalëza](fjalez.md). Shkronjat që shkruhen me dy karaktere
— `dh`, `gj`, `ll`, `nj`, `rr`, `sh`, `th`, `xh`, `zh` — zënë dy kuti.

Rendi i shkronjave të përziera është i njëjtë për të gjithë: gjenerohet një herë bashkë me fjalët, jo
në shfletues, që dita të jetë e njëjtë për këdo që e luan.

## Dita

Fjalët ndërrohen në mesnatë sipas **UTC**, njësoj si *fjala e ditës* dhe Fjalëza, që të gjithë ta kenë
të njëjtën ditë në të njëjtin çast.

Mund të luani lëmshin e sotëm ose cilindo të ditëve të kaluara — lista *Ditët e kaluara* i mban të
gjitha, me pikët tuaja për secilën. Lëmshet e ditëve që nuk kanë ardhur ende nuk hapen.

Seria aktuale nis më **20 shtator 2026** dhe mbaron më **1 nëntor 2026**. Kur të mbarojë, faqja e thotë
hapur; lista zgjatet duke shtuar fjalë te `src/scripts/lemshWords.ts` dhe duke thirrur
`pnpm lemsh:words`.

## Rezultati juaj

Rezultatet ruhen vetëm te `localStorage` i shfletuesit tuaj, nën çelësin `lemsh.v1`, të ndara sipas
datës së lëmshit (`2026-09-20`). Për secilën fjalë ruhen vetëm sekondat dhe nëse u zgjidh; pikët
llogariten prej tyre sa herë shfaqen. Nuk dërgohen askund dhe nuk mund të lexohen nga faqja në një
shfletues tjetër — nëse pastroni të dhënat e faqes ose kaloni në një pajisje tjetër, historiku nis nga
e para.

Çdo fjalë shkruhet sapo mbaron, jo në fund të ditës: nëse e mbyllni faqen në mes, ditën e vazhdoni aty
ku e latë. Fjala që kishit në dorë në atë çast nis nga e para, me orën e saj të plotë.

Butoni *Kopjo rezultatin* kopjon vetëm numrin e lëmshit, pikët dhe katrorët — **kurrë fjalët** — që të
mund ta ndani pa ia prishur lojën tjetrit.
