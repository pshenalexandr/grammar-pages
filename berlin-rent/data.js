// All copy and numbers for "Why can't anyone in Berlin find a flat?" live here, so text can be edited
// and fact-checked without touching app.js / map.js. Every number carries a source + date.
// Rents: € net cold (nettokalt) per m² per month unless marked otherwise.
// Map values per area are generated into data-map.js (IBB + Zensus), boundaries into geo.js.

/* ---------------- sources (footer + footnotes reference these ids) ---------------- */
const SRC = {
  ibbAsk: {t: 'IBB Wohnungsmarktbericht 2025: Angebotsmieten 2012–2025 by Bezirk and Planungsraum (data: online listings)', u: 'https://www.ibb.de/media/dokumente/publikationen/berliner-wohnungsmarkt/wohnungsmarktbericht/2025/ibb-wohnungsmarktbericht-angebotsmieten_2012-2025.pdf', d: '2026-03-06'},
  ibbPR: {t: 'IBB press release on the Wohnungsmarktbericht 2025 (+119% gap, €9.54 BBU new contracts, 1.5 weeks online)', u: 'https://www.ibb.de/de/ueber-uns/presse/ibb-wohnungsmarktbericht-2025-stagnierende-angebotsmieten-moderate-bestandsmieten-und-ansehnliche-neubaubilanz.html', d: '2026-03-06'},
  ibbTab: {t: 'IBB Wohnungsmarktbericht 2025, Tabellenband (Mietspiegel averages Tab. 23, permits Tab. 16)', u: 'https://www.ibb.de/media/dokumente/publikationen/berliner-wohnungsmarkt/wohnungsmarktbericht/2025/ibb-wmb_tabellenband_2025_bf.pdf', d: '2026-03'},
  zensus: {t: 'Zensus 2022, average net cold rent and flats per 100 m grid cell (Destatis, dl-de/by-2-0); Berlin mean €7.67', u: 'https://www.statistik-berlin-brandenburg.de/news/2024/zensus-miete/', d: '2024-08-21'},
  ms26: {t: 'Senate press release: Berliner Mietspiegel 2026, average €7.71', u: 'https://www.berlin.de/sen/stadt/presse/pressemeldungen/pressemitteilung.1674998.php', d: '2026-05-28'},
  bbu25: {t: 'BBU Jahresstatistik 2025: Fluktuation 4.5%, average tenancy over 22 years', u: 'https://bbu.de/beitraege/bbu-jahresstatistik-2025-berlin-fluktuation-bei-den-bbu-mitgliedsunternehmen-berlin-im-jahr-2025', d: '2026-09-14'},
  lwu24: {t: 'Senate report on the state-owned housing companies 2024 (turnover 3.8%, "formerly around 10%")', u: 'https://www.berlin.de/sen/bauen/_assets/neubau/bericht_2024_geaendert.pdf', d: '2025'},
  howoge: {t: 'Berliner Morgenpost via GHB: "3000 Bewerber für 111 Wohnungen" (HOWOGE ~300 requests per flat, lottery)', u: 'https://www.ghb-online.de/oeffentlichkeitsarbeit/pressestimmen/1140-3000-bewerber-fuer-111-wohnungen.html', d: '2022-08-27'},
  gewobag: {t: 'Abgeordnetenhaus Drs. 19/15409 (Gewobag closes listings at about 500 requests, invites 5–15)', u: 'https://pardok.parlament-berlin.de/starweb/adis/citat/VT/19/SchrAnfr/S19-15409.pdf', d: '2023-05-17'},
  tonline: {t: 't-online: 1,792 applicants in 12 hours, batches by megaphone', u: 'https://www.t-online.de/region/berlin/news/id_86852012/berlin-1-792-bewerber-in-12-stunden-fuer-eine-wohnung.html', d: '2019-11-26'},
  tsp23: {t: 'Tagesspiegel: 600+ requests in the first hour, viewing aborted', u: 'https://www.tagesspiegel.de/berlin/', d: '2023-04-04'},
  dwe: {t: 'Landeswahlleiterin: Volksentscheid "Deutsche Wohnen & Co. enteignen", official result', u: 'https://www.wahlen-berlin.de/abstimmungen/ve2021/AFSPRAES/ergebnisse.html', d: '2021-10'},
  dwe5: {t: 'entwicklungsstadt: what became of the referendum (status Sept 2026)', u: 'https://www.entwicklungsstadt.de/deutsche-wohnen-enteignen-was-aus-dem-berliner-volksentscheid-wurde/', d: '2026-09-12'},
  reuters: {t: 'Reuters: Vonovia secures majority of Deutsche Wohnen (50.49%)', u: 'https://www.reuters.com/business/vonovia-secures-majority-stake-deutsche-wohnen-2021-09-27/', d: '2021-09-27'},
  bverfg: {t: 'BVerfG press release 28/2021 on 2 BvF 1/20 (Mietendeckel void)', u: 'https://www.bundesverfassungsgericht.de/SharedDocs/Pressemitteilungen/EN/2021/bvg21-028.html', d: '2021-04-15'},
  diw: {t: 'DIW Wochenbericht 8/2021 on the Mietendeckel (asking rents −7 to −11%, listings, Potsdam)', u: 'https://www.diw.de/documents/publikationen/73/diw_01.c.811443.de/21-8-3.pdf', d: '2021-02'},
  komm: {t: 'Expertenkommission Vergesellschaftung, final report (socialisation legally possible)', u: 'https://www.berlin.de/kommission-vergesellschaftung/', d: '2023-06-28'},
  brake: {t: 'Bundestag: Mietpreisbremse extended to 31 Dec 2029', u: 'https://www.bundestag.de/dokumente/textarchiv/2025/kw26-de-mietpreisbremse-1084786', d: '2025-06-26'},
  bgb556: {t: '§§ 556d–556g BGB (Mietpreisbremse, exemptions, Rüge) and § 549 BGB', u: 'https://www.gesetze-im-internet.de/bgb/__556f.html', d: 'current'},
  hubig: {t: 'BT-Drs. 21/1446 / plenary: Justice Minister Hubig, "two chairs" quote', u: 'https://dserver.bundestag.de/btd/21/014/2101446.pdf', d: '2025-06-27'},
  dmb: {t: 'Deutscher Mieterbund, Mietenmonitor 2025 fact sheet (tenant lobby; ad-based)', u: 'https://mieterbund.de/app/uploads/2025/12/FactSheet_DMB_Mietenmonitor_2025.pdf', d: '2025-12'},
  mwz: {t: 'Abgeordnetenhaus Drs. 19/26285: furnished-temporary share of listings (13% 2012, 57% 2023, 48% 2025), €24.14/m² all-in', u: 'https://pardok.parlament-berlin.de/starweb/adis/citat/VT/19/SchrAnfr/S19-26285.pdf', d: '2026-06-23'},
  gswSale: {t: 'BBU: Senate approves GSW sale (€405M + €1.56bn debt, ~65,700 units)', u: 'https://bbu.de/beitraege/senat-stimmt-verkauf-der-gsw-zu', d: '2004-05-26'},
  buyback: {t: 'Senate press release: purchase of ~14,750 flats from Vonovia/Deutsche Wohnen for €2.46bn', u: 'https://www.berlin.de/sen/finanzen/presse/pressemitteilungen/pressemitteilung.1127587.php', d: '2021-09-17'},
  ado: {t: 'Gewobag buys ~5,800 flats from ADO for ~€920M (Tagesspiegel/rbb)', u: 'https://www.rbb24.de/wirtschaft/beitrag/2019/09/gewobag-kauft-ado-wohnungen-berlin.html', d: '2019-09'},
  lwuStock: {t: 'Senate: state-owned housing companies pass 400,000 flats (404,170 end of 2025)', u: 'https://www.berlin.de/sen/bauen/', d: '2026'},
  pop: {t: 'Amt für Statistik Berlin-Brandenburg: population 31 Dec 2025, 3,700,577 (Fortschreibung)', u: 'https://www.statistik-berlin-brandenburg.de/presse/2026/73-bevoelkerungsfortschreibung-2025-berlin/', d: '2026-06-22'},
  pop11: {t: 'Zensus 2011 based population 31 Dec 2011: 3,326,002', u: 'https://www.statistikportal.de/de/bevoelkerung/ergebnisse-des-zensus-2011/zensus-2011-und-fortschreibung-zum-31122011-nach-geschlecht', d: '2013'},
  compl: {t: 'Amt für Statistik Berlin-Brandenburg: completed flats per year (2015–2025)', u: 'https://www.statistik-berlin-brandenburg.de/wirtschaft/wirtschaftsbereiche/gebaeude-und-wohnungen/', d: '2026'},
  compl11: {t: 'Senate answer Drs. 18/16665 (completions 2011–2014)', u: 'https://kleineanfragen.de/berlin/18/16665-wohnungszahl-und-wohnungsabgaenge.txt', d: '2019'},
  step: {t: 'StEP Wohnen 2040 (targets, 3% healthy vacancy reserve, 222,000 flats needed)', u: 'https://www.berlin.de/sen/stadtentwicklung/planung/stadtentwicklungsplaene/step-wohnen-2040/', d: '2024'},
  vac: {t: 'Abgeordnetenhaus Drs. 19/21184: Zensus 2022 vacancy 1.97%, 1.2% for 3+ months', u: 'https://pardok.parlament-berlin.de/starweb/adis/citat/VT/19/SchrAnfr/S19-21184.pdf', d: '2025'},
  buba: {t: 'Deutsche Bundesbank, mortgage rates >10y fixation (1.27% Sep 2021, 3.92% Nov 2023, 4.04% Aug 2026)', u: 'https://www.bundesbank.de/dynamic/action/en/statistics/time-series-databases/time-series-databases/759784/759784?tsId=BBK01.SUD118', d: '2026-09'},
  destatisBau: {t: 'Destatis 61261-0001, construction price index for residential buildings (2021 = 100)', u: 'https://www-genesis.destatis.de/genesis/online?sequenz=tabelleErgebnis&selectionname=61261-0001', d: '2026-09-21'},
  social: {t: 'Abgeordnetenhaus Drs. 19/22754: rent- and allocation-bound flats by Bezirk 2020–2024', u: 'https://pardok.parlament-berlin.de/starweb/adis/citat/VT/19/SchrAnfr/S19-22754.pdf', d: '2025'},
  lor: {t: 'LOR Planungsräume 2021 boundaries (Amt für Statistik Berlin-Brandenburg via ODIS), CC BY 3.0 DE', u: 'https://daten.odis-berlin.de/', d: '2021'},
  vbb: {t: 'VBB GTFS timetable shapes (U-Bahn and S-Bahn lines), March 2026', u: 'https://www.vbb.de/vbb-services/api-open-data/datensaetze/', d: '2026-03'},
  osm: {t: 'Tempelhofer Feld outline, OpenStreetMap relation 7317281 (ODbL)', u: 'https://www.openstreetmap.org/relation/7317281', d: '2026'},
  thf: {t: 'Landeswahlleiter: Volksentscheid "100% Tempelhofer Feld" (64.3% yes, turnout 46.1%)', u: 'https://www.wahlen-berlin.de/abstimmungen/VE2014_TFeld/ErgebnisUeberblick.asp', d: '2014-05-25'},
  thf26: {t: 'Tagesspiegel / rbb: architects propose 21,400 flats on the edge of Tempelhofer Feld', u: 'https://www.rbb24.de/', d: '2026-05'},
  doner: {t: 'Döneratlas Berlin (crowd-sourced, median €7.00, last 180 days)', u: 'https://doeneratlas.de/stadt/berlin', d: '2026-09-30'},
  mate: {t: 'Club-Mate crate 20×0.5 L, typical shop price ~€17 + €4.50 Pfand (getraenkedienst.com, officedrink.de; no survey exists)', u: 'https://officedrink.de/shop/club-mate-20x0-5l-kasten-glas.html', d: 'undated shop pages, checked 2026-10'},
  dticket: {t: 'Deutschlandticket €63/month since 1 Jan 2026 (€66.80 from 2027)', u: 'https://www.bundesregierung.de/breg-de/aktuelles/deutschlandticket', d: '2026-04-30'},
  wage: {t: 'Amt für Statistik Berlin-Brandenburg: average gross hourly earnings €27.42 (April 2025, mean)', u: 'https://www.statistik-berlin-brandenburg.de/presse/2026/87-verdienste-2025/', d: '2026'},
  hhinc: {t: 'IBB Wohnungsmarktbericht 2025: median household net income €2,675/month (Mikrozensus 2024)', u: 'https://www.ibb.de/media/dokumente/publikationen/berliner-wohnungsmarkt/wohnungsmarktbericht/2025/ibb-wmb_tabellenband_2025_bf.pdf', d: '2026-03'},
  wg: {t: 'Moses Mendelssohn Institut / WG-Gesucht: average WG room Berlin €650 (summer semester 2026), €335 (2013)', u: 'https://www.moses-mendelssohn-institut.de/', d: '2026-03-22'},
  schufa: {t: 'SCHUFA BonitätsCheck €29.95; free data copy per Art. 15 GDPR', u: 'https://www.meineschufa.de/', d: '2026'},
  dsk: {t: 'Datenschutzkonferenz, Orientierungshilfe on tenant self-disclosure (V2.0)', u: 'https://www.datenschutzkonferenz-online.de/orientierungshilfen.html', d: '2026-01'},
  bgh09: {t: 'BGH VIII ZR 238/08: no claim to a Mietschuldenfreiheitsbescheinigung', u: 'https://juris.bundesgerichtshof.de/cgi-bin/rechtsprechung/document.py?Gericht=bgh&Art=en&nr=49577', d: '2009-09-30'},
  bmg: {t: '§§ 17, 19, 54 Bundesmeldegesetz (2-week registration, Wohnungsgeberbestätigung, fines)', u: 'https://www.gesetze-im-internet.de/bmg/', d: 'current'},
  wovermg: {t: '§§ 2, 4a, 8 WoVermittG (Bestellerprinzip, Ablöse, fines)', u: 'https://www.gesetze-im-internet.de/wovermrg/', d: 'current'},
  bgb551: {t: '§ 551 BGB (deposit max 3 net cold rents, 3 instalments)', u: 'https://www.gesetze-im-internet.de/bgb/__551.html', d: 'current'},
  bgh97: {t: 'BGH VIII ZR 212/96 (Ablöse void above value + 50%)', u: 'https://www.bundesgerichtshof.de/', d: '1997'},
  police: {t: 'Polizei-Beratung: advance-fee scam with fake landlords abroad', u: 'https://www.polizei-beratung.de/', d: 'current'},
  bmv: {t: 'Berliner Mieterverein (founded 1888, 190,000+ members, €11/month; 2,300 members in 1963)', u: 'https://www.berliner-mieterverein.de/', d: '2019-09-04 / 2025'},
  bmvMag: {t: 'MieterMagazin: 20 m² furnished flat in Charlottenburg for €1,349', u: 'https://www.berliner-mieterverein.de/magazin/', d: '2025-12-03'},
  vonovia: {t: 'Vonovia annual report 2025: 138,354 Berlin units', u: 'https://report.vonovia.com/', d: '2026-03'},
  alliance: {t: 'Tagesspiegel: Senate expels Vonovia from the housing alliance', u: 'https://www.tagesspiegel.de/berlin/', d: '2025-04-11'},
  gdpr: {t: 'LG Berlin I press release 24/2026: Deutsche Wohnen GDPR fine reduced to €900,000 (not final)', u: 'https://www.berlin.de/gerichte/', d: '2026-06-09'},
  vgr: {t: 'Abgeordnetenhaus: Vergesellschaftungsrahmengesetz passed (in force 2028)', u: 'https://www.parlament-berlin.de/', d: '2026-03-12'},
  elect: {t: 'tagesschau: Berlin exploratory talks Linke/Grüne/SPD after the 20 Sept 2026 election', u: 'https://www.tagesschau.de/inland/innenpolitik/berlin-sondierungsgespraeche-100.html', d: '2026-10-08'},
  mr2: {t: 'Bundestag: draft "Mietrecht II" (BT-Drs. 21/6807), first reading, in committee', u: 'https://dserver.bundestag.de/btd/21/068/2106807.pdf', d: '2026-07-09'},
  pruef: {t: 'Senate Mietpreisprüfstelle (free rent check)', u: 'https://www.berlin.de/mietenbuendnis/', d: 'current'},
  is24: {t: 'ImmoScout24 press release: seekers budget €10.48/m², typical offer €18.16; 373 contacts/day for top-10% listings', u: 'https://www.immobilienscout24.de/unternehmen/news-medien/news/', d: '2024-05-02'},
  monaco: {t: 'Monaco: land area 2.08 km² (Monaco government, IMSEE)', u: 'https://www.monaco-statistics.mc/', d: '2024'},
  thfArea: {t: 'Senate (SenUVK): Tempelhofer Feld park ~300 ha (355 ha incl. edges)', u: 'https://www.berlin.de/sen/uvk/natur-und-gruen/stadtgruen/gruenanlagen/tempelhofer-feld/', d: 'current'}
};
const src = (id) => { const s = SRC[id]; return s ? `${s.t}. <a href="${s.u}" target="_blank" rel="noopener">${s.u.replace(/^https?:\/\//, '').slice(0, 60)}${s.u.length > 68 ? '…' : ''}</a> (${s.d})` : id; };

