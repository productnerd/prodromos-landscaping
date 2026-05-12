import type { CompatibilityRule } from '../types/compatibility';

export const COMPATIBILITY_RULES: CompatibilityRule[] = [
  // ═══════════════════════════════════════════════════════════════
  // WALNUT JUGLONE TOXICITY
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'walnut',
    plantB: '*',
    type: 'incompatible',
    maxDistanceM: 15,
    reason: 'Walnut roots produce juglone, which inhibits growth of most nearby plants',
    severity: 'critical',
  },
  {
    plantA: 'walnut',
    plantB: 'grapevine',
    type: 'incompatible',
    maxDistanceM: 20,
    reason: 'Grapevine is extremely sensitive to walnut juglone',
    severity: 'critical',
  },
  {
    plantA: 'walnut',
    plantB: 'cherry',
    type: 'incompatible',
    maxDistanceM: 20,
    reason: 'Cherry is extremely sensitive to walnut juglone',
    severity: 'critical',
  },
  {
    plantA: 'walnut',
    plantB: 'apple',
    type: 'incompatible',
    maxDistanceM: 20,
    reason: 'Apple trees are very sensitive to walnut juglone',
    severity: 'critical',
  },
  {
    plantA: 'walnut',
    plantB: 'peach',
    type: 'incompatible',
    maxDistanceM: 18,
    reason: 'Peach trees are sensitive to walnut juglone',
    severity: 'critical',
  },
  {
    plantA: 'walnut',
    plantB: 'rhododendron',
    type: 'incompatible',
    maxDistanceM: 20,
    reason: 'Rhododendron is extremely sensitive to juglone; will wilt and die within walnut root zone',
    severity: 'critical',
  },
  {
    plantA: 'walnut',
    plantB: 'blueberry',
    type: 'incompatible',
    maxDistanceM: 20,
    reason: 'Blueberry (Ericaceae) is highly sensitive to walnut juglone',
    severity: 'critical',
  },
  {
    plantA: 'walnut',
    plantB: 'peonies',
    type: 'incompatible',
    maxDistanceM: 18,
    reason: 'Peonies are very sensitive to walnut juglone; will fail to thrive within root zone',
    severity: 'critical',
  },
  {
    plantA: 'walnut',
    plantB: 'lilac',
    type: 'incompatible',
    maxDistanceM: 18,
    reason: 'Lilac is sensitive to walnut juglone toxicity',
    severity: 'critical',
  },
  {
    plantA: 'walnut',
    plantB: 'hydrangea',
    type: 'incompatible',
    maxDistanceM: 18,
    reason: 'Hydrangea is sensitive to walnut juglone; will show wilting and chlorosis',
    severity: 'critical',
  },

  // ═══════════════════════════════════════════════════════════════
  // PINE ALLELOPATHY & SOIL ACIDIFICATION
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'pine',
    plantB: 'lavender',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Pine needle drop acidifies soil; lavender needs neutral-alkaline pH',
    severity: 'warning',
  },
  {
    plantA: 'pine',
    plantB: 'lilac',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Pine needle accumulation acidifies soil; lilac requires neutral to alkaline pH',
    severity: 'warning',
  },
  {
    plantA: 'pine',
    plantB: 'iris',
    type: 'incompatible',
    maxDistanceM: 4,
    reason: 'Pine canopy shades and needle litter smothers iris rhizomes which need sun exposure',
    severity: 'warning',
  },

  // ═══════════════════════════════════════════════════════════════
  // NORWAY MAPLE SUPPRESSION
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'maple-norway',
    plantB: '*',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Norway maple has dense shallow roots and heavy canopy shade that suppress most understory plants',
    severity: 'warning',
  },

  // ═══════════════════════════════════════════════════════════════
  // WISTERIA AGGRESSION
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'wisteria',
    plantB: '*',
    type: 'incompatible',
    maxDistanceM: 3,
    reason: 'Wisteria has extremely vigorous roots and twining stems that strangle and outcompete nearby plants',
    severity: 'warning',
  },

  // ═══════════════════════════════════════════════════════════════
  // STONE FRUIT DISEASE TRANSMISSION (Prunus spp.)
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'cherry',
    plantB: 'peach',
    type: 'incompatible',
    maxDistanceM: 6,
    reason: 'Both Prunus spp. share bacterial canker and brown rot; proximity increases infection spread',
    severity: 'warning',
  },
  {
    plantA: 'cherry',
    plantB: 'apricot',
    type: 'incompatible',
    maxDistanceM: 6,
    reason: 'Prunus species cross-transmit bacterial canker and brown rot; apricot is especially susceptible',
    severity: 'warning',
  },
  {
    plantA: 'cherry',
    plantB: 'damaskina-plum',
    type: 'incompatible',
    maxDistanceM: 6,
    reason: 'Prunus species share brown rot, bacterial canker, and black knot fungus',
    severity: 'warning',
  },
  {
    plantA: 'cherry',
    plantB: 'almond',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Both Prunus spp.; share bacterial canker and brown rot pathogens',
    severity: 'warning',
  },
  {
    plantA: 'peach',
    plantB: 'apricot',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Both highly susceptible to peach leaf curl and brown rot; proximity increases spore transmission',
    severity: 'warning',
  },
  {
    plantA: 'peach',
    plantB: 'damaskina-plum',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Prunus species share brown rot, bacterial canker, and plum pox virus vectors',
    severity: 'warning',
  },
  {
    plantA: 'peach',
    plantB: 'almond',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Almond and peach share peach leaf curl and brown rot',
    severity: 'warning',
  },
  {
    plantA: 'apricot',
    plantB: 'damaskina-plum',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Both Prunus spp.; share Eutypa dieback, brown rot, and bacterial canker',
    severity: 'warning',
  },
  {
    plantA: 'apricot',
    plantB: 'almond',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Both Prunus spp.; share shot hole disease and brown rot',
    severity: 'warning',
  },
  {
    plantA: 'damaskina-plum',
    plantB: 'almond',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Both Prunus spp.; share brown rot and bacterial canker',
    severity: 'warning',
  },

  // ═══════════════════════════════════════════════════════════════
  // STRAWBERRY VERTICILLIUM WILT → STONE FRUITS
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'strawberries',
    plantB: 'cherry',
    type: 'incompatible',
    maxDistanceM: 8,
    reason: 'Strawberries harbor Verticillium dahliae which causes wilt disease in cherry trees',
    severity: 'warning',
  },
  {
    plantA: 'strawberries',
    plantB: 'peach',
    type: 'incompatible',
    maxDistanceM: 8,
    reason: 'Strawberries harbor Verticillium dahliae which causes wilt in stone fruits',
    severity: 'warning',
  },
  {
    plantA: 'strawberries',
    plantB: 'apricot',
    type: 'incompatible',
    maxDistanceM: 8,
    reason: 'Strawberries harbor Verticillium dahliae which can cause wilt in apricot trees',
    severity: 'warning',
  },

  // ═══════════════════════════════════════════════════════════════
  // RASPBERRY / BLACKBERRY DISEASE
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'raspberry',
    plantB: 'blackberry',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Both Rubus spp. share cane blight and botrytis; blackberry outcompetes raspberry',
    severity: 'warning',
  },
  {
    plantA: 'grapevine',
    plantB: 'blackberry',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Blackberry is a reservoir host for grape crown gall and fungal diseases',
    severity: 'warning',
  },
  {
    plantA: 'grapevine',
    plantB: 'raspberry',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Raspberry can harbor grape phylloxera and shares botrytis with grapevines',
    severity: 'warning',
  },
  {
    plantA: 'blackberry',
    plantB: 'strawberries',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Blackberry spreads aggressively via suckers, overtaking strawberry beds; shares Verticillium wilt',
    severity: 'warning',
  },

  // ═══════════════════════════════════════════════════════════════
  // SOIL pH CONFLICTS
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'blueberry',
    plantB: 'lavender',
    type: 'incompatible',
    maxDistanceM: 2,
    reason: 'Blueberry needs very acidic soil (pH 4.5–5.5); lavender prefers alkaline',
    severity: 'warning',
  },
  {
    plantA: 'blueberry',
    plantB: 'lilac',
    type: 'incompatible',
    maxDistanceM: 2,
    reason: 'Blueberry needs acidic soil; lilac prefers neutral to alkaline',
    severity: 'warning',
  },
  {
    plantA: 'blueberry',
    plantB: 'iris',
    type: 'incompatible',
    maxDistanceM: 2,
    reason: 'Blueberry needs very acidic soil; bearded iris prefers neutral to alkaline',
    severity: 'warning',
  },
  {
    plantA: 'rhododendron',
    plantB: 'lavender',
    type: 'incompatible',
    maxDistanceM: 2,
    reason: 'Rhododendron needs acidic soil (pH 4.5–6.0); lavender needs neutral-alkaline (pH 6.5–8.0)',
    severity: 'warning',
  },
  {
    plantA: 'rhododendron',
    plantB: 'lilac',
    type: 'incompatible',
    maxDistanceM: 2,
    reason: 'Rhododendron needs strongly acidic soil; lilac needs neutral to alkaline',
    severity: 'warning',
  },
  {
    plantA: 'hydrangea',
    plantB: 'lavender',
    type: 'incompatible',
    maxDistanceM: 2,
    reason: 'Hydrangea needs acidic soil; lavender needs alkaline/neutral',
    severity: 'warning',
  },
  {
    plantA: 'japanese-maple',
    plantB: 'lavender',
    type: 'incompatible',
    maxDistanceM: 2,
    reason: 'Japanese maple needs acidic moist soil; lavender needs alkaline dry soil',
    severity: 'warning',
  },

  // ═══════════════════════════════════════════════════════════════
  // WATER REQUIREMENT MISMATCHES
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'ferns',
    plantB: 'lavender',
    type: 'incompatible',
    maxDistanceM: 2,
    reason: 'Ferns need consistently moist soil; lavender dies from root rot in wet conditions',
    severity: 'warning',
  },
  {
    plantA: 'rhododendron',
    plantB: 'almond',
    type: 'incompatible',
    maxDistanceM: 3,
    reason: 'Rhododendron needs moist acidic soil; almond needs well-drained dry soil',
    severity: 'warning',
  },
  {
    plantA: 'japanese-maple',
    plantB: 'almond',
    type: 'incompatible',
    maxDistanceM: 3,
    reason: 'Japanese maple needs moist acidic conditions; almond needs dry well-drained soil',
    severity: 'warning',
  },

  // ═══════════════════════════════════════════════════════════════
  // MINT / INVASIVE HERB SPREAD
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'mint',
    plantB: '*herbs',
    type: 'incompatible',
    maxDistanceM: 1.5,
    reason: 'Mint spreads aggressively via runners and will crowd out other herbs',
    severity: 'warning',
  },
  {
    plantA: 'spearmint',
    plantB: '*herbs',
    type: 'incompatible',
    maxDistanceM: 1.5,
    reason: 'Spearmint spreads aggressively via runners and will crowd out other herbs',
    severity: 'warning',
  },
  {
    plantA: 'lemon-balm',
    plantB: 'strawberries',
    type: 'incompatible',
    maxDistanceM: 1.5,
    reason: 'Lemon balm self-seeds prolifically and can invade low-growing strawberry beds',
    severity: 'warning',
  },

  // ═══════════════════════════════════════════════════════════════
  // CEDAR DRY SHADE
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'cedar',
    plantB: 'hydrangea',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: 'Cedar creates dry shade with allelopathic leaf litter; hydrangea needs consistent moisture',
    severity: 'warning',
  },

  // ═══════════════════════════════════════════════════════════════
  // MULBERRY ROOT COMPETITION
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'mulberry-vavatsinia',
    plantB: 'strawberries',
    type: 'incompatible',
    maxDistanceM: 5,
    reason: "Mulberry's extensive shallow roots compete aggressively with shallow-rooted strawberries",
    severity: 'warning',
  },

  // ═══════════════════════════════════════════════════════════════
  // BENEFICIAL COMPANIONS
  // ═══════════════════════════════════════════════════════════════
  {
    plantA: 'lavender',
    plantB: 'wild-roses',
    type: 'beneficial',
    maxDistanceM: 3,
    reason: 'Lavender repels aphids that attack roses',
    severity: 'warning',
  },
  {
    plantA: 'lavender',
    plantB: 'almond',
    type: 'beneficial',
    maxDistanceM: 3,
    reason: 'Lavender attracts pollinators for almond flowers; both thrive in dry alkaline soil',
    severity: 'warning',
  },
  {
    plantA: 'lavender',
    plantB: 'strawberries',
    type: 'beneficial',
    maxDistanceM: 2,
    reason: 'Lavender attracts pollinators for strawberry flowers and repels pest insects',
    severity: 'warning',
  },
  {
    plantA: 'chamomile',
    plantB: 'apple',
    type: 'beneficial',
    maxDistanceM: 3,
    reason: 'Chamomile attracts pollinators and beneficial insects for apple trees',
    severity: 'warning',
  },
  {
    plantA: 'chamomile',
    plantB: '*herbs',
    type: 'beneficial',
    maxDistanceM: 1,
    reason: "Chamomile improves vigor and essential oil production in nearby herbs ('plant doctor')",
    severity: 'warning',
  },
  {
    plantA: 'beans',
    plantB: 'pumpkins',
    type: 'beneficial',
    maxDistanceM: 2,
    reason: 'Beans fix nitrogen that pumpkins need; classic companion planting',
    severity: 'warning',
  },
  {
    plantA: 'beans',
    plantB: 'strawberries',
    type: 'beneficial',
    maxDistanceM: 1.5,
    reason: 'Beans fix nitrogen into soil which strawberries benefit from as heavy feeders',
    severity: 'warning',
  },
  {
    plantA: 'grapevine',
    plantB: 'lavender',
    type: 'beneficial',
    maxDistanceM: 3,
    reason: 'Lavender repels pests and attracts pollinators for grapevines',
    severity: 'warning',
  },
  {
    plantA: 'daffodils',
    plantB: 'apple',
    type: 'beneficial',
    maxDistanceM: 4,
    reason: 'Daffodil bulbs contain lycorine which repels voles that damage apple tree roots',
    severity: 'warning',
  },
  {
    plantA: 'daffodils',
    plantB: 'cherry',
    type: 'beneficial',
    maxDistanceM: 4,
    reason: 'Daffodils repel burrowing rodents and attract early pollinators for cherry bloom',
    severity: 'warning',
  },
  {
    plantA: 'daffodils',
    plantB: 'tulips',
    type: 'beneficial',
    maxDistanceM: 0.5,
    reason: 'Daffodils repel rodents that eat tulip bulbs; planting together protects tulips',
    severity: 'warning',
  },
  {
    plantA: 'mint',
    plantB: 'apple',
    type: 'beneficial',
    maxDistanceM: 3,
    reason: "Mint's strong scent deters codling moth and apple maggot flies",
    severity: 'warning',
  },
  {
    plantA: 'lemon-balm',
    plantB: 'apple',
    type: 'beneficial',
    maxDistanceM: 3,
    reason: 'Lemon balm attracts pollinators during apple bloom and deters some fruit pests',
    severity: 'warning',
  },
  {
    plantA: 'ground-covers',
    plantB: 'apple',
    type: 'beneficial',
    maxDistanceM: 3,
    reason: 'Ground cover under apple trees attracts pollinators, suppresses weeds, reduces apple scab splash',
    severity: 'warning',
  },
  {
    plantA: 'ground-covers',
    plantB: 'cherry',
    type: 'beneficial',
    maxDistanceM: 3,
    reason: 'Ground cover under fruit trees suppresses weeds, retains moisture, reduces disease splash',
    severity: 'warning',
  },

  // Acid-garden beneficial groupings
  {
    plantA: 'pine',
    plantB: 'blueberry',
    type: 'beneficial',
    maxDistanceM: 6,
    reason: 'Pine needle drop naturally acidifies soil to the pH 4.5–5.5 blueberries require',
    severity: 'warning',
  },
  {
    plantA: 'pine',
    plantB: 'rhododendron',
    type: 'beneficial',
    maxDistanceM: 6,
    reason: 'Pine provides dappled shade and acidic needle mulch that rhododendrons thrive in',
    severity: 'warning',
  },
  {
    plantA: 'pine',
    plantB: 'ferns',
    type: 'beneficial',
    maxDistanceM: 5,
    reason: 'Ferns naturally grow in the shade and acidic humus under pine trees in Troodos forests',
    severity: 'warning',
  },
  {
    plantA: 'pine',
    plantB: 'hydrangea',
    type: 'beneficial',
    maxDistanceM: 6,
    reason: 'Pine acidifies soil and provides afternoon shade — both preferred by hydrangeas',
    severity: 'warning',
  },
  {
    plantA: 'blueberry',
    plantB: 'rhododendron',
    type: 'beneficial',
    maxDistanceM: 2,
    reason: 'Both Ericaceae family; require acidic soil (pH 4.5–5.5) and similar moisture',
    severity: 'warning',
  },
  {
    plantA: 'blueberry',
    plantB: 'japanese-maple',
    type: 'beneficial',
    maxDistanceM: 3,
    reason: 'Both need acidic moist soil; Japanese maple provides dappled shade blueberries prefer',
    severity: 'warning',
  },
  {
    plantA: 'ferns',
    plantB: 'rhododendron',
    type: 'beneficial',
    maxDistanceM: 2,
    reason: 'Both thrive in acidic moist shade; ferns provide living mulch for rhododendrons',
    severity: 'warning',
  },
  {
    plantA: 'ferns',
    plantB: 'japanese-maple',
    type: 'beneficial',
    maxDistanceM: 2,
    reason: 'Both prefer acidic moist soil and partial shade; classic woodland pairing',
    severity: 'warning',
  },

  // Native Troodos companions
  {
    plantA: 'golden-oak',
    plantB: 'pine',
    type: 'beneficial',
    maxDistanceM: 8,
    reason: 'Natural Troodos companions; share mycorrhizal networks that benefit both species',
    severity: 'warning',
  },
  {
    plantA: 'golden-oak',
    plantB: 'cedar',
    type: 'beneficial',
    maxDistanceM: 8,
    reason: 'Native Troodos companions; share compatible mycorrhizal fungi and rocky well-drained soil',
    severity: 'warning',
  },
];

// Plants that tolerate walnut juglone
export const WALNUT_TOLERANT = new Set([
  'cedar', 'hazelnut', 'beans', 'japanese-silver-grass', 'ground-covers',
  'maple-sycamore', 'maple-norway', 'maple-field', 'golden-oak', 'pine',
]);

// Plants that tolerate Norway maple shade/roots
export const NORWAY_MAPLE_TOLERANT = new Set([
  'ferns', 'ground-covers', 'daffodils', 'tulips',
]);

// Plants that tolerate wisteria proximity
export const WISTERIA_TOLERANT = new Set<string>([]);
