# Shtigjet

**Shtigje** është loja e tretë e faqes dhe e vetmja **javore**: një temë e re çdo të hënë, me fjalët e
saj të fshehura në një rrjet shkronjash. Luhet te [`/shtigje`](https://fjalorshqip.com/shtigje).

Si gjithçka tjetër në këtë faqe, loja nuk ka server: rrjeti i javës, rregullat dhe rezultati juaj
qëndrojnë të gjitha në shfletuesin tuaj.

## Rregullat

Rrjeti ka **gjashtë shtylla dhe tetë rreshta** — dyzet e tetë kuti. Mbi të është tema e javës, dhe
asgjë tjetër: fjalët nuk thuhen.

Çdo shkronjë e rrjetit i përket **njërës** prej fjalëve të temës. Nuk ka asnjë shkronjë mbushëse, çka
do të thotë se shkronjat që ju mbeten janë gjithmonë fjalët që ju mbeten — kjo është e gjithë loja.

Një fjalë nxirret duke lidhur shkronjat **ngjitur**, edhe tërthorazi: nga një kuti kalohet në cilëndo
prej tetë kutive që e prekin, dhe asnjë kuti nuk përdoret dy herë. Shtegu mund të kthehet sa herë të
duash.

Ka dy mënyra për ta ndërtuar një shteg, dhe të dyja bëjnë të njëjtën punë:

- **me tërheqje** — e mbani gishtin a miun shtypur dhe e kaloni nëpër shkronjat; kur e lëshoni, shtegu
  kontrollohet;
- **me prekje** — i prekni shkronjat një nga një; prekja e fundit përsëri e kontrollon shtegun.

Butoni *Kontrollo* bën të njëjtën gjë për këdo që punon me tastierë, dhe *Pastro* e shfuqizon shtegun
që po ndërtohet.

## Fjalët shtesë dhe ndihma

Një rrjet shkruan pa dashje edhe shumë fjalë të tjera të fjalorit. Nëse nxirrni njërën prej tyre, ju
numërohet si **fjalë shtesë** — nuk është e temës, por nuk është as e kotë: **çdo tri fjalë shtesë
blejnë një ndihmë**.

Një ndihmë i **ndriçon kutitë** e njërës prej fjalëve që ju kanë mbetur, duke nisur nga më e gjata.
Ju tregon se ku qëndron fjala, kurrë se në ç'rend lexohet — atë e gjeni vetë.

Fjalët shtesë nuk janë gjetur me dorë: ato lexohen nga vetë rrjeti në kohën e ndërtimit, duke e
krahasuar çdo shteg të mundshëm të rrjetit me fjalorin. Secila prej tyre është lidhje drejt kuptimit
të vet, njësoj si fjalët e temës.

## Pikët

Një javë paguan për rrjetin dhe pastaj për mënyrën si u mor.

**Fjalët** janë baza dhe e vetmja gjë që shton: **10 pikë për çdo shkronjë**. Një rrjet i plotë prej
dyzet e tetë kutish vlen 480 pikë, pavarësisht se çfarë ndodhi gjatë rrugës.

Mbi to rri një **fond prej 720 pikësh**, dhe gjithçka tjetër e shkrin:

| Çfarë | Sa |
| :-- | :-- |
| Çdo sekondë | −1 |
| Çdo provë e gabuar | −10 |
| Çdo ndihmë | −60 |

Fondi nuk zbret kurrë nën zero. Kjo është arsyeja pse loja **nuk ka as orë që të ndjek, as kufi
provash**: s'ka kohë për të mundur dhe s'ka numër shtigjesh që mund të provoni — thjesht, në një
çast, fondi mbaron dhe pas tij asgjë nuk ju merret më. Një javë e zgjidhur ngadalë e me shumë prova
vlen 480 pikë, kurrë më pak.

Fondi paguhet **vetëm për një javë të zbrazur**. Përndryshe java më e shpejtë do të ishte ajo ku
nxirret një fjalë e vetme dhe mbyllet faqja.

Koha është **shumë e asaj që u bë**, jo një orë që rrjedh: çdo lëvizje shton kohën që nga lëvizja e
mëparshme, e kufizuar në dy minuta. Kështu një rrjet i lënë hapur gjatë drekës ju kushton dy minuta
dhe jo një pasdite, dhe një skedë në sfond nuk ju kushton asgjë. Ana tjetër e kësaj është e qëllimshme:
një vështrim i gjatë mbi rrjetin numërohet më pak se ç'ishte — mirësi nga ana e një numri që vetëm
heq pikë.

## Kutitë

Çdo kuti mban **një karakter**, njësoj si te [Fjalëza](fjalez.md) dhe [Lëmshi](lemsh.md). Shkronjat
që shkruhen me dy karaktere — `dh`, `gj`, `ll`, `nj`, `rr`, `sh`, `th`, `xh`, `zh` — zënë dy kuti.

## Java

Java ndërrohet të **hënën në mesnatë sipas orës së Tiranës**. Këtu të tria lojërat nuk pajtohen: *fjala
e ditës*, Fjalëza dhe Lëmshi ndërrohen sipas `UTC`, sepse një ditë është një çast i njëjtë kudo, kurse
një javë është njësi njerëzore — nuk do të ishte e drejtë t'ju jepej rrjeti i së hënës të dielën
mbrëma.

Mund të luani javën e tanishme ose cilëndo të javëve të kaluara — lista *Javët e kaluara* i mban të
gjitha. Javët që nuk kanë ardhur ende nuk hapen. Një datë kudo brenda javës e hap atë javë, prandaj
`?j=2026-09-23` hap javën `21–27 shtator`.

Seria aktuale nis më **21 shtator 2026** dhe mbaron më **21 mars 2027** — njëzet e gjashtë javë. Kur
të mbarojë, faqja e thotë hapur; lista zgjatet duke shtuar tema te `src/scripts/shtigjeWords.ts` dhe
duke thirrur `pnpm shtigje:words`.

## Si ndërtohet një javë

Çdo temë ka një **grumbull** fjalësh më të madh se sa i duhet javës — zakonisht katërmbëdhjetë a më
shumë. Gjeneruesi:

1. kontrollon çdo fjalë të grumbullit kundrejt `data/dictionary.json` — një fjalë që nuk është zë i
   fjalorit do të lidhej me një faqe që nuk ekziston;
2. zgjedh prej grumbullit atë nënbashkësi fjalësh shkronjat e së cilës mbushin **saktësisht** dyzet e
   tetë kutitë;
3. i shtron ato në rrjet si shtigje që nuk priten dhe që e mbulojnë rrjetin pa lënë asnjë kuti;
4. lexon prej rrjetit të përfunduar të gjitha fjalët e tjera që ai shkruan.

Nëse një temë nuk del, gjeneruesi **ndalet me zhurmë** dhe nuk shkruan asgjë: më mirë një javë e
pandërtuar se një javë e gabuar.

## Rezultati juaj

Rezultatet ruhen vetëm te `localStorage` i shfletuesit tuaj, nën çelësin `shtigje.v1`, të ndara sipas
së hënës së javës (`2026-09-21`). Ruhen vetëm pesë gjëra: fjalët e temës që gjetët, fjalët shtesë që
gjetët, fjalët për të cilat harxhuat një ndihmë, sekondat dhe numri i provave të gabuara. Pikët
llogariten prej tyre sa herë shfaqen, kështu që një numër i ruajtur nuk mund të bjerë ndesh me lojën
që e nxori, dhe pikëzimi mund të ndryshohet pa ua rishkruar historikun lojtarëve. Nuk dërgohen
askund dhe nuk mund të lexohen nga faqja në një shfletues tjetër — nëse pastroni të dhënat e faqes ose
kaloni në një pajisje tjetër, historiku nis nga e para.

Çdo fjalë shkruhet sapo gjendet, jo në fund: nëse e mbyllni faqen në mes, javën e vazhdoni aty ku e
latë.

Butoni *Kopjo rezultatin* kopjon vetëm numrin e javës, pikët, katrorët, kohën, provat e gabuara dhe
ndihmat — **kurrë temën e as fjalët** — që të mund ta ndani pa ia prishur lojën tjetrit.