/* ---------------- city-level series ---------------- */
const CITY = {
  // IBB median asking rent, Berlin, € net cold/m² (SRC.ibbAsk)
  askMedian: {2012: 7.20, 2013: 7.84, 2014: 8.21, 2015: 8.50, 2016: 9.00, 2017: 9.77, 2018: 10.32, 2019: 10.45, 2020: 10.14, 2021: 10.55, 2022: 11.54, 2023: 13.99, 2024: 15.74, 2025: 15.78},
  // Mietspiegel city-wide average by edition year (SRC.ibbTab; 2026: SRC.ms26). 2013 edition: WGLi chart citing the Mietspiegel.
  mietspiegel: {2011: 5.21, 2013: 5.54, 2015: 5.84, 2017: 6.39, 2019: 6.72, 2021: 6.79, 2023: 7.16, 2024: 7.21, 2026: 7.71},
  // BBU member companies: share of flats whose tenants gave notice, % (SRC.bbu25 and earlier BBU releases)
  turnoverBBU: {2001: 9.5, 2011: 8.0, 2018: 5.3, 2019: 5.0, 2023: 4.6, 2024: 4.6, 2025: 4.5},
  // completed flats per year (SRC.compl, SRC.compl11)
  completions: {2011: 4491, 2012: 5417, 2013: 6641, 2014: 8744, 2015: 10722, 2016: 13659, 2017: 15669, 2018: 16706, 2019: 18999, 2020: 16337, 2021: 15870, 2022: 17310, 2023: 15965, 2024: 15362, 2025: 11027},
  pop2011: 3326002, pop2025: 3700577
};

