/** Credit for each plant's photo (Wikimedia Commons), shown with the photo as the licences require. */
export interface PhotoCredit {
  artist: string;
  license: string;
  pageUrl: string;
}

export const PLANT_PHOTOS: Record<string, PhotoCredit> = {
  almond: {"artist": "Anna Anichkova", "license": "CC BY-SA 3.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Almond_tree_6241.jpg"},
  androuklia: {"artist": "Andrey Butko", "license": "CC BY-SA 3.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Arbutus_andrachne_habit_(Ab_plant_103).jpg"},
  apple: {"artist": "Helge Klaus Rieder", "license": "CC0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Haux_Apfel_Freilichtmuseum_Roscheider_Hof_Ganzer_Baum_H1.jpg"},
  apricot: {"artist": "Thayne Tuason", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Apricot_Orchard_on_Cascade_Ave_East_Wenatchee_Washington.jpg"},
  beans: {"artist": "Forest and Kim Starr", "license": "CC BY 3.0 us", "pageUrl": "https://commons.wikimedia.org/wiki/File:Starr-110411-4910-Phaseolus_vulgaris-vegetable_garden-Hawea_Pl_Olinda-Maui_(24714782679).jpg"},
  blackberry: {"artist": "Derek Harper", "license": "CC BY-SA 2.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Bramble_thicket_by_Lady_Park_-_geograph.org.uk_-_6733797.jpg"},
  blueberry: {"artist": "Chris Light", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Blueberry_Patch_9781.jpg"},
  cedar: {"artist": "Hopefully Acceptable Username", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Forty_Hall_Cedar_of_Lebanon_(1).jpg"},
  chamomile: {"artist": "Vacant0", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Polje_kamilica,_Plo%C4%8Dica_01.jpg"},
  cherry: {"artist": "Benjamin Gimmel, BenHur", "license": "CC BY-SA 3.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Fr%C3%BChling_bl%C3%BChender_Kirschenbaum.jpg"},
  "climbing-maple": {"artist": "Daderot", "license": "CC0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Schizophragma_hydrangeoides_-_Savill_Garden_-_Windsor_Great_Park,_England_-_DSC06116.jpg"},
  daffodils: {"artist": "citytransportinfo", "license": "CC0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Drift-Daffodil-Narcissus-P1370596_(37176254960).jpg"},
  "damaskina-plum": {"artist": "Gerda Arendt", "license": "CC0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Plum_tree_blossoming,_Ehrenbach,_to_west.jpg"},
  ferns: {"artist": "H. Zell", "license": "CC BY-SA 3.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Lothar_Path_-_Black_Forest_National_Park_-_Pteridium_aquilinum_01.jpg"},
  "golden-oak": {"artist": "Chneophytou", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Golden_oak.JPG"},
  grapevine: {"artist": "W.carter", "license": "CC0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Pergola_with_grapevines.jpg"},
  "ground-covers": {"artist": "Tangopaso", "license": "Public domain", "pageUrl": "https://commons.wikimedia.org/wiki/File:Serpolet_dans_jardin_%C3%A0_la_fran%C3%A7aise.jpg"},
  hazelnut: {"artist": "MPF", "license": "CC BY-SA 3.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Corylus_avellana_shrub.jpg"},
  hydrangea: {"artist": "Cinderkinder", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Northern_California_H._macrophylla_shrub_in_bloom.jpg"},
  iris: {"artist": "David Anstiss", "license": "CC BY-SA 2.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Bearded_Irises_at_Kiln_Court_-_geograph.org.uk_-_2380420.jpg"},
  "japanese-maple": {"artist": "Acabashi", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Acer_palmatum_Atropurpureum_at_Myddelton_House,_Enfield,_London.jpg"},
  "japanese-silver-grass": {"artist": "Michael Garlick", "license": "CC BY-SA 2.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Goodnestone_House_and_Gardens,_Chinese_silver_grass_%27Miscanthus_sinensis%27_1_-_geograph.org.uk_-_7426666.jpg"},
  latzia: {"artist": "Michal Klajban", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Quercus_infectoria_subsp._veneris,_Akamas_Paninsula,_Cyprus.jpg"},
  lavender: {"artist": "Neptuul", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Lavandula_fields.jpg"},
  "lemon-balm": {"artist": "H. Zell", "license": "CC BY-SA 3.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Melissa_officinalis_001.JPG"},
  lilac: {"artist": "Silar", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:02018_0257_Syringa_vulgaris_in_Sanok.jpg"},
  "lotus-fruit": {"artist": "Zeynel Cebeci", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Diospyros_lotus_-_Date_plum.jpg"},
  "maple-autumn-blaze": {"artist": "Famartin", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:2020-10-30_16_47_14_Freeman%27s_Maple_in_autumn_along_Meadowsweet_Drive_in_the_Franklin_Glen_section_of_Chantilly,_Fairfax_County,_Virginia.jpg"},
  "maple-field": {"artist": "Uoaei1", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Mariazell_St._Sebastian_Nazbauer_Feld-Ahorn_01.jpg"},
  "maple-norway": {"artist": "Gmihail at Serbian Wikipedia", "license": "CC BY-SA 3.0 rs", "pageUrl": "https://commons.wikimedia.org/wiki/File:Acer_platanoides_habitus.jpg"},
  mint: {"artist": "H. Zell", "license": "CC BY-SA 3.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Mentha_x_piperita_001.JPG"},
  "mulberry-vavatsinia": {"artist": "malenki", "license": "CC BY 3.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Mulberry_tree_at_Ogren-Kostrec_1.jpg"},
  peach: {"artist": "Silverije", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Kro%C5%A1nja_gori%C4%8Dne_breskve_u_cvatu.jpg"},
  peonies: {"artist": "Acabashi", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Blake_Hall_Essex_pink_Peony_Paeonia_in_shrub_border_01.jpg"},
  pine: {"artist": "Leonid Mamchenkov on Flickr", "license": "CC BY 2.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Pinus_brutia_Cyprus1.jpg"},
  pumpkins: {"artist": "Renhour48", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Carantec_-_Ile_Callot_-_Champ_de_potimarrons_1.jpg"},
  raspberry: {"artist": "Acabashi", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Raspberry_canes_Easton_Lodge_Gardens_walled_garden_01.jpg"},
  rhododendron: {"artist": "Rasbak", "license": "CC BY-SA 3.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Pontische_rododendron_struik_(Rhododendron_ponticum).jpg"},
  "silk-tree": {"artist": "Famartin", "license": "CC BY-SA 3.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:2013-08-26_14_19_55_Mimosa_viewed_from_the_southeast_on_Pennington_Road_near_Stuart_Avenue_in_Ewing,_New_Jersey.jpg"},
  spearmint: {"artist": "Kolforn (Kolforn) I'd appreciate if you could mail me (Kolforn@gmail.com) if you", "license": "CC BY-SA 4.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:-2018-05-13_Garden_mint_plants,_Northrepps,_Cromer.JPG"},
  strawberries: {"artist": "Sandy Gerrard", "license": "CC BY-SA 2.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Sloping_strawberry_bed_at_Trengwainton_Gardens_-_geograph.org.uk_-_6637357.jpg"},
  "sweet-chestnut": {"artist": "Ramón Durán", "license": "CC BY 2.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Casta%C3%B1o_com%C3%BAn_(Castanea_sativa).jpg"},
  tulips: {"artist": "David Dixon", "license": "CC BY-SA 2.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Tulip_Bed,_RHS_Bridgewater_-_geograph.org.uk_-_7168296.jpg"},
  walnut: {"artist": "AnRo0002", "license": "CC0", "pageUrl": "https://commons.wikimedia.org/wiki/File:20150722Juglans_regia1.jpg"},
  "weeping-willow": {"artist": "Avraham", "license": "CC BY-SA 3.0 us", "pageUrl": "https://commons.wikimedia.org/wiki/File:Weeping_Willow_by_Pond.jpg"},
  "wild-roses": {"artist": "Gerda Arendt", "license": "CC0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Ehrenbach,_dog_rose_bush_against_T%C3%BCrmchen.jpg"},
  wisteria: {"artist": "Andrew Dunn", "license": "CC BY-SA 2.0", "pageUrl": "https://commons.wikimedia.org/wiki/File:Wisteria_Sinensis_trained_along_a_wall.jpg"},
};

/** Where a plant's bundled photo lives, or null if it has none. */
export function plantPhotoUrl(id: string): string | null {
  return PLANT_PHOTOS[id] ? `${import.meta.env.BASE_URL}plant-photos/${id}.jpg` : null;
}
