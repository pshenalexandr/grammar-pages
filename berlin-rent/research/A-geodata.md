# A — Geodata and numbers for the map (Berlin rent explainer)

Research agent A · compiled 2026-10-08 · all raw files are in `research/raw/`

Conventions
- "€/m²" always means **net cold rent (nettokalt) per m² of living space per month** unless noted otherwise.
- Every number has a source URL, a publication date ("pub") and a data reference year or reference date ("data").
- Decimal commas from German sources are written as points here. Values are quoted as printed. Nothing is interpolated: a missing year is `null`.
- Environment note: the egress proxy **blocks** gdi.berlin.de (FIS-Broker/WFS), daten.berlin.de, ibb.de, statistik-berlin-brandenburg.de, destatis, Overpass/OSM, Wikimedia and others. GitHub, the ODIS S3 bucket and npm could be downloaded directly. PDFs and HTML pages were read through the Exa fetch tool, and tables were parsed from the extracted text.

---

## 1. Boundary and transit geodata (downloaded)

| File (research/raw/) | What | CRS | Features | Key properties | Size | Source / licence |
|---|---|---|---|---|---|---|
| `bezirksgrenzen.geojson` | 12 Bezirke (ALKIS Bezirke, ODIS copy) | CRS84 (WGS84 lon/lat) | 12 | `Gemeinde_name`, `Gemeinde_schluessel` ("001"…"012"), `Land_name`, `Schluessel_gesamt` | 1.24 MB | ODIS file (originally `https://tsb-opendata.s3.eu-central-1.amazonaws.com/bezirksgrenzen/bezirksgrenzen.geojson`, which now returns 404). Downloaded from the identical mirror `https://raw.githubusercontent.com/quadriga-dk/Tabelle-Fallstudie-3/refs/heads/main/data/bezirksgrenzen.geojson`. ALKIS Berlin / Geoportal Berlin, dl-de-zero-2.0. |
| `lor_ortsteile.geojson` | 96 Ortsteile | CRS84 | 96 | `spatial_name` (4-digit code, e.g. "0101"), `OTEIL`, `BEZIRK`, `FLAECHE_HA` | 3.9 MB | ODIS S3: `https://tsb-opendata.s3.eu-central-1.amazonaws.com/ortsteile/lor_ortsteile.geojson` |
| `lor_planungsraeume_2021_epsg25833.geojson` | 542 LOR Planungsräume (2021), original | **EPSG:25833** | 542 | `PLR_ID` (8-digit), `PLR_NAME`, `BEZ` (2-digit), `STAND` (01.01.2021), `GROESSE_M2` | 9.3 MB | ODIS S3: `https://tsb-opendata.s3.eu-central-1.amazonaws.com/lor_planungsgraeume_2021/lor_planungsraeume_2021.geojson` (note the "graeume" typo in the path). Licence: CC BY 3.0 DE, "Amt für Statistik Berlin-Brandenburg / Lebensweltlich orientierte Räume (LOR) (01.01.2021)" (https://daten.berlin.de/datensaetze/lebensweltlich-orientierte-raume-lor-01-01-2021-wfs-34c86848) |
| `lor_planungsraeume_2021_wgs84.geojson` | the same file reprojected by me with pyproj; 6 decimals | CRS84 | 542 | same | 4.4 MB | derived |
| `berlin_landesgrenze_dissolved.geojson` | city boundary: union of the 12 Bezirke, slivers and holes under 1 ha removed | CRS84 | 1 Polygon | `name` | 0.38 MB | derived. Area is 890.67 km² by my computation. IBB gives 89,112 ha (Tab. 1, see section 3f). |
| `tempelhofer_feld_osm.geojson` | Tempelhofer Feld park polygon (OSM relation 7317281, Nominatim export) | CRS84 | 1 | `name`, `osm_id`, `source` | 7 KB | © OpenStreetMap contributors, ODbL. Retrieved through Exa from `https://git.arnes.space/near/earth-observation-for-journalism/raw/commit/b20ce993f4ad04ca3fa282342e1cecad54440275/sources/resources/tempelhofer_feld/tempelhofer_feld.geojson`. The snapshot date is unknown and probably 2023/24, so this is not the latest OSM edit. Area by my computation is 297 ha. It covers the open field only: it excludes the airport building and lies within LOR PLR 07400721 "Paradestraße". |
| `berlin_ubahn_sbahn_lines_vbb.geojson` | 9 U-Bahn lines, 15 S-Bahn lines, and a "Ringbahn" feature | CRS84 LineString | 25 | `line`, `product` (U-Bahn/S-Bahn), `colour` (hex), `n_stops`, `from`, `to`, `geometry_source` | 0.26 MB | Built from VBB GTFS data of about March 2026 (trip start timestamps 2026-03-03), via the npm packages `vbb-shapes@4.16.0`, `vbb-trips@4.17.0` and `vbb-stations@9.4.0` (all ISC; underlying VBB GTFS is CC BY 3.0 per the vbb-trips readme). For each line I took the longest frequent stop sequence and matched it to the GTFS shape that passes every stop within 200 m. All lines matched 100%. Fixes: **U4** was missing from that GTFS snapshot (probably closed for construction), so I drew it with straight lines between its 5 stations. **U6** in the snapshot ends at Kurt-Schumacher-Platz (the northern section was closed for works), so I appended straight lines to Alt-Tegel. Leipzig "S4" was dropped. The U-line colours are the approximate official BVG colours; the S-line colours come from `vbb-line-colors`. |
| `ringbahn_inner_area.geojson` | polygon inside the S-Bahn ring (from the S41 loop shape) | CRS84 | 1 | `area_km2` = 87.65 | 18 KB | derived. 145 of 542 PLR and 13 of 96 Ortsteile have their representative point inside the ring. |
| `berlin-s-bahn-ring_derhuerst_gist.geojson` | coarse hand-drawn Ringbahn polygon (2017) | CRS84 | 1 | none | 3 KB | https://gist.github.com/derhuerst/9a3fca091cb1d48ad0b28743f86676c4 (pub 2017-05-17). Superseded by the file above. |
| `berlin_plz_2013_funke.geojson` | 190 postcode (PLZ) areas, old 1999-era polygons | CRS84 | 190 | `PLZ99`, `PLZ99_N`, `PLZORT99` | 0.48 MB | https://github.com/funkeinteraktiv/Berlin-Geodaten (Berliner Morgenpost, committed 2013-12-02; original http://www.metaspatial.net/download/plz.tar.gz, public domain). Use it only if PLZ-level rents turn up. The current Berlin PLZ set differs slightly. |

Not obtained
- **Official Landesgrenze WFS / ALKIS** (gdi.berlin.de) is blocked here. The dissolved boundary above is equivalent.
- **Wohnlagen per address** (WFS): see section 3c.
- No S-Bahn or U-Bahn station point file was saved. If you need one, `vbb-stations` on npm (registry.npmjs.org works) has coordinates.

Simplification tip: `npx mapshaper lor_planungsraeume_2021_wgs84.geojson -simplify 8% keep-shapes -o precision=0.00001 ...`. mapshaper@0.6 installs fine from npm here.

---

## 2. Asking rents (Angebotsmieten): the "what you'd pay" layer

### 2a. Main series: IBB Wohnungsmarktbericht, Bezirk and Planungsraum, 2012–2025 (complete)
- Source PDF: **https://www.ibb.de/media/dokumente/publikationen/berliner-wohnungsmarkt/wohnungsmarktbericht/2025/ibb-wohnungsmarktbericht-angebotsmieten_2012-2025.pdf**. It is part of IBB Wohnungsmarktbericht 2025; the press release is dated 2026-03-06 (https://www.ibb.de/de/ueber-uns/presse/ibb-wohnungsmarktbericht-2025-stagnierende-angebotsmieten-moderate-bestandsmieten-und-ansehnliche-neubaubilanz.html).
- Data: VALUE Marktdatenbank (online listings), calculations by RegioKontext GmbH. Measure: **median and arithmetic mean, € nettokalt per m² per month, plus the number of listings.** Each data year is the listing year.
- The PDF has, for every year 2012–2025, (i) a Bezirk table with all 12 Bezirke plus Berlin and (ii) a table of all 542 **LOR 2021 Planungsräume**. The PLR IDs use the 2021 scheme for every year, so they join directly to `PLR_ID`.
- Caveats printed by IBB:
  - Planungsräume with fewer than 21 listings are "nicht repräsentativ".
  - For 2012–2017, the "Abweichung der Daten zu dem IBB Wohnungsmarktbericht aufgrund anderer Datengrundlage" means the values differ from the originally published reports.
  - Bezirk and Berlin medians cannot be recomputed from the PLR values. Listings without an address count only toward the Berlin total.
- Files:
  - `raw/asking_rent_bezirk_ibb_2012_2025.csv`: long format with year, bezirk_id, bezirk, median, mean, n_listings, source.
  - `raw/asking_rent_bezirk_ibb_2012_2025.json`: wide medians.
  - `raw/asking_rent_plr_ibb_2012_2025.json`: `data[year][PLR_ID] = {median, n, mean}`. `null` means "keine Daten". All 542 PLR are parsed for 2012–2016 and 2020–2025. Three merged text blocks could not be aligned, so the following PLR are missing (absent, not imputed): 8 in 2017 (Spandau 05100211–05200418), 7 in 2018 (05100312–05200418) and 18 in 2019 (05200420–…).

Median asking rent, € nettokalt/m² (IBB, as printed):

| Bezirk | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mitte | 7.55 | 8.75 | 9.21 | 9.86 | 10.40 | 11.90 | 12.51 | 13.45 | 13.70 | 14.00 | 15.46 | 18.26 | 19.91 | 20.00 |
| Friedrichshain-Kreuzberg | 8.50 | 9.36 | 9.94 | 10.40 | 11.15 | 11.99 | 12.94 | 13.01 | 13.11 | 13.52 | 14.85 | 18.33 | 19.42 | 19.40 |
| Pankow | 7.90 | 8.42 | 8.87 | 9.04 | 9.65 | 10.12 | 10.97 | 10.96 | 10.50 | 11.73 | 12.50 | 14.93 | 17.00 | 17.00 |
| Charlottenburg-Wilmersdorf | 8.50 | 9.24 | 9.50 | 9.81 | 10.30 | 11.20 | 12.00 | 12.63 | 12.38 | 13.29 | 15.00 | 17.20 | 19.39 | 19.17 |
| Spandau | 5.91 | 6.28 | 6.73 | 7.00 | 7.35 | 7.98 | 8.59 | 8.86 | 8.53 | 8.22 | 8.67 | 10.13 | 12.00 | 12.50 |
| Steglitz-Zehlendorf | 7.80 | 8.19 | 8.50 | 8.74 | 9.27 | 9.83 | 10.44 | 10.70 | 10.31 | 11.03 | 12.31 | 13.33 | 14.59 | 15.00 |
| Tempelhof-Schöneberg | 7.33 | 7.75 | 8.06 | 8.50 | 8.86 | 9.50 | 10.30 | 10.52 | 9.97 | 10.22 | 11.31 | 12.94 | 14.67 | 15.79 |
| Neukölln | 6.79 | 7.41 | 7.91 | 8.13 | 8.82 | 9.69 | 10.00 | 10.10 | 9.38 | 9.85 | 10.55 | 13.00 | 14.50 | 13.61 |
| Treptow-Köpenick | 6.50 | 6.94 | 7.25 | 7.70 | 8.18 | 9.00 | 9.62 | 9.93 | 10.19 | 11.00 | 11.60 | 13.56 | 14.45 | 15.60 |
| Marzahn-Hellersdorf | 5.17 | 5.55 | 5.94 | 6.10 | 6.73 | 7.36 | 7.77 | 7.90 | 8.02 | 8.26 | 9.29 | 10.61 | 11.38 | 11.56 |
| Lichtenberg | 6.50 | 7.01 | 7.76 | 7.96 | 8.50 | 9.20 | 9.53 | 9.27 | 9.08 | 8.50 | 10.45 | 12.00 | 15.15 | 13.33 |
| Reinickendorf | 6.29 | 6.60 | 7.02 | 7.50 | 8.00 | 8.65 | 9.17 | 9.42 | 8.84 | 9.66 | 9.66 | 10.61 | 12.15 | 12.80 |
| **Berlin** | 7.20 | 7.84 | 8.21 | 8.50 | 9.00 | 9.77 | 10.32 | 10.45 | 10.14 | 10.55 | 11.54 | 13.99 | 15.74 | 15.78 |

The number of listings for Berlin was 64,483 in 2012, fell to 23,977 in 2023 and rose to 40,014 in 2025. The 2020 dip reflects the Mietendeckel (rent cap), in force from February 2020 until the court ruling in 2021.

Cross-checks:
- IBB's text gives the 2025 Berlin median as "15,78 EUR/m²" with "40.014 Inserate", Mitte 20.00, F-Kreuzberg 19.40, C-Wilmersdorf 19.17, Reinickendorf 12.80, Spandau 12.50 and Marzahn-Hellersdorf 11.56 (https://www.ibb.de/de/ueber-uns/publikationen/wohnungsmarktbericht/2025.html). These match my parse.
- The 2022 Berlin figure of 11.54 and the 2021 figure of 10.55 match https://www.ibb.de/de/ueber-uns/publikationen/wohnungsmarktbericht/2022.html.
- The 2020 figure of 10.14 matches the IBB WMB 2020 PDF.
- Other IBB 2025 numbers: the new-build median was 19.97 and the existing-stock median 14.48. The 80% range of listings for Berlin was 7.88–25.06 (Tabellenband Tab. 25). In 2025, 28% of listings were at 20 € or more and 22% below 10 € (Tab. 26). Sources: https://www.ibb.de/media/dokumente/publikationen/berliner-wohnungsmarkt/wohnungsmarktbericht/2025/ibb-housing-market-report-2025.pdf and the Tabellenband (https://www.ibb.de/media/dokumente/publikationen/berliner-wohnungsmarkt/wohnungsmarktbericht/2025/ibb-wmb_tabellenband_2025_bf.pdf).
- A different measure: the BBU press kit (2026-03, https://bbu.de/sites/default/files/2026-03/Pressemappe%20%22BBU-Marktmonitor%202025%22.pdf) gives a portal asking rent average of "16,61 Euro" (mean, mid-2025). That is the **mean**, not the median.
- AfS gives "10,50 EUR" as the average offer rent in Q2 2022 (https://www.statistik-berlin-brandenburg.de/news/2024/zensus-miete/, pub 2024-08-21). This differs from IBB's 11.54 median for 2022 because of a different data vendor and period.

### 2b. Earlier years (2005–2011) and PLZ level
I did not find these. The GSW/Berlin Hyp–CBRE Wohnmarktreport (PLZ-level, from about 2005) is behind cbre.de and berlinhyp.de, which are both blocked here, and Exa search did not surface machine-readable tables. If needed, the PDFs would have to be fetched manually. **For 2005–2011 the series is missing; leave it null.** The IBB 2012–2025 series at Bezirk and PLR level is the strongest series available.

---

## 3. Existing-tenant rents: the "what your neighbour pays" layer

### 3a. Mietspiegel city-wide average (€ nettokalt/m²)
Mietspiegel figures cover only non-subsidised flats whose rent was newly agreed or changed in the last 4 years (6 years from the 2026 edition). They are not "all tenants".

| Edition | Data cutoff | Average | Source (pub date) |
|---|---|---|---|
| 2005 | – | 4.49 | MieterEcho 2023, https://www.bmgev.de/mieterecho/alle-ausgaben/2023/me-single/article/der-durchschnitt-regiert-berlin/ |
| 2007 | – | null (not found) | – |
| 2009 | 09/2008 | 4.83 (taz gives "4,80") | IZ 2011-06-09, https://www.iz.de/maerkte/news/berliner-mietspiegel-2011-mieten-sind-um-4-gestiegen-110182 ; taz 2011-05-30, https://taz.de/Neuer-Berliner-Mietspiegel/!5119591/ |
| 2011 | 09/2010 | 5.21 | same IZ article; Berliner Zeitung 2011-05-30 |
| 2013 | 09/2012 | 5.54 | WGLi Umschau 3/2019 chart, https://www.wgli.de/media/umschau_fb/Umschau_2019_3/files/basic-html/page5.html |
| 2015 | 09/2014 | 5.84 | IBB Tabellenband 2025, Tab. 23 (pub 2026-03) |
| 2017 | 09/2016 | 6.39 | IBB Tab. 23 |
| 2019 | 09/2018 | 6.72 | IBB Tab. 23 |
| 2021 | 09/2020 | 6.79 | IBB Tab. 23 |
| 2023 | 09/2022 | 7.16 | IBB Tab. 23. This was an index update (×1.054) of the 2021 edition, not a new survey (https://mietspiegel.berlin.de/wp-content/uploads/2026/01/mietspiegel2023.pdf). MieterEcho 434/2023 gives "7,19" in its lead but 7.16 in the body. |
| 2024 | 09/2023 | 7.21 | IBB Tab. 23; BBU (https://bbu.de/print/pdf/node/35685) |
| **2026** | 01.09.2025 | **7.71** ("allgemeiner Mittelwert, ermittelt als Median der Nettokaltmieten") | Senate press release 2026-05-28, https://www.berlin.de/sen/stadt/presse/pressemeldungen/pressemitteilung.1674998.php . The Berliner Mieterverein confirms +6.9% vs 2024 (https://www.berliner-mieterverein.de/presse/pressearchiv/berliner-mietspiegel-2026-2.htm). |

**By Wohnlage** (Mietspiegel average, € nettokalt/m², IBB Tab. 23):

| | 2015 | 2017 | 2019 | 2021 | 2023 | 2024 |
|---|---|---|---|---|---|---|
| einfach | 5.60 | 6.01 | 6.37 | k.A. | k.A. | 6.63 |
| mittel | 5.79 | 6.36 | 6.59 | k.A. | k.A. | 7.20 |
| gut | 6.56 | 7.41 | 7.60 | k.A. | k.A. | 8.56 |

I found no 2026 values by Wohnlage; they may be in the "Dokumentation zum Berliner Mietspiegel 2026" PDF of July 2026 on mietspiegel.berlin.de. The Mietspiegel does **not** publish averages by Bezirk.

### 3b. Existing rent by Bezirk, Ortsteil and LOR: Zensus 2022 (recommended for the widget)
- Official Berlin figure: **7.67 € nettokalt/m²** (mean over rented flats, reference date 15 May 2022). Source: AfS, https://www.statistik-berlin-brandenburg.de/news/2024/zensus-miete/ (pub 2024-08-21). The same page gives 12.46 € for buildings from 2010 on; the highest such value was Charlottenburg-Wilmersdorf at 16.26 €. AfS shows Bezirk values only in an interactive chart, not as text.
- Rented flats: 1,663,184; vacant flats: 40,681 (https://wahlatlas.net/experimente/zensus2022/gemeinden/110000000000.html, from the Zensus database). About 70% of rents were below 8 €. 27.8% (462,961 flats) were below 6 € (BBU, https://bbu.de/print/pdf/node/35685).
- **My own aggregation** (`raw/existing_rent_zensus2022_by_bezirk_and_plr.json`):
  - Input is the official Zensus 2022 100 m grid "Durchschnittliche Nettokaltmiete und Anzahl der Wohnungen" (Destatis, dl-de/by-2-0; download page https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Zensus2022/_publikationen.html). I got it from the mirror https://github.com/JsLth/z22data (`z22_data_100m/rent_avg_0.parquet` with `durchschnMieteQM`, and `dwellings_0.parquet` with `AnzahlWohnungen`), because destatis is blocked here.
  - Method: flat-weighted mean, Σ(rent×n)/Σn, with each cell assigned to a LOR 2021 PLR by the point-in-polygon test on its centre (EPSG:3035).
  - Check: Berlin comes out at **7.656** (official 7.67) and covers 1,568,217 of 1,663,184 rented flats (94%); the rest sit in cells suppressed for confidentiality.
  - Results are given for 12 Bezirke, **96 Ortsteile and all 542 PLR**, with flat counts so you can flag thin areas. One example of a thin area: Stadtrandsiedlung Malchow has only 9 flats in the grid.
  - This is a derived figure, not an official Bezirk statistic. Label it on the page as "Zensus 2022, own calculation from the 100 m grid".

### 3c. Wohnlagenkarte (Mietspiegel residential-location map)
- The **WFS is address points**, not areas: "Wohnlagen nach Adressen zum Berliner Mietspiegel 2026 – [WFS]", dl-de-zero-2.0, pub 2026-05-28 (https://daten.berlin.de/datensaetze/wohnlagen-nach-adressen-zum-berliner-mietspiegel-2026-wfs-809faebe). A 2024 version (https://daten.berlin.de/datensaetze/wohnlagen-nach-adressen-zum-berliner-mietspiegel-2024-wfs-eddbff85) has the fields `schluessel, bezname, plz, strasse, hnr, wol, stadtteil, plr_name` (https://gdi.berlin.de/data/wohnlagenadr2024/docs/Datenformatbeschreibung_Wohnlagen_2024.pdf). Older WFS years: 2003, 2005, 2007, 2013, 2015, 2017, 2021, 2024.
- **Feasibility:** because each point carries `plr_name`, a per-PLR share of einfach/mittel/gut, or the dominant class, can be computed directly by group-by, with no spatial join. Size: Berlin has roughly 380k+ addresses (my estimate), so the address points themselves are too heavy for the page, but a per-PLR aggregate would be tiny. **It could not be downloaded here (gdi.berlin.de is blocked).** To fetch it yourself: `https://gdi.berlin.de/services/wfs/wohnlagenadr2026?service=WFS&version=2.0.0&request=GetCapabilities`, then GetFeature with `outputFormat=application/json&srsName=EPSG:4326` (the layer name is in the capabilities).
- The PDF map "Wohnlagenkarte Berlin zum Mietspiegel 2026" (https://mietspiegel.berlin.de/wp-content/uploads/2026/05/wohnlagenkarte2026.pdf) shows "überwiegend einfache/mittlere/gute Wohnlage" areas. It is not vector data.
- Shares of addresses: 2026 einfach 29.4%, mittel 49.9%, gut 20.7%; 2024 28.5%, 52.1% and 19.4% (Senate press release 2026-05-28, link above).

### 3d. Other existing-rent proxies by Bezirk (partial)
- **BBU members** (landeseigene companies and cooperatives; 722,284 flats), mean existing rent on 30.06.2025: Berlin **7.10** (2024: 6.85). Values for single Bezirke appear in the text only for five: Marzahn-Hellersdorf 6.40, Lichtenberg 6.87, Reinickendorf 6.93, Steglitz-Zehlendorf 7.84, Charlottenburg-Wilmersdorf 7.55. The rest are in JPG charts or a members-only Excel file. Source: https://bbu.de/beitraege/bbu-marktmonitor-2025-bestandsmieten-berlin-zum-30-juni-2025 (pub 2026-02-18).
- BBU new contracts 2024/25: 9.54 overall, ranging from 8.10 (Marzahn-Hellersdorf) to 10.84 (Steglitz-Zehlendorf) (https://bbu.de/beitraege/bbu-marktmonitor-2025-erst-und-wiedervermietungsmieten-berlin-1-juli-2024-bis-30-juni-2025, pub 2026-02-24).
- Landeseigene companies' (LWU) average existing rent in 2024: 6.76 (https://www.berlin.de/sen/bauen/_assets/neubau/bericht_2024_geaendert.pdf).
- Mikrozensus 2022: Berlin average **gross** cold rent (bruttokalt) 9.6 €/m² and rent burden 27.4% (https://www.statistikportal.de/en/node/179909). I found no Bezirk-level rents from the Mikrozensus; the AfS F I 2 page gives only living space per person by Bezirk.

### 3e. Widget comparison per Bezirk (in `raw/bezirk_profile.csv`)
For a like-for-like comparison, compare the **mean** asking rent with the Zensus **mean**. Zensus is May 2022, so the matching asking-rent year is IBB 2022.

| Bezirk | Existing: Zensus 2022 mean (own calc.) | Asking 2022 mean (IBB) | Asking 2025 median (IBB) | Ratio 2025 asking ÷ 2022 existing |
|---|---|---|---|---|
| Mitte | 8.29 | 15.95 | 20.00 | 2.41 |
| Friedrichshain-Kreuzberg | 8.18 | 15.09 | 19.40 | 2.37 |
| Pankow | 8.00 | 13.46 | 17.00 | 2.12 |
| Charlottenburg-Wilmersdorf | 8.39 | 15.46 | 19.17 | 2.28 |
| Spandau | 7.12 | 9.78 | 12.50 | 1.76 |
| Steglitz-Zehlendorf | 8.00 | 13.04 | 15.00 | 1.88 |
| Tempelhof-Schöneberg | 7.57 | 12.40 | 15.79 | 2.09 |
| Neukölln | 7.38 | 12.01 | 13.61 | 1.84 |
| Treptow-Köpenick | 7.45 | 12.29 | 15.60 | 2.09 |
| Marzahn-Hellersdorf | 6.29 | 9.57 | 11.56 | 1.84 |
| Lichtenberg | 7.11 | 11.30 | 13.33 | 1.87 |
| Reinickendorf | 7.12 | 10.53 | 12.80 | 1.80 |
| **Berlin** | 7.67 (official) | 12.73 | 15.78 | 2.06 |

IBB's own framing: the 2025 asking rent was "mehr als doppelt so hoch wie die ortsübliche Vergleichsmiete (7,21 EUR/m²) – mit rund 119 % Unterschied", which IBB calls the highest gap among German big cities (IBB press release 2026-03-06).

---

## 4. Social housing, municipal and large landlords

### 4a. Social housing (Sozialwohnungen)
Two definitions are in use, so label carefully:
1. **"mietpreis- und belegungsgebundene Wohnungen"**: social rental flats plus flats with only an allocation obligation (BelBindG, from the 1990s) plus ModInst-funded flats.
2. **"Sozialmietwohnungen"**: only flats funded under WoBindG/WoFG.

Definition 1, by Bezirk, as of 31 December. Source: Senate answer to Schriftliche Anfrage 19/22754, https://pardok.parlament-berlin.de/starweb/adis/citat/VT/19/SchrAnfr/S19-22754.pdf (2025). The 2024 column is also in 19/22687. Tagesspiegel reported it on 2025-06-13.

| Bezirk | 2020 | 2021 | 2022 | 2023 | 2024 |
|---|---|---|---|---|---|
| Mitte | 23,944 | 19,077 | 17,259 | 16,306 | 14,788 |
| Friedrichshain-Kreuzberg | 19,554 | 14,270 | 12,953 | 11,869 | 10,401 |
| Pankow | 17,617 | 11,131 | 8,222 | 7,653 | 6,967 |
| Charlottenburg-Wilmersdorf | 9,432 | 9,069 | 8,364 | 8,149 | 7,249 |
| Spandau | 9,545 | 9,325 | 8,254 | 7,700 | 6,872 |
| Steglitz-Zehlendorf | 5,740 | 5,681 | 5,654 | 5,277 | 4,694 |
| Tempelhof-Schöneberg | 13,215 | 13,790 | 13,399 | 11,884 | 10,913 |
| Neukölln | 15,501 | 15,461 | 14,316 | 13,704 | 12,987 |
| Treptow-Köpenick | 17,172 | 17,172 | 14,170 | 14,723 | 10,734 |
| Marzahn-Hellersdorf | 22,032 | 13,354 | 8,573 | 9,039 | 3,653 |
| Lichtenberg | 22,432 | 9,452 | 3,383 | 3,531 | 3,633 |
| Reinickendorf | 4,305 | 4,528 | 4,523 | 4,298 | 4,142 |
| **Berlin** | **180,489** | **142,310** | **119,070** | **114,133** | **97,033** |

The Senate explains that about 70,000 BelBindG flats (allocation obligation only, no rent cap) expired by the end of 2024; that is what drives the steep drop in the East. As a share of rental flats, 2024 (IBB Tab. 1): Neukölln 9.2%, Treptow-Köpenick 8.4%, Mitte 7.5% … Lichtenberg 2.3%, Berlin 5.5%.

Definition 2, Sozialmietwohnungen, Berlin total, as of 31 December:
- 2009–2018: 2009 161,233 · 2010 152,874 · 2011 149,954 · 2012 146,466 · 2013 142,151 · 2014 135,346 · 2015 122,002 · 2016 114,915 · 2017 103,441 · 2018 97,872. On 31.07.2019: 95,078. Source: https://pardok.parlament-berlin.de/starweb/adis/citat/VT/18/SchrAnfr/s18-20387.pdf (2019; data from the district housing offices' register).
- 2019: 95,723 (IBB WMB 2020). 2023: 90,654 (S19-18494). 2024: **85,765** (Senate figure, quoted by rbb24 on 2025-04-26, https://www.rbb24.de/wirtschaft/beitrag/2025/04/sozialwohnungen-berlin-verlust-bezahlbare-mietwohnungen.html).
- These disagree with each other: the federal report gives 92,372 for 31.12.2024 (https://www.dielinkebt.de/fileadmin/user_upload/PDF_Dokumente/2025/250521_SozWoB_2024.pdf), and dpa gives 99,849 for end 2023 and 104,757 for end 2022 (https://www.berlin.de/aktuelles/9356017-958090-fast-5100-sozialwohnungen-im-jahr-2024-b.html).
- 1990: "fast 350.000 Sozialwohnungen" (rbb24 2025-04-26).
- The IBB forecast (Tab. 10, data 10/2025) for flats with follow-on subsidy falls from 57,776 in 2025 to 20,938 in 2035.

### 4b. Landeseigene companies (LWU: degewo, GESOBAU, Gewobag, HOWOGE, Stadt und Land, WBM)
- Stock covered by the cooperation agreement (kooperationsrelevanter Bestand): 31.12.2024 **365,134** (degewo 79,405 · GESOBAU 48,354 · Gewobag 74,609 · HOWOGE 76,837 · STADT UND LAND 52,069 · WBM 33,860); 2023: 361,636. Source: https://www.berlin.de/sen/bauen/_assets/neubau/bericht_2024_geaendert.pdf
- A main committee report gives 365,161 for 31.12.2024 and 294,728 for 31.12.2016 (https://www.parlament-berlin.de/adosservice/19/Haupt/vorgang/h19-1691.D-v.pdf).
- **By Bezirk**: no current full table found. From the WVB report (data end 2019), LWU market share was Lichtenberg 39.7%, Marzahn-Hellersdorf 35.4% and Steglitz-Zehlendorf 4.5% (the lowest) (https://bbu.de/sites/default/files/articles/wvb-wirtschaftsbericht-landeswu.pdf).
- There is an address-level WFS "Wohnungsbestand der landeseigenen Wohnungsunternehmen" (pub 31.12.2025, updated 07.04.2026; parcels with 4 or more flats per address; https://daten.berlin.de/datensaetze/wohnungsbestand-der-landeseigenen-wohnungsunternehmen-wfs-4c4e0115). It is blocked here; a per-PLR aggregation would be feasible if you can fetch it.

### 4c. Vonovia and Deutsche Wohnen
- **Not published by Bezirk now.** The only Bezirk breakdown found is Deutsche Wohnen on 31.12.2016, total 106,732, from https://pardok.parlament-berlin.de/starweb/adis/citat/VT/18/SchrAnfr/s18-12569.pdf: Mitte 3,323 · F-Kreuzberg 7,766 · Pankow 9,199 · C-Wilmersdorf 7,673 · Spandau 13,683 · S-Zehlendorf 10,915 · T-Schöneberg 5,145 · Neukölln 11,431 · T-Köpenick 4,674 · M-Hellersdorf 14,872 · Lichtenberg 8,717 · Reinickendorf 9,334. This is pre-merger, and the data year is 2016.
- Vonovia's "Regionalmarkt Berlin" (which may include some surrounding area): 138,354 units on 31.12.2025 (142,941 on 31.12.2024); average in-place rent 8.17 €/m² (https://report.vonovia.com/2025/q4/de/portfolio-im-bewirtschaftungsgeschaeft).
- Deutsche Wohnen says it has "rund 100.000" Berlin flats, which it puts at about 6% of 1.7 million (https://www.deutsche-wohnen.com/fakten-positionen/deutsche-wohnen-in-zahlen, undated).
- **Not usable for a choropleth.**

---

## 5. Population, income and households by Bezirk (latest)

Source: IBB Tabellenband 2025, Tab. 1 (pub 2026-03-06). Data year 2024: population is the Einwohnerregister on 31.12.2024; households and income are Mikrozensus 2024 first results. All of this is in `raw/bezirk_profile.csv` and `.json`.

| Bezirk | Area (ha) | Population 2024 | Households | Median household net income (€/month) | Flats 2024 | Rental share (%) | Completions 2015–24 |
|---|---|---|---|---|---|---|---|
| Mitte | 3,940 | 397,004 | 201,000 | 2,650 | 214,593 | 91.9 | 19,338 |
| Friedrichshain-Kreuzberg | 2,040 | 292,624 | 154,000 | 2,675 | 158,914 | 91.6 | 11,345 |
| Pankow | 10,322 | 427,276 | 218,000 | 2,900 | 228,516 | 87.0 | 19,095 |
| Charlottenburg-Wilmersdorf | 6,469 | 343,500 | 185,000 | 2,750 | 197,177 | 84.0 | 9,484 |
| Spandau | 9,188 | 259,277 | 123,000 | 2,625 | 130,289 | 82.8 | 9,696 |
| Steglitz-Zehlendorf | 10,256 | 310,044 | 150,000 | 3,000 | 162,542 | 74.9 | 5,850 |
| Tempelhof-Schöneberg | 5,305 | 356,959 | 182,000 | 2,775 | 189,048 | 86.0 | 7,869 |
| Neukölln | 4,493 | 329,488 | 173,000 | 2,325 | 168,931 | 83.7 | 6,149 |
| Treptow-Köpenick | 16,773 | 297,236 | 150,000 | 2,800 | 160,034 | 79.6 | 26,871 |
| Marzahn-Hellersdorf | 6,182 | 294,091 | 142,000 | 2,525 | 145,905 | 84.0 | 15,765 |
| Lichtenberg | 5,212 | 315,548 | 163,000 | 2,350 | 168,712 | 94.5 | 19,084 |
| Reinickendorf | 8,932 | 274,098 | 129,000 | 2,700 | 134,005 | 75.7 | 6,053 |
| **Berlin** | 89,112 | 3,897,145 | 1,971,000 | 2,675 | 2,058,666 | 85.1 | 156,599 |

Completions by year and Bezirk (Tab. 13) are in the CSV.

---

## 6. City-wide context (`raw/citywide_numbers.json`)

Population. There are two official counts and they differ by about 210,000, so always say which one you use.
- **Einwohnerregister** (main residence, 31 December): 2010 **3,387,562** (https://www.statistischebibliothek.de/mir/servlets/MCRFileNodeServlet/BBHeft_derivate_00000893/SB_A1-5_h02-10_BE.pdf) · 2011 3,427,114 · 2024 3,897,145 · 2025 **3,913,644** (AfS, reported 2026-02-17, https://www.statistik-berlin-brandenburg.de/meine-region/berlin-statistik/einwohnerbestand/). That is **+526,082 (+15.5%) from 2010 to 2025** (my arithmetic).
- **Amtliche Fortschreibung** (official population update): 31.12.2011 on the Zensus 2011 basis was 3,326,002; the old basis had 3,501,872 (https://www.statistikportal.de/de/bevoelkerung/ergebnisse-des-zensus-2011/zensus-2011-und-fortschreibung-zum-31122011-nach-geschlecht). 31.12.2025: **3,700,577** (AfS, pub 2026-06-22, https://www.statistik-berlin-brandenburg.de/presse/2026/73-bevoelkerungsfortschreibung-2025-berlin/). The 2022 Zensus correction removed 124,767 people statistically (IBB Tab. 29).

Housing completions (Wohn- und Nichtwohnbau including work on existing buildings):
- 2011 4,491 · 2012 5,417 · 2013 6,641 · 2014 8,744, from a Senate answer (https://kleineanfragen.de/berlin/18/16665-wohnungszahl-und-wohnungsabgaenge.txt).
- 2015 10,722 · 2016 13,659 · 2017 15,669 · 2018 16,706 · 2019 18,999 · 2020 16,337 · 2021 15,870 · 2022 17,310 · 2023 15,965 · 2024 15,362 · **2025 11,027**, from AfS (https://www.statistik-berlin-brandenburg.de/wirtschaft/wirtschaftsbereiche/gebaeude-und-wohnungen/).
- 2010 total: null. New-build only was 3,650.
- IBB WMB 2020 notes that 2019's 19,000 was surpassed only in 1997 in the previous 30 years.
- Building permits for flats: 25,052 in 2016, falling to **9,772 in 2024** (IBB Tab. 16).

Stock, households and tenure:
- Flats: 2,058,666 at end 2024 (AfS, https://www.statistik-berlin-brandenburg.de/090-2025/).
- Households: 1,971,000 in 2024 (Mikrozensus, IBB Tab. 34).
- Renter share:
  - **84.6% of households** were renters in 2022 (1,672,000 renter households vs 304,000 owner-occupier households; Mikrozensus 2022, https://www.statistik-berlin-brandenburg.de/f-i-2-4j).
  - 85.1% of the flat stock was rental in 2024 (IBB Tab. 1).
  - 82.4% of flats were rented in Zensus 2022 (https://bbu.de/beitraege/zensus-2022).
- Wohnberechtigungsschein (WBS, the certificate needed for social housing): 49,371 valid WBS holders in 2024 (IBB Tab. 37). 1,174,600 households would be eligible at the WBS 220 income limit (S19-18494).
- Inner-Berlin moves: 286,752 in 2024 (7.4% of residents; IBB Tab. 32).

---

## 7. What exists and what doesn't

| Layer | Granularity | Years | Source | Choropleth-ready? |
|---|---|---|---|---|
| Boundaries: Bezirke, Ortsteile, LOR-PLR 2021, city boundary | 12 / 96 / 542 / 1 | current | ODIS/ALKIS, AfS LOR (files above) | **Yes** (simplify the PLR and Ortsteile files) |
| Tempelhofer Feld, Ringbahn inner area | polygon | about 2023 OSM / 2026 GTFS | OSM / VBB GTFS | Yes (overlay) |
| U-Bahn and S-Bahn lines, Ringbahn | 9 U + 15 S lines | GTFS March 2026 | vbb-shapes/vbb-trips | Yes (overlay; U4 and U6-north drawn as straight lines) |
| **Asking rent, median and mean** | **Bezirk and 542 PLR** | **2012–2025, every year** | IBB / VALUE / RegioKontext | **Yes.** Bezirk level is robust; at PLR level, flag n < 21 |
| Asking rent before 2012, by PLZ | PLZ | about 2005–2011 | GSW/CBRE Wohnmarktreport | **No** (not obtained; blocked) |
| Existing rent: Mietspiegel average | city-wide, plus by Wohnlage | 2005, 2009–2026 (2007 missing; Wohnlage only 2015/17/19/24) | Senate, IBB Tab. 23 | City-wide line chart only |
| **Existing rent: Zensus 2022 mean** | **Bezirk, 96 Ortsteile, 542 PLR** (own calc. from the 100 m grid) | May 2022 only | Destatis grid via z22data | **Yes** (single year; flag thin areas) |
| Existing rent: BBU members | Bezirk (5 of 12 public), city-wide | 2024, 2025 | BBU Marktmonitor | No (incomplete) |
| Wohnlagen (einfach/mittel/gut) | address points with `plr_name` | 2026 (and older) | Senate WFS | **Not downloaded** (blocked). Per-PLR shares are feasible offline |
| Social housing (rent- and allocation-bound) | Bezirk | 2020–2024 | Senate answers | **Yes** (Bezirk) |
| Social rental flats (Sozialmietwohnungen) | city-wide | 2009–2019, 2023, 2024; 1990 approx. | Senate, IBB, rbb | City-wide line chart |
| LWU stock | city-wide by company; Bezirk shares 2019 for 3 Bezirke only | 2016, 2023, 2024 | Senate reports, WVB | City-wide only (the WFS is blocked) |
| Vonovia / Deutsche Wohnen | DW by Bezirk 2016; Vonovia Berlin total | 2016; 2024/2025 | Abgeordnetenhaus; Vonovia annual report | No (out of date) |
| Population, households, median income, flats, completions | Bezirk | 2024 (completions 2015–2024) | IBB Tabellenband / AfS / Mikrozensus | **Yes** |
| City-wide population, completions, permits, households, renter share | city-wide | 2010–2025 | AfS, IBB | Line charts |

---

## 8. Files saved (research/raw/)

Geo files:
- bezirksgrenzen.geojson
- lor_ortsteile.geojson
- lor_planungsraeume_2021_epsg25833.geojson
- lor_planungsraeume_2021_wgs84.geojson
- berlin_landesgrenze_dissolved.geojson
- tempelhofer_feld_osm.geojson
- berlin_ubahn_sbahn_lines_vbb.geojson
- ringbahn_inner_area.geojson
- berlin-s-bahn-ring_derhuerst_gist.geojson
- berlin_plz_2013_funke.geojson

Tables:
- asking_rent_bezirk_ibb_2012_2025.csv and .json
- asking_rent_plr_ibb_2012_2025.json
- existing_rent_zensus2022_by_bezirk_and_plr.json (Bezirke, Ortsteile, PLR)
- bezirk_profile.csv and .json
- citywide_numbers.json