/* social housing per Bezirk: rent- and allocation-bound flats 2020 vs 2024 (SRC.social) */
const SOCIAL = {byBez: {'01': [23944, 14788], '02': [19554, 10401], '03': [17617, 6967], '04': [9432, 7249], '05': [9545, 6872], '06': [5740, 4694], '07': [13215, 10913], '08': [15501, 12987], '09': [17172, 10734], '10': [22032, 3653], '11': [22432, 3633], '12': [4305, 4142]}};

/* ---------------- map copy ---------------- */
const MAPCOPY = {
  bezNames: {'01': 'Mitte', '02': 'Friedrichshain-Kreuzberg', '03': 'Pankow', '04': 'Charlottenburg-Wilmersdorf', '05': 'Spandau', '06': 'Steglitz-Zehlendorf', '07': 'Tempelhof-Schöneberg', '08': 'Neukölln', '09': 'Treptow-Köpenick', '10': 'Marzahn-Hellersdorf', '11': 'Lichtenberg', '12': 'Reinickendorf'},
  bezShort: {'01': 'Mitte', '02': 'Friedrichshain-Kreuzberg', '03': 'Pankow', '04': 'Charlottenburg-Wilmersdorf', '05': 'Spandau', '06': 'Steglitz-Zehlendorf', '07': 'Tempelhof-Schöneberg', '08': 'Neukölln', '09': 'Treptow-Köpenick', '10': 'Marzahn-Hellersdorf', '11': 'Lichtenberg', '12': 'Reinickendorf'},
  status: {
    gl: 'Map engine: MapLibre. Trying to load street tiles…',
    tiles: 'Map engine: MapLibre + OpenFreeMap streets (© OpenMapTiles, © OpenStreetMap contributors).',
    paper: 'Map engine: MapLibre on plain paper (street tiles unreachable, so no streets; all data layers work).',
    svg: 'Map engine: offline paper mode (MapLibre or WebGL unavailable). Everything works except 3D.',
    three: '3D: height = the colored value. Drag with right mouse / two fingers to rotate.'
  },
  no3d: '3D needs MapLibre + WebGL, which did not load here.',
  ringLabel: '<b>The Ringbahn</b><span>the moat that stopped working</span>',
  ringLabelAt: [13.4690, 52.5030],
  captions: {
    time: 'Drag the years or press play. Each patch is one of Berlin\'s 542 <i>Planungsräume</i> (planning areas, about 7,000 people each). Color = median asking rent of listings that year, in nominal euros (no inflation adjustment). Hatched = fewer than 21 listings, which IBB calls not representative. Nothing is interpolated: missing years stay grey.',
    gap: 'Left of the handle: what the people already living there pay on average (Zensus 2022, existing leases). Right: the average asking rent if you want in. Same color scale on both sides, so the color jump IS the lock-in. Switch to "ratio" to see the multiplier per area. Existing rents are our own aggregation of the official 100 m census grid.',
    afford: 'Cold rent only. Utilities and heating (Nebenkosten) come on top, so this is the optimistic version. Click any area to make it "your Kiez". The % is weighted by how many rented flats each area has (Zensus 2022), not by land area, because nobody lives in the Grunewald.'
  },
  yearNotes: {
    2012: 'Berlin, 2012: the city of "poor but sexy" (Wowereit, 2003) still mostly holds.',
    2015: '2015: Berlin is the first state to switch on the Mietpreisbremse (1 June).',
    2019: '2019: completions peak at 18,999 flats. Still short of the 20,000 target.',
    2020: '2020: the Mietendeckel freezes rents (from 23 Feb). Asking rents dip, and so do listings.',
    2021: '2021: Karlsruhe voids the Mietendeckel (published 15 April). Then 57.6% vote to socialise big landlords.',
    2022: '2022: interest rates take off. Building gets expensive.',
    2023: '2023: +21% in one year. The red tide is well past the Ring.',
    2025: '2025: flat-ish versus 2024 (+0.3%), which in Berlin counts as good news.'
  },
  afford: {
    moods: ['😐 You can afford roughly nothing. Brandenburg sends its regards.', '😬 A few corners of the map still love you. Mostly the ones far from your friends.', '🙂 A real chunk of the city fits your budget. Now go beat 300 other applicants.', '😎 Most of Berlin fits. You are either rich, sharing, or using 2012 data.'],
    pickHome: 'Click an area on the map to see the income you\'d need to live there.'
  },
  kiezNote: 'Döner at €7.00 (Berlin median, Döneratlas, 30 Sept 2026, crowd-sourced). Cold rent only: heating and utilities come on top. Asking rent = median of online listings, not what every new tenant pays.',
  thf: `<button class="x" aria-label="close">×</button><h5>You double-clicked Tempelhofer Feld 🪁</h5>
    <p>A former airport, about 300 ha of open field, which is bigger than the entire country of Monaco (2.08 km²).</p>
    <p>On 25 May 2014, Berliners voted <b>64.3% yes</b> (turnout 46.1%) for a law that keeps the whole field empty. The Senate had planned about 4,700 flats around the edges.</p>
    <p>In 2026 architects pitched <b>21,400 flats</b> on the edges again. As of October 2026 the field is still a field, and the city's best place to fly a kite while thinking about rent.</p>
    <small>Sources: Landeswahlleiter 2014; SenUVK; Monaco statistics office (IMSEE); rbb/Tagesspiegel May 2026.</small>`,
  walker: {
    search: ['Besichtigung at 6?', '"Nur mit Schufa"', 'Is that a Staffelmiete?', 'möbliert, befristet, €1,900', 'Queue starts here →', '300 people. Cool.'],
    giveUp: ['Fine. Brandenburg.', 'City limit. I live here now.', 'Potsdam is nice too, right?']
  },
  // Bezirk lines: every claim comes from the map's own data (IBB, Zensus) or the Bezirk table (SRC.social, IBB profile)
  quipsBez: {
    '01': 'Mitte: highest median asking rent of any Bezirk in 2025 (€20.00), and the biggest gap to what existing tenants pay (×2.41). The center of town, also the center of the problem.',
    '02': 'Friedrichshain-Kreuzberg: the smallest Bezirk by area. In 2023, 72% of its rental listings were furnished and temporary. Listings, not flats, but still.',
    '03': 'Pankow: asking rents +115% since 2012. It built about 19,000 flats in 2015–2024 and the queue did not notice.',
    '04': 'Charlottenburg-Wilmersdorf: home of the furnished 20 m² flat offered for €1,349, which is about €67 per m².',
    '05': 'Spandau: the smallest gap in Berlin (asking only ×1.76 what neighbors pay). The cheapest way to feel like you got a deal is to move here.',
    '06': 'Steglitz-Zehlendorf: the highest median household income in Berlin (€3,000 net/month) and the lowest renter share (74.9%). People here own their lock-in.',
    '07': 'Tempelhof-Schöneberg: contains Tempelhofer Feld, a 300 ha field that Berliners voted in 2014 to keep empty. Double-click it.',
    '08': 'Neukölln: asking rents doubled since 2012 (+100%) while the Bezirk has the lowest median household income in the city (€2,325 net/month).',
    '09': 'Treptow-Köpenick: built more flats than any other Bezirk in 2015–2024 (26,871). Asking rents still went +140%.',
    '10': 'Marzahn-Hellersdorf: cheapest asking rents in Berlin (€11.56), which is still more than Mitte asked in 2012 (€7.55). Its rent-bound social flats fell from 22,032 (2020) to 3,653 (2024).',
    '11': 'Lichtenberg: 94.5% of flats are rentals, the highest share in Berlin. Its rent-bound social flats fell from 22,432 (2020) to 3,633 (2024), mostly because old bindings simply expired.',
    '12': 'Reinickendorf: asking rents +103% since 2012, the second-lowest renter share (75.7%), and the second-smallest social-flat loss. The quiet one.'
  },
  quipsPlr: {},
  layers: [
    {id: 'bez', n: 'Bezirk borders'},
    {id: 'ring', n: 'Ringbahn ("the moat")'},
    {id: 'lines', n: 'U-Bahn + S-Bahn lines'},
    {id: 'social', n: 'Social housing, 2020 → 2024 (Bezirk)'},
    {id: 'hatch', n: 'Hatch thin data (<21 listings)'},
    {id: 'wohnlage', n: 'Mietspiegel Wohnlagen', missing: true},
    {id: 'landlords', n: 'Big-landlord holdings', missing: true}
  ],
  about: {
    time: {t: 'Asking rents, 2012–2025', src: src('ibbAsk'), gran: '542 LOR Planungsräume (2021 boundaries), every year 2012–2025. Median and mean of listings on online portals.', est: 'Nothing estimated, nothing interpolated. Areas with fewer than 21 listings are hatched (IBB: not representative). A few Spandau areas in 2017–2019 could not be parsed from the PDF and are shown as no data. Euros are nominal. Asking rents are what gets advertised, not what gets signed: big landlords\' new contracts averaged €9.54 in 2025 (IBB), and many cheap flats never hit a portal.'},
    gap: {t: 'Existing vs asking rents', src: src('zensus') + '<br>' + src('ibbAsk'), gran: 'Existing: Zensus 2022 (15 May 2022), mean net cold rent per m² of rented flats, aggregated by us from the official 100 m grid to 542 areas (reproduces Berlin\'s official €7.67 within €0.02). Asking: IBB mean, same areas.', est: 'Our aggregation covers ~94% of rented flats (some grid cells are withheld for privacy). Existing rents are frozen at 2022; picking "2025" compares 2025 listings with 2022 tenants, which slightly overstates the gap (existing rents rose ~7% from the 2024 to the 2026 Mietspiegel). Mean vs mean on purpose: like for like.'},
    afford: {t: 'Can I afford it?', src: src('ibbAsk') + '<br>' + src('zensus'), gran: 'Same 542 areas. Monthly cold rent = area median asking rent × flat size.', est: 'Cold rent only (no heating, no utilities). The 30% rule is a common rule of thumb, not a law. "% of the city" is weighted by rented flats per area from Zensus 2022.'},
    bez: {t: 'Bezirk borders', src: src('lor'), gran: '12 Bezirke, dissolved from the Planungsräume.', est: 'Simplified geometry (about 6% of the original vertices).'},
    ring: {t: 'Ringbahn', src: src('vbb'), gran: 'The S41/S42 loop. Areas whose center lies inside it count as "inside the Ring".', est: 'Simplified line.'},
    lines: {t: 'U-Bahn + S-Bahn', src: src('vbb'), gran: 'Line geometry from GTFS shapes.', est: 'U4 and the U6 north end were missing from the March 2026 GTFS snapshot (probably construction closures) and are drawn as straight lines between stations.'},
    social: {t: 'Social housing per Bezirk', src: src('social'), gran: '12 Bezirke, 2020 and 2024. Rent- and allocation-bound flats (mietpreis- und belegungsgebunden). Dashed ring = 2020, filled = 2024, area ∝ count.', est: 'Most of the drop is ~70,000 flats whose (allocation-only) binding expired, not demolitions. Narrower "social rental flat" counts are lower (85,765 in 2024). No finer-grained public data.'},
    hatch: {t: 'Thin data', src: src('ibbAsk'), gran: 'Per area and year.', est: 'IBB flags areas with fewer than 21 listings as not representative. We show them, hatched, instead of hiding them.'},
    wohnlage: {t: 'Why no Wohnlagen layer?', src: 'Berlin Mietspiegel Wohnlagenkarte (FIS-Broker / gdi.berlin.de).', gran: 'Address-level points.', est: 'The data exists, but its download service was unreachable from our build environment, and we refuse to draw it from memory. Use the official map: <a href="https://www.berlin.de/wohnlagenkarte/" target="_blank" rel="noopener">berlin.de/wohnlagenkarte</a>.'},
    landlords: {t: 'Why no big-landlord layer?', src: 'Vonovia reports 138,354 Berlin units (2025), but not where.', gran: 'No current public breakdown by area exists.', est: 'The only Bezirk-level breakdown we found is Deutsche Wohnen\'s from 2016, before the Vonovia takeover. Too old to paint on a 2025 map.'}
  }
};

