/*
 * Fjala e ditës — the list is a constant on purpose. Two months of words is a
 * few kilobytes, so the home page needs no second request to show one, and the
 * day is computed from UTC so everyone sees the same word at the same time
 * without a daily build.
 *
 * The list runs 2026-09-19 → 2026-11-18. After that it wraps and repeats,
 * which keeps the page working; extend the array to carry it further.
 */

export interface DayWord {
  term: string;
  slug: string;
  attributes: string[];
  /** The entry's first sense, exactly as the dictionary gives it. */
  gist: string;
}

const START_UTC = Date.UTC(2026, 8, 19);
const DAY_MS = 86_400_000;

const MONTHS = [
  'janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor',
  'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor',
];

export const WORDS_OF_DAY: DayWord[] = [
  { term: "ABETARE", slug: "abetare", attributes: ["f.","sh."], gist: "Libër fillestar për të mësuar shkrim e këndim. Abetare e gjuhës shqipe. Abetare për të rritur. Festa e abetares." },
  { term: "HEJZË", slug: "hejzee", attributes: ["f.","sh."], gist: "Kurriz mali a kodre që ndan rrjedhën e ujërave në dy anë. Shkoi nga hejza. Kalonte nëpër hejzë. Kapërceu hejzën." },
  { term: "CIKNOS", slug: "ciknos", attributes: ["kal."], gist: "E ziej tepër gjellën, qumështin etj. aq sa ngjitet në fund të enës e digjet, e bëj të zërë ciknë. Ciknos qumështin. Ciknos gjellën." },
  { term: "NAFAKË", slug: "nafakee", attributes: ["f.","bised."], gist: "Fat; mbarësi. Erdhi me nafakë. I preu nafakën. I doli nafaka. Qoftë me nafakë! ur. Ditë e re, nafakë e re. fj. u." },
  { term: "CARUQE", slug: "caruqe", attributes: ["sh."], gist: "Opingë lëkure me majë dhe e zbukuruar me rripa. Caruqe lëkure. Caruqe me xhufka. Një pale caruqe. Mbath caruqet." },
  { term: "GJAKFTOHTË", slug: "gjakftohtee", attributes: ["mb."], gist: "Që e përmban veten, që nuk nxehet menjëherë a nuk rrëmbehet, që është i matur e i qetë në veprime e në sjellje; kund. gjaknxehtë. Njeri gjakftohtë." },
  { term: "OGRAJË", slug: "ograjee", attributes: ["f.","sh."], gist: "Livadh pranë pyllit a në mes të korijeve, ku kullot bagëtia, pyll i vogël me lëndina për kullotë. Pyje e ograja. I mbajnë dhentë në ograja." },
  { term: "LLAFAZAN", slug: "llafazan", attributes: ["mb."], gist: "Që flet shumë e pa pushim; që flet vend e pa vend, që flet pa i peshuar mirë fjalët; fjalaman. Njeri llafazan." },
  { term: "KABUNI", slug: "kabuni", attributes: ["f.","sh."], gist: "Ëmbëlsirë që bëhet me oriz e me sheqer të djegur, me rrush të thatë, me bajame etj." },
  { term: "ËMBLAS", slug: "eemblas", attributes: ["ndajf."], gist: "Duke i shprehur ndjenja dashurie a kënaqësie, ëmbël, ëmbëlsisht. E përkëdhel ëmblas. Pëshpërit ëmblas." },
  { term: "JELE", slug: "jele", attributes: ["f.","sh."], gist: "Tufa e qimeve të gjata që ka kali në qafë, perçja e kalit, krifë, kreshtë. Shkundi jelet. I preu jelen. Kapem për jelesh." },
  { term: "TRENOHEM", slug: "trenohem", attributes: ["vetv."], gist: "Luaj mendsh, prishem nga mendtë, shkalloj; çmendem nga gëzimi, nga mërzia e madhe etj.; më hipën inati në kokë, tërbohem." },
  { term: "QAFALIK", slug: "qafalik", attributes: ["m.","sh."], gist: "Qafë mali e vogël. Doli në qafalik. Zbritën nga qafaliku. Kaluan nga një qafalik." },
  { term: "HOKATAR", slug: "hokatar", attributes: ["m.","sh."], gist: "Ai që thotë fjalë për të qeshur, ai që bën shaka; ai që tall, shpotit a ngacmon të tjerët zakonisht pa të keq, gaztor, shakaxhi. Është hokatar i madh." },
  { term: "VADHËZ", slug: "vadheez", attributes: ["f.","sh."], gist: "Vadhë; kokrra e vadhës. Lulet e vadhëzës. Mbledhin vadhëza. I shkoi vadhëzat në varg." },
  { term: "LARMOJ", slug: "larmoj", attributes: ["kal."], gist: "E bëj të larme diçka; e zbukuroj me lara, e bëj lara-lara, e laroj. E larmoi veshjen. E larmoi vendin." },
  { term: "ÇILTËRISHT", slug: "ccilteerisht", attributes: ["ndajf."], gist: "Në mënyrë të çiltër, me çiltëri; pa u shtirë, me zemër të pastër. Flet çiltërisht. Sillet çiltërisht. Ia tha çiltërisht." },
  { term: "RABUSH", slug: "rabush", attributes: ["m.","sh."], gist: "Bisht i fortë e i trashur i qepës, që nuk hahet; mashkulli i qepës, ngallë; karabush. Rabushi i qepës." },
  { term: "ZIJOSEM", slug: "zijosem", attributes: ["vetv."], gist: "Ndiej uri të madhe, urëtohem; më hyn babëzia, bëhem i babëzitur. Ishte zijosur, i ziu!" },
  { term: "XHINXHERKË", slug: "xhinxherkee", attributes: ["f.","sh."], gist: "Zog sa një trumcak, me pupla të larme, që e bën folenë nëpër zgërbonja." },
  { term: "TULINË", slug: "tulinee", attributes: ["f.","sh."], gist: "Tokë e butë e pjellore, tokë me lym, e tultë e pa gurë. Ka ca tulica të mira buzë lumit." },
  { term: "BABAGJYSH", slug: "babagjysh", attributes: ["m.","sh."], gist: "Emër, me të cilin fëmijët e të rinjtë i drejtohen gjyshit në familje me dashuri e me nderim. Erdhi babagjyshi!" },
  { term: "CUBOJ", slug: "cuboj", attributes: ["kal."], gist: "Pres majat e diçkaje, e shkurtoj, e bëj cub. Cuboj flokët. Cuboj bimët." },
  { term: "THEKORE", slug: "thekore", attributes: ["f.","sh."], gist: "Qilim, bërruc a veshje tjetër me thekë shtroi thekoren. U mbulua me thekore. Veshi thekoren." },
  { term: "VAPËSIRË", slug: "vapeesiree", attributes: ["f."], gist: "Vapë e madhe që të zë frymën, vapë e padurueshme; zagushi. Nuk fle dot në vapësirë." },
  { term: "KRUSHKOHEM", slug: "krushkohem", attributes: ["vetv."], gist: "Bëj krushqi me dikë a me të afërmit e dikujt, lidhem me krushqi, bëhem krushk." },
  { term: "GAGARIMË", slug: "gagarimee", attributes: ["f.","sh."], gist: "Zë i mprehtë dhe i ndërprerë që nxjerr pata ose rosa, gagaritje. Gagarimat e patave." },
  { term: "MISHTË", slug: "mishtee", attributes: ["mb."], gist: "Që ka shumë mish, i tultë; që është prej mishi. Buzë të mishta. Pjesët e mishta të fytyrës." },
  { term: "STANAR", slug: "stanar", attributes: ["m.","sh."], gist: "Ai që përkujdeset për bagëtitë në stan dhe që punon bulmetin; bari i stanit. Bulmet stanarësh." },
  { term: "ÇMERIT", slug: "ccmerit", attributes: ["kal."], gist: "E habit shumë dikë, e çudit pa masë, e mahnit, e lë pa mend. E çmeriti fare. Na çmeriti me ato fjalë." },
  { term: "URLË", slug: "urlee", attributes: ["f."], gist: "Qumësht i zier me kripë që mbahet gjatë në napë ose në kacek; djathë kaceku, të cilit i hedhim herë pas here qumësht." },
  { term: "LESHBOZHURE", slug: "leshbozhure", attributes: ["mb."], gist: "Që i ka flokët të verdhë e pak si të kuqërremë, të butë e të ndritshëm. Vajzë leshbozhure" },
  { term: "QERTH", slug: "qerth", attributes: ["m.","sh."], gist: "Qer i vogël, i bërë prej një dërrase të vetme, që shërben për të holluar petë me përmasa të vogla, për t’u dhënë formën kuleçve, për të prerë bukën etj." },
  { term: "VREROSEM", slug: "vrerosem", attributes: ["vetv."], gist: "Ndiej hidhërim të madh, pikëllohem; dëshpërohem, helmohem. U vrerosën armiqtë. Iu vreros zemra. S’ka përse të vreroset." },
  { term: "YRNEK", slug: "yrnek", attributes: ["m.","sh.","bised."], gist: "Gjedhe, model, mostër; shembull për dikë a diçka. Yrnek i rrallë. Yrneku i rrobave. E preu sipas një yrneku. E mori yrnek. Sa për yrnek." },
  { term: "ELBTH", slug: "elbth", attributes: ["m."], gist: "Puçërr me qelb sa një kokërr elbi, që del në kapakun e syrit në rrëzë të qerpikëve, kath." },
  { term: "ZHAKE", slug: "zhake", attributes: ["f.","sh."], gist: "Sharrë e madhe dore, me dy doreza, që përdoret nga dy veta për të prerë trupa. I sharrojnë me zhake." },
  { term: "UDHAKOJ", slug: "udhakoj", attributes: ["jokal.","bised."], gist: "Shkoj dendur në një vend, e bëj shpesh rrugën për diku. Udhakonin në Shkodër." },
  { term: "ËNDËRRT", slug: "eendeerrt", attributes: ["mb."], gist: "Që është a që bëhet si në ëndërr, fantastik; shumë i këndshëm. Udhëtim i ëndërrt." },
  { term: "LAGRAÇ", slug: "lagracc", attributes: ["m.","sh."], gist: "Sfurk i vogël prej druri a prej hekuri, që përdoret për të ngritur saçin kur është i nxehtë. Lagraçi i magjetores. E ngriti saçin me lagraç." },
  { term: "SEVDALLI", slug: "sevdalli", attributes: ["mb.","bised."], gist: "iron. Që dashurohet lehtë, që bie shpejt në dashuri. Kokëkrisur e sevdalli. Bandill sevdalli." },
  { term: "ECURI", slug: "ecuri", attributes: ["f."], gist: "Mënyra se si bëhet a zhvillohet një punë; rruga e ndjekur për të bërë diçka, mënyra si veprojmë për diçka. Ecuria e punës. Ecuria e mësimit." },
  { term: "QYREK", slug: "qyrek", attributes: ["m.","sh."], gist: "Lopatë e vogël me teh të rrafshët për të punuar tokën. E punoi kopshtin me qyrek." },
  { term: "XHEZA", slug: "xheza", attributes: ["f.","sh."], gist: "Ndëshkim, dënim; gjobë; gjobitje. Xheza e madhe. I dha xhezanë. Pagoi xhezanë." },
  { term: "MADHOJ", slug: "madhoj", attributes: ["kal."], gist: "Përkujdesem për dikë që të rritet e të bëhet i madh, e rrit. Prindërit e rritën dhe e madhuan." },
  { term: "GUNGALEC", slug: "gungalec", attributes: ["m.","sh."], gist: "Flokët ose gërsheti që mbledhin gratë si kulaç prapa kokës. Gungalec i thjeshtë." },
  { term: "REFENE", slug: "refene", attributes: ["f.","sh."], gist: "Gosti me të ngrëna e me të pira që bëjnë disa veta, duke paguar secili pjesën e vet. Bëjnë refene." },
  { term: "TORLAR", slug: "torlar", attributes: ["mb."], gist: "I shkathët, i zgjuar e dinak; që nuk bie lehtë në lak; velet. Nuse torlare. Është torlar." },
  { term: "ZHURISHTË", slug: "zhurishtee", attributes: ["f.","sh."], gist: "Tokë e keqe që ka rërë e zhavorr, zallinë; vend që ka zhur. Vendi është zhurishtë. I mbollën edhe zhurishtat." },
  { term: "ÇEÇE", slug: "ccecce", attributes: ["f.","bised."], gist: "Përshesh i zbutur ose ushqim tjetër si qull, që bëhet zakonisht për fëmijët e vegjël; papare. Çeçja e djalit. Çeçe me qumësht. Bëj çeçe. I jap çeçe. Ha çeçen." },
  { term: "KUQALAN", slug: "kuqalan", attributes: ["m.","sh."], gist: "Njeri që ka fytyrën dhe flokët në ngjyrë si të kuqe, kuqalash. E kemi një kuqalan." },
  { term: "VIRDHEM", slug: "virdhem", attributes: ["vetv."], gist: "Ia marr dorën një pune, fitoj zotësi për të bërë diçka, fitoj shprehi." },
  { term: "YSHMER", slug: "yshmer", attributes: ["m."], gist: "Ëmbëlsirë që bëhet me ajkë qumështi, me vezë dhe me petë të thërrmuara." },
  { term: "MOTMOTAK", slug: "motmotak", attributes: ["mb.","bised."], gist: "Që ka mbushur motin, motak, njëvjeçar. Vajzë motmotake. E ka djalin motmotak." },
  { term: "LLOÇ", slug: "llocc", attributes: ["m."], gist: "Baltë e qullët dhe e hollë, llucë; borë e shkelur dhe e përzier me baltë. Ra në lloç. Ecnin nëpër lloç. U bë vendi lloç." },
  { term: "ZEMËRDHËNËS", slug: "zemeerdheenees", attributes: ["mb."], gist: "Që të jep guxim, që të jep zemër, guximdhënës. Fjalë zemërdhënëse. Vështrim zemërdhënës." },
  { term: "QASË", slug: "qasee", attributes: ["f.","sh."], gist: "Vendi ku kalojnë vapën bagëtitë, vend mërzimi, mriz; vendi ku mblidhen bagëtitë." },
  { term: "XHUVELE", slug: "xhuvele", attributes: ["f.","sh."], gist: "Degë e vogël a bisk me shumë kokrra njëra pranë tjetrës. Këputi një xhuvele." },
  { term: "URTËSOHEM", slug: "urteesohem", attributes: ["vetv."], gist: "Bëhem i qetë dhe i shtruar në sjellje, bëhem i urtë; zbutem. U urtësuan fëmijët." },
  { term: "ÇABULLE", slug: "ccabulle", attributes: ["f.","sh."], gist: "Gosti me shumë të ftuar në raste dasme, gjëme etj. Tryezë çabullesh. Bëri një çabulle. I ftoi në çabulle. Shkoi në çabulle." },
  { term: "YLLKË", slug: "yllkee", attributes: ["f.","sh."], gist: "Pesëshe fëmijësh të moshës parashkollore në kopshte, që drejtohet nga një edukatore, si formë e organizimit të fëmijëve para se të bëhen fatosa." },
];

/*
 * Formatted from UTC, like the word itself is chosen. Near midnight this can
 * name a date the reader's own clock has already left, which is the honest
 * cost of everyone seeing one word at one time; a label disagreeing with the
 * word beneath it would be worse.
 */
export const formatDay = (date: Date) =>
  `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

export const getWordOfDay = (now: Date = new Date()): DayWord => {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const day = Math.floor((today - START_UTC) / DAY_MS);
  const count = WORDS_OF_DAY.length;
  return WORDS_OF_DAY[((day % count) + count) % count];
};