/* ---------------- lock-in machine ---------------- */
const LOCKIN = {
  // A tenant in an 85 m² flat (2 kids moved out) vs moving to 55 m².
  // Stay = 85 m² × latest Mietspiegel average published by that year (simplification: sitting tenants pay ~the average).
  // Move = 55 m² × IBB median asking rent that year.
  bigM2: 85, smallM2: 55,
  frames: [
    {y: 2012, mood: 'happy', say: 'Kids moved out. 85 m² for two people is silly. Let\'s downsize!'},
    {y: 2015, mood: 'flat', say: 'Smaller flat costs about the same as our big one? Huh. Next year maybe.'},
    {y: 2018, mood: 'sweat', say: 'Wait. The SMALLER flat now costs MORE than our big one.'},
    {y: 2021, mood: 'sad', say: 'We\'ll keep the spare room. It\'s for… guests. Forever.'},
    {y: 2025, mood: 'smug', say: 'Leave? I will be carried out of this flat in a box.'}
  ]
};

/* ---------------- fights ---------------- */
const FIGHTS = [
  {yr: '2020 – 2021', h: 'Mietendeckel vs Karlsruhe',
    l: {who: 'The Mietendeckel<br><small>Berlin\'s rent freeze</small>', st: {mood: 'angry', arms: 'punch'}},
    r: {who: 'Karlsruhe<br><small>Federal Constitutional Court</small>', st: {mood: 'flat', hat: 'glasses', arms: 'hips'}},
    story: 'Berlin froze about 1.5 million rents at their level of <b>18 June 2019</b>, capped new lettings from 23 Feb 2020, and from November 2020 forced cuts on rents more than 20% above the cap. Asking rents fell 7–11%. Listings roughly halved. Next door in Potsdam, rents rose about 12%.<span class="fn gray" data-note="DIW Wochenbericht 8/2021; IW-Trends 3/2021 found listings −51.8%.">0</span>',
    verdict: '<b>KO, on a technicality that is also the whole point.</b> On 25 March 2021 (published 15 April) the Bundesverfassungsgericht ruled the law "incompatible with the Basic Law and thus void" (2 BvF 1/20). Not because freezing rents is wrong: because rent law is federal, and the Bund had already regulated it in §§ 556–561 BGB. Void from day one, so tenants owed back-rent. Vonovia, Heimstaden and all six state-owned landlords waived theirs.',
    srcs: ['bverfg', 'diw']},
  {yr: '2021 – today', h: '1,035,950 votes vs 0 flats',
    l: {who: 'Deutsche Wohnen & Co. enteignen<br><small>the referendum</small>', st: {mood: 'happy', arms: 'up', prop: 'mega'}},
    r: {who: 'Reality<br><small>5 years later</small>', st: {mood: 'flat', arms: 'shrug'}},
    story: 'On Sunday 26 September 2021, 57.6% of voters (59.1% of valid votes) said yes to socialising landlords with more than 3,000 flats, about 240,000 homes. On Monday, Vonovia announced it now controlled Deutsche Wohnen.<span class="fn gray" data-note="Landeswahlleiterin result; Reuters, 27 Sept 2021 (50.49%).">0</span> An expert commission concluded in June 2023 that socialisation is legal and compensation may be below market value.',
    verdict: '<b>Still in round one.</b> The vote was a non-binding resolution. The Senate passed a framework law in March 2026 that takes effect in 2028 and socialises nothing by itself. The initiative\'s binding draft law has not started collecting signatures. After the 20 Sept 2026 election (Die Linke first, 25.7%), socialisation is on the table in coalition talks that started on 8 October 2026. Flats socialised so far: <b>0</b>.',
    srcs: ['dwe', 'reuters', 'komm', 'vgr', 'dwe5', 'elect']},
  {yr: '2015 – 2029', h: 'Mietpreisbremse vs its own footnotes',
    l: {who: 'The Mietpreisbremse<br><small>rent brake</small>', st: {mood: 'smug', arms: 'hips', hat: 'glasses'}},
    r: {who: 'The exemptions<br><small>§§ 556e–f, § 549 BGB</small>', st: {mood: 'smug', arms: 'point', hat: 'tophat'}},
    story: 'New leases may be at most 10% above the Mietspiegel. Berlin switched it on first, on 1 June 2015, and it now runs to 31 Dec 2029. Except for: flats first let after 1 Oct 2014; the first letting after a "comprehensive modernisation"; whatever the previous tenant paid; "temporary use", which has no time limit in the law; and a furniture surcharge no statute defines. Breaking it carries <b>no fine</b>. The federal Justice Minister in 2025: "It can\'t be that a landlord puts two chairs in an empty flat and thinks he can then charge much higher prices."<span class="fn gray" data-note="Hubig, 27 June 2025. The tenants\' federation DMB estimates over 45% of ads breach the brake (69% of furnished ads), based on ads and from a tenant lobby.">0</span>',
    verdict: '<b>Alive, binding, and enforced only if you sue your own landlord.</b> Since 2020, a written complaint (Rüge) within 30 months gets overpaid rent back from day one. A fix ("Mietrecht II": max 6–8 months for temporary lets, a capped furniture surcharge) is a bill in committee since July 2026. Not law.',
    srcs: ['brake', 'bgb556', 'hubig', 'dmb', 'mr2']},
  {yr: '2004 vs 2021', h: 'Sell low, buy high',
    l: {who: 'Berlin, 2004<br><small>broke, selling</small>', st: {mood: 'happy', arms: 'shrug'}},
    r: {who: 'Berlin, 2021<br><small>sorry, buying</small>', st: {mood: 'sweat', arms: 'hold', prop: 'phone'}},
    story: 'In 2004 the Senate sold GSW, about 65,700 flats, to Cerberus and Whitehall for <b>€405M plus €1.56bn of debt</b>. The finance senator called it a remarkable success. GSW later became part of Deutsche Wohnen (2013), which became part of Vonovia (2021). In September 2021 Berlin bought about 14,750 flats back from Vonovia and Deutsche Wohnen for <b>€2.46bn</b>, with asbestos in the 1970s/80s buildings included.',
    verdict: '<b>Per flat, nominal, different flats:</b> sold for about <b>€6,200</b> cash (about <b>€30,000</b> including debt). Bought back for about <b>€167,000</b>. The state landlords now own 404,170 flats again (end of 2025), up from about 273,000 in 2005. Still short of the ~482,000 of 1990.',
    srcs: ['gswSale', 'buyback', 'lwuStock']}
];

/* ---------------- characters ---------------- */
const CHARS = [
  {nm: 'The Bestandsmieter', nick: '"smug, immortal"', c: '#9ed39e', st: {mood: 'smug', arms: 'hips', hat: 'glasses'},
    bio: 'Signed in 2009. Pays around the Mietspiegel average (€7.71). Rent can rise at most 15% in 3 years, and only up to the Mietspiegel. Will not move. Cannot move. Has become one with the Altbau.', q: 'Under the Mietendeckel my rent was legally frozen at its level of Tuesday, 18 June 2019. Best Tuesday of my life.'},
  {nm: 'The Newcomer', nick: '"has a folder"', c: '#f7c39b', st: {mood: 'sweat', arms: 'hold', prop: 'phone'},
    bio: 'Median asking rent €15.78. Only 40,014 regular listings in all of 2025, versus 64,483 in 2012 (IBB). Seekers budget €10.48/m²; the typical offer is €18.16 (ImmoScout24, 2024).', q: 'I have 47 tabs open and a PDF called "dossier_FINAL_v9".'},
  {nm: 'The Big Landlord', nick: '"we\'re a platform"', c: '#c9c1f0', st: {mood: 'smug', hat: 'tophat', arms: 'hips'},
    bio: 'Vonovia: 138,354 Berlin units (2025). In April 2025 the Senate expelled it from the city\'s housing alliance for justifying rent rises with Mietspiegel features that the Mietspiegel doesn\'t have.', q: 'The rent increase reflects your excellent bus connection.'},
  {nm: 'The Senat', nick: '"20,000 a year, promise"', c: '#a9d0f0', st: {mood: 'sweat', arms: 'shrug', hat: 'hardhat'},
    bio: 'Target: up to 20,000 new flats a year. Best year ever: 18,999 (2019). 2025: 11,027. Around 2001, with ~100,000 flats empty, it was planning demolitions. Its current plan says Berlin needs 222,000 new ones.', q: 'Next year. Definitely next year.'},
  {nm: 'The Mieterverein', nick: '"since 1888"', c: '#f3e08a', st: {mood: 'angry', arms: 'point', prop: 'mega'},
    bio: 'Berliner Mieterverein: founded 1888, 190,000+ members, €11 a month. In 1963 it had 2,300 members, because rent control made it look pointless. It looks less pointless now.', q: 'Did you check the Mietspiegel before you signed? Sit down. Let\'s talk.'},
  {nm: 'Karlsruhe', nick: '"wrong level, sorry"', c: '#d8d2c6', st: {mood: 'flat', hat: 'glasses', arms: 'down'},
    bio: 'The Federal Constitutional Court. Voided the Mietendeckel in 2021 without an oral hearing. It never said a rent freeze is a bad idea, only that Berlin was the wrong level of government to have it.', q: 'We have no opinion on your rent. We have an opinion on Article 74.'},
  {nm: 'The Möbliert-auf-Zeit Listing', nick: '"two chairs and a dream"', c: '#f2a6a6', st: {mood: 'happy', arms: 'up', hat: 'party'},
    bio: '48% of Berlin rental listings in 2025 (peak 57% in 2023), at €24.14/m² all-in on average (Senate, 2026). By the Senate\'s own estimate it is about a third of actual new leases, because these flats get re-listed a lot.', q: 'Fully furnished*, 11 months, €1,349.<br><small>*a chair</small>'}
];

/* ---------------- Besichtigung simulator ---------------- */
const SIM = {
  scenarios: [
    {id: 'howoge', n: 'State landlord, lottery', applicants: 300, viewers: 10, note: 'HOWOGE: "on average 300 online requests per flat", then 10 are drawn by lot for the viewing (2022). Then one of the 10 gets it.', src: 'howoge'},
    {id: 'gewobag', n: 'State landlord, first 500', applicants: 500, viewers: 10, note: 'Gewobag takes a listing offline at "usually no more than 500 requests" and invites 5–15 people (2023). We use 10.', src: 'gewobag'},
    {id: 'mega', n: 'The megaphone flat', applicants: 1792, viewers: 1792, note: 'One flat in 2019: 1,792 applicants in 12 hours, let in by megaphone in batches of 20–30. Everyone got a viewing. One got the flat.', src: 'tonline'}
  ],
  docs: ['Selbstauskunft', 'Schufa-BonitätsCheck', 'last 3 payslips', 'ID (to look at, not copy)', 'Mietschuldenfreiheitsbescheinigung', 'Anmeldung', 'employment contract', 'cover letter', 'photo of you looking reliable', 'Haftpflicht proof'],
  docNotes: {
    'Mietschuldenfreiheitsbescheinigung': 'Your old landlord doesn\'t have to issue one (BGH 2009), and German data-protection authorities say a new landlord can\'t demand it (Jan 2026).',
    'ID (to look at, not copy)': 'Data-protection guidance (DSK, Jan 2026): a landlord may look at your ID at the viewing but not copy it.',
    'last 3 payslips': 'Market custom, not law. Per the DSK guidance, income proof only once they\'ve picked you, with irrelevant bits blacked out.',
    'Anmeldung': 'You need a flat to register, and many landlords want a registration to give you a flat. See: the loop.',
    'photo of you looking reliable': 'Not required by anything. People do it anyway.'
  },
  boss: {
    hp: 3,
    moves: [
      {n: 'Order the free data copy (Art. 15 GDPR)', dmg: 0, txt: 'It\'s free! It\'s also meant for you, not landlords: no verification code. Schufa uses "Paperwork". It\'s super effective. You take 1 damage.', hurt: 1},
      {n: 'Pay €29.95 for the BonitätsCheck', dmg: 2, txt: 'You now own a PDF that certifies you exist and pay bills. Schufa takes 2 damage, and €29.95 of yours.'},
      {n: 'Ask the landlord to skip it', dmg: 0, txt: 'No law requires a Schufa. No law requires them to pick you either. The landlord picks applicant #2. You take 1 damage.', hurt: 1},
      {n: 'Hand over the Mieterverein membership card', dmg: 0, txt: 'Careful: asking about tenants\'-association membership is off-limits per the data-protection authorities (DSK 2026). Showing it unasked is just bad tactics. You take 1 damage.', hurt: 1},
      {n: 'Show 3 payslips, blacked out properly', dmg: 1, txt: 'Allowed once they\'ve picked you. Schufa takes 1 damage.'}
    ],
    win: 'SCHUFA DEFEATED. Your reward: permission to keep applying.',
    lose: 'You fainted. You wake up in a WG room for €650 (the Berlin average, summer 2026).'
  }
};

/* ---------------- spot the scam / loophole ---------------- */
const SCAMS = [
  {ad: '"I\'m abroad for work. Send the deposit via Western Union to my agent, I\'ll mail you the keys."', v: 'illegal', why: 'Classic advance-fee fraud. There are no keys. There is no landlord.', src: 'police'},
  {ad: '"Viewing fee €50, payable at the door."', v: 'illegal', why: 'Fees or advances just to view are banned for agents (fine up to €25,000).', src: 'wovermg'},
  {ad: '"Agent commission: 2 months\' rent (the landlord hired us)."', v: 'illegal', why: 'Bestellerprinzip since 1 June 2015: whoever hires the agent pays. That\'s the landlord.', src: 'wovermg'},
  {ad: '"Ablöse: €10,000 for the IKEA kitchen (worth ~€1,000)."', v: 'sketchy', why: 'Kitchen buy-outs are legal, but the part above value + 50% is void and you can claim it back for 3 years.', src: 'bgh97'},
  {ad: '"€3,000 Abstand, just so I move out and you get the flat."', v: 'illegal', why: 'Pure "key money" is void. Only proven moving costs can be reimbursed.', src: 'wovermg'},
  {ad: '"Deposit: 3 months\' net cold rent, in 3 monthly instalments."', v: 'legal', why: 'Exactly the legal maximum, and the instalments are your right (§ 551 BGB).', src: 'bgb551'},
  {ad: '"Deposit: 3× warm rent, all before you get the keys."', v: 'illegal', why: 'The cap is 3× net cold, and you may pay in 3 instalments. The excess is void.', src: 'bgb551'},
  {ad: '"Möbliert, befristet 12 Monate, €30/m². Mietpreisbremse doesn\'t apply to furnished!"', v: 'sketchy', why: 'Furnished flats are NOT exempt. "Temporary use" only counts if the use is genuinely temporary. Courts have cut such rents by more than half.', src: 'bgb556'},
  {ad: '"Indexmiete: rent follows the consumer price index."', v: 'legal', why: 'Legal (§ 557b BGB). The brake only checks the starting rent; then it rides inflation.', src: 'bgb556'},
  {ad: '"Please bring a copy of your passport to the viewing."', v: 'sketchy', why: 'Data-protection guidance (2026): showing ID is fine, copying it is not. Guidance, not statute.', src: 'dsk'},
  {ad: '"Staffelmiete: +3% every year, written in the contract."', v: 'legal', why: 'Legal (§ 557a BGB), but every step must itself respect the rent brake.', src: 'bgb556'},
  {ad: '"Please confirm you are not a member of a tenants\' association."', v: 'illegal', why: 'Not something a landlord may ask, per the data-protection authorities (DSK 2026). You can leave it blank.', src: 'dsk'}
];

/* ---------------- calculator ---------------- */
const CALC = {
  prices: {
    doner: {v: 7.00, n: 'Döner', icon: '🥙', src: 'doner'},
    mate: {v: 21.50, n: 'Club-Mate crates', icon: '🍾', src: 'mate', note: '~€17 + €4.50 Pfand'},
    dt: {v: 63, n: 'Deutschlandtickets (months)', icon: '🚇', src: 'dticket'},
    wg: {v: 650, n: 'average WG rooms', icon: '🛏️', src: 'wg'},
    hour: {v: 27.42, n: 'hours of work at the average Berlin gross hourly wage', icon: '⏱️', src: 'wage'}
  },
  hhinc: 2675
};

/* ---------------- quiz ---------------- */
const QUIZ = {
  qs: [
    {q: 'When did you sign your current lease?', a: [['Before 2015. Do not speak to me of the market.', {B: 3}], ['2015–2020, the before times', {B: 1, S: 1}], ['2021 or later, at full price', {N: 2, F: 1}], ['I don\'t have a lease, I have a "Zwischenmiete"', {Z: 3}]]},
    {q: 'Your flat has a spare room. You:', a: [['Call it "the office". It stores a bike.', {B: 2}], ['Rent it out. Hello, WG life.', {W: 3}], ['What spare room? We are three in 48 m².', {S: 2, W: 1}], ['Spare room? I live in the spare room.', {Z: 2, W: 1}]]},
    {q: 'Your relationship to the Schufa:', a: [['Never needed one. I have lived here since the Wall.', {B: 3}], ['Paid €29.95 four times this year', {N: 3}], ['I have a printed, laminated copy', {N: 1, F: 2}], ['What is a Schufa', {Z: 2, F: 1}]]},
    {q: 'Your realistic next move is:', a: [['Out of this flat in a box. Feet first.', {B: 3}], ['A lottery draw at HOWOGE', {N: 2, S: 1}], ['Brandenburg. I have checked the RE1 timetable.', {F: 3}], ['Another sublet, another 6 months', {Z: 3}]]}
  ],
  out: {
    B: {n: 'The Immortal Bestandsmieter', st: {mood: 'smug', hat: 'glasses', arms: 'hips'}, t: 'You pay about half of what the market asks, and you know it. Your flat is too big, your rent is too small, and you will never, ever leave. You are not the villain. You are the lock-in effect, personified.'},
    N: {n: 'The Eternal Applicant', st: {mood: 'sweat', arms: 'hold', prop: 'phone'}, t: 'Your dossier has a table of contents. You\'ve been to more Besichtigungen than parties this year. Statistically, at ~1 in 300 per state-landlord flat, you are fine. Statistically.'},
    Z: {n: 'The Sublet Nomad', st: {mood: 'flat', arms: 'shrug'}, t: 'Zwischenmiete, Zwischenmiete, furnished-temporary, Zwischenmiete. You own one suitcase and four Anmeldungen. You have assembled the same IKEA bed in six different Bezirke.'},
    W: {n: 'The WG Lifer', st: {mood: 'happy', arms: 'up'}, t: 'Your room costs about the Berlin average (€650 in 2026, it was €335 in 2013). You have a cleaning rota laminated on the fridge and an opinion about the Bestandsmieter in room 3.'},
    S: {n: 'The Overcrowded Optimist', st: {mood: 'sweat', arms: 'up'}, t: 'You need more space, and the market needs you to stay exactly where you are. The kids share a room. The desk is the ironing board. You open the listings app the way other people open a horoscope.'},
    F: {n: 'The Brandenburg Defector', st: {mood: 'happy', arms: 'point', hat: 'headphones'}, t: 'You did the math, bought noise-cancelling headphones and a Deutschlandticket (€63). You now have a garden and a strong opinion about the regional train.'}
  }
};

/* ---------------- cheat sheet ---------------- */
const RULES = [
  ['Deposit is max <b>3× net cold</b> rent, payable in 3 monthly instalments.', 'bgb551'],
  ['<b>Whoever hires the agent pays.</b> If the landlord ordered the Makler, you pay nothing. Viewing fees are illegal.', 'wovermg'],
  ['New-lease rent may be max <b>Mietspiegel +10%</b>. Exceptions must be disclosed before you sign. Check it free at the Senate\'s Mietpreisprüfstelle.', 'bgb556'],
  ['<b>Sign first, complain later.</b> A written Rüge within 30 months of the start gets overpaid rent back from day one (leases since April 2020). The Mieterverein helps (€11/month, 3-month wait before legal cover).', 'bgb556'],
  ['At a viewing, they may <b>see</b> your ID, not copy it. Nationality, job tenure and tenants\'-union membership are off-limits (data-protection guidance).', 'dsk'],
  ['You can skip the <b>Mietschuldenfreiheitsbescheinigung</b>: your old landlord needn\'t issue it, and the regulators say a new one can\'t demand it.', 'bgh09'],
  ['<b>Anmeldung</b> within 2 weeks of moving in. In Berlin a booked appointment counts as on time. The landlord must give you the Wohnungsgeberbestätigung; selling a fake one costs up to €50,000.', 'bmg'],
  ['<b>Red flags:</b> landlord abroad, money before keys, Western Union, "furnished so no rent brake", a deposit above 3× net cold. Walk.', 'police']
];

/* ---------------- hover glossary ---------------- */
const GLOSS = [
  {g: 'Rent words', t: 'Kaltmiete', a: ['cold rent', 'net cold', 'Nettokaltmiete'], f: 'net cold rent', w: 'Rent for the walls only. Heating, water, trash, caretaker come on top. Every number on this page is cold unless it says otherwise.'},
  {g: 'Rent words', t: 'Warmmiete', a: ['warm rent'], f: 'warm rent', w: 'Cold rent + Nebenkosten (utilities and heating). What actually leaves your account.'},
  {g: 'Rent words', t: 'Nebenkosten', a: ['utilities'], f: 'service charges', w: 'Heating, water, trash, building insurance and friends. Paid monthly in advance and settled once a year in a letter everyone fears.'},
  {g: 'Rent words', t: 'Angebotsmiete', a: ['asking rent', 'asking rents'], f: 'asking rent', w: 'The rent in a listing. What a newcomer is asked to pay, not what anyone already living there pays.'},
  {g: 'Rent words', t: 'Bestandsmiete', a: ['existing rent', 'existing rents', 'Bestandsmieten'], f: 'existing rent', w: 'What people with running leases pay. Much lower than asking rents in Berlin.'},
  {g: 'Rent words', t: 'Bestandsmieter', a: [], f: 'sitting tenant', w: 'Someone with an existing lease. Protected by the 15% cap and long notice periods. Immortal.'},
  {g: 'Rent words', t: 'Mietspiegel', a: [], f: 'rent index', w: 'The official table of "local comparative rent" (ortsübliche Vergleichsmiete), built from rents agreed or changed in the last 6 years. Berlin 2026 average: €7.71/m². It caps rent rises and, via the rent brake, new leases.'},
  {g: 'Rent words', t: 'Wohnlage', a: ['Wohnlagen', 'Wohnlagenkarte'], f: 'residential location class', w: 'Simple, medium or good. Every Berlin address has one in the Mietspiegel, and it moves the allowed rent.'},
  {g: 'Rent words', t: 'Staffelmiete', a: [], f: 'stepped rent', w: 'Rent rises by fixed amounts on fixed dates written in the lease (§ 557a BGB). Each step must respect the rent brake.'},
  {g: 'Rent words', t: 'Indexmiete', a: [], f: 'index-linked rent', w: 'Rent follows the consumer price index (§ 557b BGB). The rent brake only checks the starting rent.'},
  {g: 'Rent words', t: 'Kappungsgrenze', a: [], f: 'cap on increases', w: 'In Berlin, an existing rent may rise at most 15% in 3 years (and never above the Mietspiegel).'},
  {g: 'Rent words', t: 'Kaution', a: ['deposit'], f: 'security deposit', w: 'Max 3 months of net cold rent, payable in 3 instalments (§ 551 BGB).'},
  {g: 'Rent words', t: 'Ablöse', a: ['Abstand'], f: 'buy-out payment', w: 'Money to the previous tenant for furniture or a kitchen. Legal at a fair price; void above value + 50%. Pure "key money" is void.'},
  {g: 'Rent words', t: 'Möbliert auf Zeit', a: ['möbliert', 'befristet', 'Möbliert-auf-Zeit', 'furnished-temporary', 'MWZ'], f: 'furnished, temporary', w: 'Furnished, time-limited lets. Up to half of Berlin listings. Often priced as if the rent brake did not exist.'},
  {g: 'Rent words', t: 'Zwischenmiete', a: ['sublet'], f: 'sublet', w: 'Renting someone\'s flat or room while they are away. Needs the main landlord\'s permission.'},
  {g: 'Rent words', t: 'WG', a: ['WG-Zimmer', 'WG room'], f: 'Wohngemeinschaft', w: 'A shared flat. Berlin average room: €650 (summer 2026).'},
  {g: 'Rent words', t: 'Altbau', a: [], f: 'old building', w: 'Pre-1918 (roughly) building with high ceilings, wooden floors and feelings.'},
  {g: 'The hunt', t: 'Besichtigung', a: ['Besichtigungen', 'viewing'], f: 'viewing', w: 'The appointment to see a flat. In Berlin, sometimes with 100+ other people and a queue around the block.'},
  {g: 'The hunt', t: 'Schufa', a: ['SCHUFA'], f: 'Schutzgemeinschaft für allgemeine Kreditsicherung', w: 'Germany\'s private credit bureau. Landlords want its "BonitätsCheck" (€29.95). The free GDPR copy is for you, not for landlords.'},
  {g: 'The hunt', t: 'Mietschuldenfreiheitsbescheinigung', a: [], f: 'certificate of no rent arrears', w: 'A note from your old landlord saying you paid. They don\'t have to write it (BGH 2009), and new landlords can\'t demand it (DSK 2026).'},
  {g: 'The hunt', t: 'Selbstauskunft', a: [], f: 'tenant self-disclosure form', w: 'The landlord\'s questionnaire. Some questions are off-limits (nationality, tenants\'-union membership, job tenure).'},
  {g: 'The hunt', t: 'Anmeldung', a: ['Anmeldungen'], f: 'residence registration', w: 'Registering your address at the Bürgeramt within 2 weeks of moving in (§ 17 BMG). You need it for a tax ID and, in practice, a lot else.'},
  {g: 'The hunt', t: 'Wohnungsgeberbestätigung', a: [], f: 'landlord\'s confirmation of move-in', w: 'A form your landlord must give you so you can do the Anmeldung (§ 19 BMG). Selling fake ones: fine up to €50,000.'},
  {g: 'The hunt', t: 'Bürgeramt', a: [], f: 'citizens\' office', w: 'Where you do the Anmeldung. Appointments averaged ~27 days\' wait in Sept 2025.'},
  {g: 'The hunt', t: 'Makler', a: [], f: 'estate agent', w: 'Since 1 June 2015, whoever hires them pays (Bestellerprinzip).'},
  {g: 'The hunt', t: 'Bestellerprinzip', a: [], f: '"the one who orders pays"', w: 'Rule since 2015 that the party who hires the agent pays the agent.'},
  {g: 'The hunt', t: 'Kiez', a: [], f: 'neighborhood', w: 'Berlin word for your bit of the city. The radius in which you know where the good Späti is.'},
  {g: 'The hunt', t: 'Rüge', a: [], f: 'formal complaint', w: 'A written complaint that your rent breaks the rent brake. Within 30 months of the start, it recovers overpaid rent from day one (leases since April 2020).'},
  {g: 'The hunt', t: 'Döner', a: [], f: 'Döner Kebab', w: 'Berlin\'s unofficial unit of account. Median €7.00 (Döneratlas, Sept 2026).'},
  {g: 'The hunt', t: 'Club-Mate', a: [], f: 'caffeinated mate soda', w: 'Fuel of Berlin\'s tech and club scene. Sold in crates of 20 bottles.'},
  {g: 'The hunt', t: 'Pfand', a: [], f: 'bottle deposit', w: 'Deposit on bottles and crates, refunded when you return them.'},
  {g: 'The hunt', t: 'Späti', a: [], f: 'Spätkauf, late-night shop', w: 'Corner shop open late. Load-bearing infrastructure.'},
  {g: 'Laws and institutions', t: 'Mietpreisbremse', a: ['rent brake'], f: 'rent brake', w: 'New leases may be at most 10% above the Mietspiegel (§ 556d BGB). Berlin since 1 June 2015, extended to 31 Dec 2029. Full of exemptions, no fines.'},
  {g: 'Laws and institutions', t: 'Mietendeckel', a: ['rent freeze'], f: 'rent cap, "rent lid"', w: 'Berlin\'s own rent freeze (Feb 2020). Voided by the Federal Constitutional Court in April 2021 because rent law is federal.'},
  {g: 'Laws and institutions', t: 'BGB', a: [], f: 'Bürgerliches Gesetzbuch', w: 'The German Civil Code. Rent law lives in §§ 535–580a.'},
  {g: 'Laws and institutions', t: 'BVerfG', a: ['Karlsruhe', 'Bundesverfassungsgericht'], f: 'Federal Constitutional Court', w: 'Germany\'s top court for constitutional questions, seated in Karlsruhe.'},
  {g: 'Laws and institutions', t: 'Bund', a: [], f: 'the federal level', w: 'Germany\'s federal government and parliament, as opposed to the states (Länder) like Berlin.'},
  {g: 'Laws and institutions', t: 'Senat', a: ['Senate'], f: 'Berlin state government', w: 'Berlin is a city and a state; its government is called the Senat.'},
  {g: 'Laws and institutions', t: 'Abgeordnetenhaus', a: [], f: 'Berlin state parliament', w: 'Berlin\'s parliament.'},
  {g: 'Laws and institutions', t: 'Bezirk', a: ['Bezirke'], f: 'borough', w: 'Berlin has 12. Each is the size of a decent city.'},
  {g: 'Laws and institutions', t: 'Planungsraum', a: ['Planungsräume'], f: 'planning area (LOR)', w: 'One of 542 small statistical areas (LOR 2021), about 7,000 residents each. The map\'s smallest unit.'},
  {g: 'Laws and institutions', t: 'LOR', a: [], f: 'Lebensweltlich orientierte Räume', w: 'Berlin\'s official system of small statistical areas.'},
  {g: 'Laws and institutions', t: 'Ringbahn', a: [], f: 'circle line', w: 'The S41/S42 S-Bahn loop around central Berlin. "Inside the Ring" used to mean "expensive". Now it means "very expensive".'},
  {g: 'Laws and institutions', t: 'IBB', a: [], f: 'Investitionsbank Berlin', w: 'Berlin\'s state development bank. Publishes the yearly Wohnungsmarktbericht (housing market report) this map is built on.'},
  {g: 'Laws and institutions', t: 'Zensus', a: [], f: 'census', w: 'Germany\'s census. The 2022 round recorded the rent of every rented flat, aggregated to 100 m grid cells.'},
  {g: 'Laws and institutions', t: 'BBU', a: [], f: 'Verband Berlin-Brandenburgischer Wohnungsunternehmen', w: 'Association of mostly municipal and cooperative landlords in Berlin and Brandenburg. Publishes yearly turnover data.'},
  {g: 'Laws and institutions', t: 'Mieterverein', a: ['Berliner Mieterverein'], f: 'tenants\' association', w: 'Berliner Mieterverein: legal advice and representation for members, €11/month.'},
  {g: 'Laws and institutions', t: 'Mietpreisprüfstelle', a: [], f: 'rent-check office', w: 'Senate service that checks for free whether your rent breaks the rent brake.'},
  {g: 'Laws and institutions', t: 'WBS', a: ['Wohnberechtigungsschein'], f: 'housing entitlement certificate', w: 'Income-based certificate you need for most social flats.'},
  {g: 'Laws and institutions', t: 'HOWOGE', a: ['Gewobag', 'degewo'], f: 'state-owned housing company', w: 'One of Berlin\'s six landeseigene Wohnungsbaugesellschaften (state landlords), together 404,170 flats at the end of 2025.'},
  {g: 'Laws and institutions', t: 'GSW', a: [], f: 'Gemeinnützige Siedlungs- und Wohnungsbaugesellschaft', w: 'Berlin\'s public landlord with ~65,700 flats, sold in 2004. Now part of Vonovia via Deutsche Wohnen.'},
  {g: 'Laws and institutions', t: 'Vonovia', a: ['Deutsche Wohnen'], f: 'Germany\'s largest landlord', w: 'Took control of Deutsche Wohnen in Sept 2021. 138,354 Berlin units (2025).'},
  {g: 'Laws and institutions', t: 'DWE', a: ['Deutsche Wohnen & Co. enteignen'], f: '"Expropriate Deutsche Wohnen & Co."', w: 'The citizens\' initiative behind the 2021 referendum on socialising big landlords.'},
  {g: 'Laws and institutions', t: 'Vergesellschaftung', a: ['socialisation', 'socialise', 'socialising', 'socialised'], f: 'socialisation (Art. 15 Basic Law)', w: 'Transferring property into public ownership against compensation. Allowed by Art. 15 of the Basic Law, never used so far.'},
  {g: 'Laws and institutions', t: 'Tempelhofer Feld', a: [], f: 'Tempelhof Field', w: 'The former Tempelhof airport, now a ~300 ha park. A 2014 referendum law keeps it unbuilt.'},
  {g: 'Laws and institutions', t: 'DSK', a: [], f: 'Datenschutzkonferenz', w: 'Conference of Germany\'s data-protection authorities. Issued guidance on what landlords may ask (Jan 2026).'}
];
