// STORAGE KEYS (Separated to ensure zero interference)
const KEY = 'property_manager_pro_v2';
const UP_KEY = 'property_manager_pro_v2_upcoming';
const DIRECT_KEY = 'property_manager_pro_direct_v1';
const CONFIG_KEY = 'property_manager_pro_config_v1';
const HISTORY_KEY = 'property_manager_pro_history_v1';
const RETENTION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days retention in milliseconds

// CENTRAL CATEGORIES & FILTERS CONFIGURATION
const defaultAppConfig = {
  version: 2,
  locations: [
    { id: 'loc_1', name: 'Rajpur', appliesTo: 'both', enabled: true, isExample: true },
    { id: 'loc_2', name: 'Jakhan', appliesTo: 'both', enabled: true, isExample: true },
    { id: 'loc_3', name: 'Sahastradhara Road', appliesTo: 'both', enabled: true, isExample: true },
    { id: 'loc_4', name: 'Raipur Road', appliesTo: 'both', enabled: true, isExample: true },
    { id: 'loc_5', name: 'Dehradun Central', appliesTo: 'both', enabled: true, isExample: true }
  ],
  types: [
    { id: 'type_1', name: 'Villa', appliesTo: 'both', subcategories: ['Luxury Villa', 'Independent Villa'], enabled: true, isExample: true },
    { id: 'type_2', name: 'Duplex', appliesTo: 'both', subcategories: ['3 BHK Duplex', '4 BHK Duplex'], enabled: true, isExample: true },
    { id: 'type_3', name: 'Plot', appliesTo: 'both', subcategories: ['Residential Plot', 'Commercial Plot'], enabled: true, isExample: true },
    { id: 'type_4', name: 'Apartment', appliesTo: 'both', subcategories: ['Penthouse', 'Studio', 'Standard'], enabled: true, isExample: true },
    { id: 'type_5', name: 'Commercial', appliesTo: 'both', subcategories: ['Office Space', 'Retail Shop'], enabled: true, isExample: true }
  ],
  statuses: [
    { id: 'stat_1', name: 'Available', appliesTo: 'property', badgeClass: 'available', enabled: true, isExample: true },
    { id: 'stat_2', name: 'Hold', appliesTo: 'property', badgeClass: 'hold', enabled: true, isExample: true },
    { id: 'stat_3', name: 'Sold', appliesTo: 'property', badgeClass: 'sold', enabled: true, isExample: true },
    { id: 'stat_4', name: 'Upcoming', appliesTo: 'project', badgeClass: 'upcoming', enabled: true, isExample: true },
    { id: 'stat_5', name: 'Ready', appliesTo: 'both', badgeClass: 'ready', enabled: true, isExample: true }
  ],
  priceCategories: [
    { id: 'pcat_1', name: 'Below ₹1 Cr', minPrice: 0, maxPrice: 9999999, appliesTo: 'both', enabled: true, isExample: true },
    { id: 'pcat_2', name: 'Economical', minPrice: 10000000, maxPrice: 24999999, appliesTo: 'both', enabled: true, isExample: true },
    { id: 'pcat_3', name: 'Mid-Premium', minPrice: 25000000, maxPrice: 49999999, appliesTo: 'both', enabled: true, isExample: true },
    { id: 'pcat_4', name: 'Luxury', minPrice: 50000000, maxPrice: 99999999, appliesTo: 'both', enabled: true, isExample: true },
    { id: 'pcat_5', name: 'Ultra Luxury', minPrice: 100000000, maxPrice: Infinity, appliesTo: 'both', enabled: true, isExample: true }
  ],
  budgetSlabs: [
    { id: 'slab_1', name: '₹1 Cr', minPrice: 0, maxPrice: 19999999, appliesTo: 'both', enabled: true, isExample: true },
    { id: 'slab_2', name: '₹2 Cr', minPrice: 20000000, maxPrice: 29999999, appliesTo: 'both', enabled: true, isExample: true },
    { id: 'slab_3', name: '₹3 Cr', minPrice: 30000000, maxPrice: 39999999, appliesTo: 'both', enabled: true, isExample: true },
    { id: 'slab_4', name: '₹4 Cr', minPrice: 40000000, maxPrice: 49999999, appliesTo: 'both', enabled: true, isExample: true },
    { id: 'slab_5', name: '₹5 Cr+', minPrice: 50000000, maxPrice: Infinity, appliesTo: 'both', enabled: true, isExample: true }
  ],
  sortOptions: [
    { id: 'sort_1', name: 'Newest First', value: 'newest', appliesTo: 'both', enabled: true, isExample: true },
    { id: 'sort_2', name: 'Oldest First', value: 'oldest', appliesTo: 'property', enabled: true, isExample: true },
    { id: 'sort_3', name: 'Price: Low to High', value: 'priceLow', appliesTo: 'both', enabled: true, isExample: true },
    { id: 'sort_4', name: 'Price: High to Low', value: 'priceHigh', appliesTo: 'both', enabled: true, isExample: true },
    { id: 'sort_5', name: 'Name: A to Z', value: 'az', appliesTo: 'both', enabled: true, isExample: true }
  ],
  customFilters: [
    { id: 'cflt_1', name: 'Facing', appliesTo: 'both', options: ['East', 'North', 'West', 'South', 'North-East'], enabled: true, isExample: true },
    { id: 'cflt_2', name: 'BHK Configuration', appliesTo: 'both', options: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'], enabled: true, isExample: true },
    { id: 'cflt_3', name: 'Road Width', appliesTo: 'property', options: ['20 ft', '25 ft', '30 ft', '40 ft+'], enabled: true, isExample: true },
    { id: 'cflt_4', name: 'Possession Status', appliesTo: 'project', options: ['Ready', 'Under Construction', 'Immediate'], enabled: true, isExample: true },
    { id: 'cflt_5', name: 'Furnishing', appliesTo: 'both', options: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'], enabled: true, isExample: true }
  ]
};

function reconcileConfigCategory(storedList, defaultList, deletedIds = new Set()){
  if(!Array.isArray(storedList) || storedList.length === 0){
    return JSON.parse(JSON.stringify(defaultList));
  }

  let result = [];
  let seenIds = new Set();
  let seenNames = new Set();
  let seenValues = new Set();

  storedList.forEach(item => {
    if(!item || typeof item !== 'object') return;
    if(item.id) seenIds.add(item.id);
    if(item.name) seenNames.add(String(item.name).trim().toLowerCase());
    if(item.value) seenValues.add(String(item.value).trim().toLowerCase());
    result.push(item);
  });

  // Ensure all 5 initial default example entries exist unless explicitly deleted by user
  defaultList.forEach((def, defIdx) => {
    let defNormName = (def.name || '').trim().toLowerCase();
    let defNormVal = (def.value || '').trim().toLowerCase();
    let hasMatch = false;

    if(def.id && seenIds.has(def.id)){
      hasMatch = true;
    } else if(defNormName && seenNames.has(defNormName)){
      hasMatch = true;
    } else if(defNormVal && seenValues.has(defNormVal)){
      hasMatch = true;
    }

    if(!hasMatch && (!deletedIds.has(def.id) && !deletedIds.has(defNormName))){
      let copy = JSON.parse(JSON.stringify(def));
      copy.isExample = true;
      if(defIdx < result.length){
        result.splice(defIdx, 0, copy);
      } else {
        result.push(copy);
      }
      if(copy.id) seenIds.add(copy.id);
      if(defNormName) seenNames.add(defNormName);
      if(defNormVal) seenValues.add(defNormVal);
    }
  });

  return result;
}

function loadAppConfig(){
  let needsSave = false;
  let finalConfig = { ...defaultAppConfig, deletedIds: [] };

  try {
    let raw = localStorage.getItem(CONFIG_KEY);
    if(raw){
      let parsed = JSON.parse(raw);
      if(parsed && typeof parsed === 'object'){
        finalConfig.version = Math.max(Number(parsed.version) || 1, defaultAppConfig.version);
        let deletedIds = new Set(Array.isArray(parsed.deletedIds) ? parsed.deletedIds : []);
        finalConfig.deletedIds = Array.from(deletedIds);

        const catKeys = ['locations', 'types', 'statuses', 'priceCategories', 'budgetSlabs', 'sortOptions', 'customFilters'];
        catKeys.forEach(cat => {
          let storedList = parsed[cat];
          let defaultList = defaultAppConfig[cat] || [];
          let reconciled = reconcileConfigCategory(storedList, defaultList, deletedIds);
          finalConfig[cat] = reconciled;
          if(!Array.isArray(storedList) || storedList.length < defaultList.length){
            needsSave = true;
          }
        });
      } else {
        needsSave = true;
      }
    } else {
      needsSave = true;
    }
  } catch(e){
    finalConfig = JSON.parse(JSON.stringify(defaultAppConfig));
    needsSave = true;
  }

  if(needsSave){
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(finalConfig));
    } catch(e){}
  }
  return finalConfig;
}

let appConfig = loadAppConfig();

function saveAppConfig(cfg){
  appConfig = cfg;
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  } catch(e){}
  if(typeof populateAllConfigDropdowns === 'function') populateAllConfigDropdowns();
}

// DEFAULT PROPERTIES DEMO DATA (5 realistic varied records)
const initial = [
  {
    name: 'Nature Crest — 3 BHK Duplex',
    location: 'Rajpur',
    type: 'Duplex',
    bhk: '3 BHK',
    area: 240,
    dim: '35 × 60',
    facing: 'East',
    road: '30 ft',
    price: 19000000,
    status: 'Available',
    owner: 'Amit Sharma',
    phone: '9876543210',
    follow: '2026-09-14',
    map: 'https://maps.google.com/?q=Rajpur+Dehradun',
    photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
    video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    notes: 'Premium 3 BHK duplex near Rajpur Road. Buyer site visit scheduled with family.',
    favorite: true,
    isDemo: true,
    created: '2026-09-01'
  },
  {
    name: 'Sinola Villa',
    location: 'Rajpur',
    type: 'Villa',
    bhk: '4 BHK',
    area: 420,
    dim: '50 × 75',
    facing: 'North',
    road: '40 ft',
    price: 32000000,
    status: 'Available',
    owner: 'RNP Realty',
    phone: '9800001122',
    follow: '2026-09-22',
    map: 'https://maps.google.com/?q=Sinola+Dehradun',
    photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=80',
    video: '',
    notes: 'Independent 4 BHK villa with lush private lawn, servant quarters and scenic valley views.',
    favorite: false,
    isDemo: true,
    created: '2026-08-30'
  },
  {
    name: '5 BHK Villa Jakhan',
    location: 'Jakhan',
    type: 'Villa',
    bhk: '5 BHK',
    area: 500,
    dim: '60 × 80',
    facing: 'West',
    road: '30 ft',
    price: 45000000,
    status: 'Hold',
    owner: 'Orchid Sales',
    phone: '9877001100',
    follow: '2026-09-10',
    map: 'https://maps.google.com/?q=Jakhan+Dehradun',
    photo: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop&q=80',
    video: '',
    notes: 'Prime location on Jakhan main road. Hold for client awaiting bank loan sanction.',
    favorite: false,
    isDemo: true,
    created: '2026-08-28'
  },
  {
    name: '4 BHK Villa Johri Gaon',
    location: 'Johri Gaon',
    type: 'Villa',
    bhk: '4 BHK',
    area: 350,
    dim: '45 × 70',
    facing: 'South',
    road: '25 ft',
    price: 28000000,
    status: 'Available',
    owner: 'Pankaj Negi',
    phone: '9765432109',
    follow: '',
    map: 'https://maps.google.com/?q=Johri+Gaon+Dehradun',
    photo: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80',
    video: '',
    notes: 'Corner villa in quiet residential surroundings with mountain views and wide access road.',
    favorite: false,
    isDemo: true,
    created: '2026-08-27'
  },
  {
    name: 'Sarthak',
    location: 'Rajpur Mussoorie Road',
    type: 'Plot',
    bhk: '',
    area: 300,
    dim: '40 × 67',
    facing: 'East',
    road: '40 ft',
    price: 15000000,
    status: 'Sold',
    owner: 'Sarthak Properties',
    phone: '9876501234',
    follow: '',
    map: 'https://maps.google.com/?q=Rajpur+Mussoorie+Road',
    photo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=80',
    video: '',
    notes: 'Clear title residential plot with 40 ft road frontage. Registry completed.',
    favorite: true,
    isDemo: true,
    created: '2026-08-25'
  }
];

// DEFAULT UPCOMING PROJECTS DEMO DATA (5 realistic varied records)
const initialUpcoming = [
  {
    name: 'Himalayan Heights',
    developer: 'Himalayan Infra Group',
    location: 'Sahastradhara Road',
    type: 'Apartment',
    bhk: '2 & 3 BHK Luxury',
    area: '1450 - 1950 sq.ft',
    price: 18000000,
    maxPrice: 24000000,
    priceCategory: 'Economical',
    budgetSlab: '₹1 Cr',
    launchDate: 'Q4 2026',
    possessionDate: 'Dec 2028',
    status: 'Upcoming',
    owner: 'Sunil Verma',
    phone: '9811223344',
    map: 'https://maps.google.com/?q=Sahastradhara+Road+Dehradun',
    photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&auto=format&fit=crop&q=80',
    video: '',
    brochure: 'https://example.com/himalayan-heights.pdf',
    notes: 'Eco-friendly high-rise towers with panoramic Himalayan views, clubhouse, and badminton courts.',
    favorite: false,
    isDemo: true,
    created: '2026-09-05'
  },
  {
    name: 'Rajpur Valley Villas',
    developer: 'Pinecrest Developers',
    location: 'Rajpur',
    type: 'Villa',
    bhk: '4 & 5 BHK Estate Villas',
    area: '3200 - 4500 sq.ft',
    price: 55000000,
    maxPrice: 75000000,
    priceCategory: 'Luxury',
    budgetSlab: '₹5 Cr+',
    launchDate: 'Nov 2026',
    possessionDate: 'Mar 2029',
    status: 'Pre-Launch',
    owner: 'Amit Negi',
    phone: '9823456781',
    map: 'https://maps.google.com/?q=Rajpur+Dehradun',
    photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=80',
    video: '',
    brochure: 'https://example.com/rajpur-villas.pdf',
    notes: 'Exclusive gated community of luxury mountain villas with private gardens, infinity pool, and club amenities.',
    favorite: true,
    isDemo: true,
    created: '2026-09-04'
  },
  {
    name: 'Jakhan Residency',
    developer: 'Imperial Infra Group',
    location: 'Jakhan',
    type: 'Apartment',
    bhk: '3 BHK Ultra Suites',
    area: '2100 sq.ft',
    price: 28000000,
    maxPrice: 35000000,
    priceCategory: 'Mid-Premium',
    budgetSlab: '₹2 Cr',
    launchDate: 'Sep 2026',
    possessionDate: 'June 2028',
    status: 'Launched',
    owner: 'Vikas Malhotra',
    phone: '9876541230',
    map: 'https://maps.google.com/?q=Jakhan+Dehradun',
    photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
    video: '',
    brochure: 'https://example.com/jakhan-residency.pdf',
    notes: 'Centrally located premium residences with smart home automation and multi-level parking.',
    favorite: false,
    isDemo: true,
    created: '2026-09-02'
  },
  {
    name: 'Mussoorie Road Township',
    developer: 'Earth & Wood Developers',
    location: 'Rajpur Mussoorie Road',
    type: 'Township',
    bhk: 'Plotted & 4 BHK Chalets',
    area: '250 - 500 yd²',
    price: 35000000,
    maxPrice: 60000000,
    priceCategory: 'Mid-Premium',
    budgetSlab: '₹3 Cr',
    launchDate: 'Jan 2027',
    possessionDate: 'Dec 2029',
    status: 'Upcoming',
    owner: 'Dheeraj Bansal',
    phone: '9871122334',
    map: 'https://maps.google.com/?q=Rajpur+Mussoorie+Road',
    photo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=80',
    video: '',
    brochure: 'https://example.com/mussoorie-township.pdf',
    notes: 'Integrated mountain-view township with shopping plaza, medical center, and international school nearby.',
    favorite: false,
    isDemo: true,
    created: '2026-08-28'
  },
  {
    name: 'Raipur Commercial Hub',
    developer: 'Aura Skylines Commercial',
    location: 'Raipur Road',
    type: 'Commercial',
    bhk: 'Office & Retail Spaces',
    area: '800 - 3500 sq.ft',
    price: 22000000,
    maxPrice: 48000000,
    priceCategory: 'Economical',
    budgetSlab: '₹2 Cr',
    launchDate: 'Aug 2026',
    possessionDate: 'Mid 2028',
    status: 'Upcoming',
    owner: 'Karan Anand',
    phone: '9810998877',
    map: 'https://maps.google.com/?q=Raipur+Road+Dehradun',
    photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop&q=80',
    video: '',
    brochure: 'https://example.com/raipur-hub.pdf',
    notes: 'State-of-the-art grade A commercial tower with high footfall retail frontage on main Raipur road.',
    favorite: false,
    isDemo: true,
    created: '2026-08-20'
  }
];

// ==================== PRICE CATEGORIES & BUDGET SLABS ====================
function getPriceCategory(price){
  let p = Number(price) || 0;
  if(typeof appConfig !== 'undefined' && appConfig && Array.isArray(appConfig.priceCategories)){
    let enabledCats = appConfig.priceCategories.filter(x => x.enabled);
    if(enabledCats.length){
      let match = enabledCats.find(c => {
        let min = Number(c.minPrice) || 0;
        let max = (c.maxPrice == null || c.maxPrice === '' || c.maxPrice === Infinity) ? Infinity : Number(c.maxPrice);
        return p >= min && p <= max;
      });
      if(match) return match.name;
    }
  }
  if(p >= 50000000) return 'Luxury';
  if(p >= 25000000) return 'Mid-Premium';
  if(p >= 10000000) return 'Economical';
  return 'Below ₹1 Cr';
}

function getBudgetSlab(price){
  let p = Number(price) || 0;
  if(typeof appConfig !== 'undefined' && appConfig && Array.isArray(appConfig.budgetSlabs)){
    let enabledSlabs = appConfig.budgetSlabs.filter(x => x.enabled);
    if(enabledSlabs.length){
      let match = enabledSlabs.find(s => {
        let min = Number(s.minPrice) || 0;
        let max = (s.maxPrice == null || s.maxPrice === '' || s.maxPrice === Infinity) ? Infinity : Number(s.maxPrice);
        return p >= min && p <= max;
      });
      if(match) return match.name;
    }
  }
  let cr = p / 10000000;
  if(cr >= 5) return '₹5 Cr+';
  if(cr >= 4) return '₹4 Cr';
  if(cr >= 3) return '₹3 Cr';
  if(cr >= 2) return '₹2 Cr';
  if(cr >= 1) return '₹1 Cr';
  return 'Below ₹1 Cr';
}

function getPropertyCategory(price){
  return getPriceCategory(price);
}

function getPropertyBudgetSlab(price){
  return getBudgetSlab(price);
}

// ==================== INDEXEDDB STORAGE ENGINE ====================
const DB_NAME = 'PropertyManagerProDB';
const DB_VERSION = 2;
let db = null;

// DEFAULT DIRECT PROPERTY DEMO DATA (5 realistic varied records)
const initialDirect = [
  {
    id: 'dp_1',
    name: 'Green Valley Direct Villa',
    location: 'Sahastradhara Road',
    type: 'Villa',
    bhk: '4 BHK',
    area: 320,
    dim: '40 × 72',
    facing: 'North-East',
    road: '30 ft',
    price: 24000000,
    status: 'Available',
    owner: 'Rajeev (Direct Owner)',
    phone: '9899002233',
    follow: '2026-09-18',
    map: 'https://maps.google.com/?q=Sahastradhara+Road+Dehradun',
    photo: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80',
    video: '',
    notes: 'Direct client sourcing from owner Rajeev. Clear freehold title, corner plot with mountain views.',
    favorite: false,
    isDirect: true,
    source: 'direct',
    isDemo: true,
    created: '2026-09-02'
  },
  {
    id: 'dp_2',
    name: 'Premium Rajpur Direct Plot',
    location: 'Rajpur',
    type: 'Plot',
    bhk: '',
    area: 250,
    dim: '30 × 75',
    facing: 'East',
    road: '40 ft',
    price: 12500000,
    status: 'Available',
    owner: 'Mohit Verma (Client)',
    phone: '9810004455',
    follow: '',
    map: 'https://maps.google.com/?q=Rajpur+Dehradun',
    photo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    video: '',
    notes: 'Direct from owner. Prime freehold residential plot on main Rajpur axis with clean documentation.',
    favorite: true,
    isDirect: true,
    source: 'direct',
    isDemo: true,
    created: '2026-09-04'
  },
  {
    id: 'dp_3',
    name: 'Jakhan Heights Direct Apartment',
    location: 'Jakhan',
    type: 'Apartment',
    bhk: '3 BHK',
    area: 190,
    dim: '30 × 57',
    facing: 'North',
    road: '30 ft',
    price: 13500000,
    status: 'Hold',
    owner: 'Neha Kapoor (Owner)',
    phone: '9822007788',
    follow: '2026-09-13',
    map: 'https://maps.google.com/?q=Jakhan+Dehradun',
    photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
    video: '',
    notes: 'Direct exclusive mandate from owner Neha Kapoor. Buyer discussion scheduled for today.',
    favorite: false,
    isDirect: true,
    source: 'direct',
    isDemo: true,
    created: '2026-09-06'
  },
  {
    id: 'dp_4',
    name: 'Pacific View Direct Duplex',
    location: 'Dehradun Central',
    type: 'Duplex',
    bhk: '4 BHK',
    area: 290,
    dim: '35 × 75',
    facing: 'West',
    road: '25 ft',
    price: 27500000,
    status: 'Available',
    owner: 'Vikram Singh (Client)',
    phone: '9876003344',
    follow: '',
    map: 'https://maps.google.com/?q=Dehradun',
    photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    video: '',
    notes: 'Direct client listing. Luxury modern duplex with Italian marble flooring, 2 covered car parks.',
    favorite: false,
    isDirect: true,
    source: 'direct',
    isDemo: true,
    created: '2026-09-07'
  },
  {
    id: 'dp_5',
    name: 'Direct Commercial Space',
    location: 'Raipur Road',
    type: 'Commercial',
    bhk: '',
    area: 350,
    dim: '45 × 70',
    facing: 'South',
    road: '60 ft',
    price: 38000000,
    status: 'Available',
    owner: 'Suresh Mehta (Direct Client)',
    phone: '9866002211',
    follow: '',
    map: 'https://maps.google.com/?q=Raipur+Road+Dehradun',
    photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
    video: '',
    notes: 'Prime commercial frontage on main Raipur Road. Direct exclusive sourcing from owner Suresh Mehta.',
    favorite: true,
    isDirect: true,
    source: 'direct',
    isDemo: true,
    created: '2026-09-09'
  }
];

// DEMO RECONCILER: Ensures exactly 5 demo records per category while preserving any user records
const DEMO_VERSION_KEY = 'property_manager_pro_demo_v2';

function reconcileDemoData(){
  try {
    let migrated = false;
    try { migrated = localStorage.getItem(DEMO_VERSION_KEY) === '2'; } catch(e){}
    if(migrated) return;

    let oldDemoNames = new Set([
      'nature crest - 3 bhk duplex', 'sinola villa', '5 bhk villa jakhan', '4 bhk villa johri gao',
      'sarthak', 'narula', 'kochar colony', 'pacific hills', '6 bhk duplex near mb homes',
      'r.n.p', 'orchid', 'kala gao', 'drone vatika', 'vishwanath enclave', 'tanishq vihar',
      'ghati valley', 'central park', 'krishna palm', 'mount crest', 'orchid park', 'supriya',
      'aarunya', 'bima vihar', 'shipra vihar', 'doon divine', '117 gaj raipur road', '199 gaj raipur road'
    ]);

    let oldDirectNames = new Set([
      'rajpur green view villa', 'jakhan main road commercial plot', 'canal road luxury penthouse'
    ]);

    let oldUpcomingNames = new Set([
      'greenwood valley towers', 'sinola hills enclave', 'the grand pine residences',
      'imperial signature estates', 'skyline opus heights', 'the sovereign mansions',
      'aura celestial towers', 'forest hills reserve'
    ]);

    // 1. Properties
    let storedProps = [];
    try { storedProps = JSON.parse(localStorage.getItem(KEY)) || []; } catch(e){}
    let userProps = Array.isArray(storedProps)
      ? storedProps.filter(p => p && p.name && !oldDemoNames.has(String(p.name).trim().toLowerCase()))
      : [];
    let seededProps = initial.map((p, i) => ({
      ...p,
      id: 'p' + (i + 1),
      priceCategory: getPropertyCategory(p.price),
      budgetSlab: getPropertyBudgetSlab(p.price)
    }));
    let finalProps = [...seededProps, ...userProps];
    try { localStorage.setItem(KEY, JSON.stringify(finalProps)); } catch(e){}

    // 2. Direct Properties
    let storedDirect = [];
    try { storedDirect = JSON.parse(localStorage.getItem(DIRECT_KEY)) || []; } catch(e){}
    let userDirect = Array.isArray(storedDirect)
      ? storedDirect.filter(p => p && p.name && !oldDirectNames.has(String(p.name).trim().toLowerCase()))
      : [];
    let seededDirect = initialDirect.map(p => ({
      ...p,
      priceCategory: getPropertyCategory(p.price),
      budgetSlab: getPropertyBudgetSlab(p.price),
      isDirect: true,
      source: 'direct'
    }));
    let finalDirect = [...seededDirect, ...userDirect];
    try { localStorage.setItem(DIRECT_KEY, JSON.stringify(finalDirect)); } catch(e){}

    // 3. Upcoming Projects
    let storedUp = [];
    try { storedUp = JSON.parse(localStorage.getItem(UP_KEY)) || []; } catch(e){}
    let userUp = Array.isArray(storedUp)
      ? storedUp.filter(p => p && p.name && !oldUpcomingNames.has(String(p.name).trim().toLowerCase()))
      : [];
    let seededUp = initialUpcoming.map((p, i) => ({
      ...p,
      id: p.id || ('up' + (i + 1)),
      priceCategory: getPriceCategory(p.price),
      budgetSlab: getBudgetSlab(p.price),
      favorite: p.favorite || false
    }));
    let finalUp = [...seededUp, ...userUp];
    try { localStorage.setItem(UP_KEY, JSON.stringify(finalUp)); } catch(e){}

    try { localStorage.setItem(DEMO_VERSION_KEY, '2'); } catch(e){}
  } catch(err){
    console.error('Demo data reconciliation error:', err);
  }
}

// Initial synchronous fallback to ensure 5 demo records render immediately
function loadInitialProperties(){
  reconcileDemoData();
  try {
    let x = JSON.parse(localStorage.getItem(KEY));
    if(Array.isArray(x) && x.length) return x;
  } catch(e){}
  return initial.map((p, i) => ({
    ...p,
    id: 'p' + (i + 1),
    priceCategory: getPropertyCategory(p.price),
    budgetSlab: getPropertyBudgetSlab(p.price)
  }));
}

function loadInitialUpcoming(){
  reconcileDemoData();
  try {
    let x = JSON.parse(localStorage.getItem(UP_KEY));
    if(Array.isArray(x) && x.length) return x;
  } catch(e){}
  return initialUpcoming.map((p, i) => ({
    ...p,
    id: 'up' + (i + 1),
    priceCategory: getPriceCategory(p.price),
    budgetSlab: getBudgetSlab(p.price),
    favorite: p.favorite || false
  }));
}

function loadInitialDirectProperties(){
  reconcileDemoData();
  try {
    let x = JSON.parse(localStorage.getItem(DIRECT_KEY));
    if(Array.isArray(x) && x.length) return x;
  } catch(e){}
  return initialDirect.map(p => ({
    ...p,
    priceCategory: getPropertyCategory(p.price),
    budgetSlab: getPropertyBudgetSlab(p.price),
    isDirect: true,
    source: 'direct'
  }));
}

let data = loadInitialProperties();
let upcomingData = loadInitialUpcoming();
let directData = loadInitialDirectProperties();

// ==================== PROFILE STATE & STORAGE ====================
const PROFILE_KEY = 'property_manager_pro_profile_v1';
const defaultProfile = {
  name: 'Munendra Singh',
  role: 'Property Manager',
  phone: '+91 98765 43210',
  email: 'munendra.singh@propertypro.com',
  company: 'Property Pro Real Estate',
  photo: ''
};

function loadProfile(){
  try {
    let x = JSON.parse(localStorage.getItem(PROFILE_KEY));
    if(x && typeof x === 'object') return { ...defaultProfile, ...x };
  } catch(e){}
  return { ...defaultProfile };
}

function saveProfile(p){
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch(e){}
  if(typeof dbSaveProfile === 'function') dbSaveProfile(p);
}

const PROFILE_SETUP_KEY = 'property_manager_pro_setup_completed_v1';
let setupTempPhoto = '';

function isProfileSetupCompleted(){
  try {
    if(localStorage.getItem(PROFILE_SETUP_KEY) === 'true') return true;
    let raw = localStorage.getItem(PROFILE_KEY);
    if(raw){
      let p = JSON.parse(raw);
      if(p && typeof p === 'object'){
        if(p.setupCompleted === true) return true;
        if(p.name && typeof p.name === 'string' && p.name.trim().length > 0){
          return true;
        }
      }
    }
  } catch(e){}
  return false;
}

let currentProfile = loadProfile();
let profileTempPhoto = '';

function updateProfileAvatars(){
  let p = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile : (typeof loadProfile === 'function' ? loadProfile() : null);
  if(!p) return;
  let hasPhoto = p.photo && typeof p.photo === 'string' && p.photo.trim().length > 0;
  let safePhoto = hasPhoto ? String(p.photo).replace(/["<>]/g, '') : '';
  let safeName = String(p.name || 'Profile').replace(/["<>]/g, '');
  let avatarImgHtml = hasPhoto
    ? `<img src="${safePhoto}" alt="${safeName}" onerror="this.onerror=null;this.parentElement.innerHTML='👤'">`
    : '👤';

  let dashAvatar = document.getElementById('dashProfileAvatar');
  if(dashAvatar){
    dashAvatar.innerHTML = avatarImgHtml;
  }

  let topAvatar = document.getElementById('topProfileAvatar');
  if(topAvatar){
    topAvatar.innerHTML = avatarImgHtml;
  }

  let mainAvatar = document.getElementById('profileAvatar');
  if(mainAvatar){
    mainAvatar.innerHTML = avatarImgHtml;
  }
}

// ==================== MOBILE NAVIGATION & SCROLL STATE ====================
let lastScrollY = typeof window !== 'undefined' ? (window.pageYOffset || document.documentElement.scrollTop || 0) : 0;
let scrollTicking = false;
let isProgrammaticScroll = false;
let masterView = 'card';

function openDB(){
  return new Promise((resolve) => {
    if(!window.indexedDB){
      console.warn('IndexedDB not supported, using localStorage fallback.');
      return resolve(null);
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const dbInstance = e.target.result;
      if(!dbInstance.objectStoreNames.contains('properties')){
        dbInstance.createObjectStore('properties', { keyPath: 'id' });
      }
      if(!dbInstance.objectStoreNames.contains('upcoming_projects')){
        dbInstance.createObjectStore('upcoming_projects', { keyPath: 'id' });
      }
      if(!dbInstance.objectStoreNames.contains('direct_properties')){
        dbInstance.createObjectStore('direct_properties', { keyPath: 'id' });
      }
      if(!dbInstance.objectStoreNames.contains('profile')){
        dbInstance.createObjectStore('profile', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => {
      console.warn('IndexedDB open error:', e);
      resolve(null);
    };
  });
}

function dbSaveProfile(p){
  return new Promise((resolve) => {
    if(!db || !db.objectStoreNames || !db.objectStoreNames.contains('profile')) return resolve(false);
    try {
      const tx = db.transaction('profile', 'readwrite');
      const store = tx.objectStore('profile');
      store.put({ id: 'current', ...p });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch(err){
      resolve(false);
    }
  });
}

function dbGetProfile(){
  return new Promise((resolve) => {
    if(!db || !db.objectStoreNames || !db.objectStoreNames.contains('profile')) return resolve(null);
    try {
      const tx = db.transaction('profile', 'readonly');
      const store = tx.objectStore('profile');
      const req = store.get('current');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch(err){
      resolve(null);
    }
  });
}

function dbGetAll(storeName){
  return new Promise((resolve) => {
    if(!db) return resolve(null);
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch(err) {
      resolve(null);
    }
  });
}

function dbSaveAll(storeName, items){
  return new Promise((resolve) => {
    if(!db) return resolve(false);
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      for(const item of items){
        store.put(item);
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch(err) {
      resolve(false);
    }
  });
}

async function initStorage(){
  try {
    db = await openDB();
    if(db){
      let hasMigrated = false;
      try { hasMigrated = localStorage.getItem(DEMO_VERSION_KEY) === '2'; } catch(e){}

      if(!hasMigrated){
        reconcileDemoData();
        await dbSaveAll('properties', data);
        await dbSaveAll('upcoming_projects', upcomingData);
        await dbSaveAll('direct_properties', directData);
      } else {
        // 1. Properties: Read from IndexedDB or migrate from LocalStorage or seed with demo properties
        let dbProps = await dbGetAll('properties');
        if(Array.isArray(dbProps) && dbProps.length > 0){
          data = dbProps;
        } else {
          let localProps = null;
          try { localProps = JSON.parse(localStorage.getItem(KEY)); } catch(e){}
          if(Array.isArray(localProps) && localProps.length > 0){
            data = localProps;
          } else {
            data = initial.map((p, i) => ({
              ...p,
              id: 'p' + (i + 1),
              priceCategory: getPropertyCategory(p.price),
              budgetSlab: getPropertyBudgetSlab(p.price)
            }));
          }
          await dbSaveAll('properties', data);
        }

        // 2. Upcoming Projects: Read from IndexedDB or migrate from LocalStorage or seed with demo data
        let dbUpcoming = await dbGetAll('upcoming_projects');
        if(Array.isArray(dbUpcoming) && dbUpcoming.length > 0){
          upcomingData = dbUpcoming;
        } else {
          let localUp = null;
          try { localUp = JSON.parse(localStorage.getItem(UP_KEY)); } catch(e){}
          if(Array.isArray(localUp) && localUp.length > 0){
            upcomingData = localUp;
          } else {
            upcomingData = initialUpcoming.map((p, i) => ({
              ...p,
              id: p.id || ('up' + (i + 1)),
              priceCategory: getPriceCategory(p.price),
              budgetSlab: getBudgetSlab(p.price),
              favorite: p.favorite || false
            }));
          }
          await dbSaveAll('upcoming_projects', upcomingData);
        }

        // 3. Direct Properties: Read from IndexedDB or migrate from LocalStorage or seed with initialDirect
        let dbDirect = await dbGetAll('direct_properties');
        if(Array.isArray(dbDirect) && dbDirect.length > 0){
          directData = dbDirect;
        } else {
          let localDirect = null;
          try { localDirect = JSON.parse(localStorage.getItem(DIRECT_KEY)); } catch(e){}
          if(Array.isArray(localDirect) && localDirect.length > 0){
            directData = localDirect;
          } else {
            directData = initialDirect.map(p => ({
              ...p,
              priceCategory: getPropertyCategory(p.price),
              budgetSlab: getPropertyBudgetSlab(p.price),
              isDirect: true,
              source: 'direct'
            }));
          }
          await dbSaveAll('direct_properties', directData);
        }
      }

      // 4. Profile: Read from IndexedDB or migrate from LocalStorage
      let dbProf = await dbGetProfile();
      if(dbProf && dbProf.name){
        currentProfile = { ...defaultProfile, ...dbProf };
        updateProfileAvatars();
        if(currentPage === 'profile') renderProfile();
      } else if(currentProfile){
        await dbSaveProfile(currentProfile);
      }
    }
  } catch(e) {
    console.error('Storage initialization failed:', e);
  }
  cleanupExpiredDeletedItems();
  renderAll();
}

function save(){
  if(db) dbSaveAll('properties', data);
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e){}
}

function saveUpcoming(){
  if(db) dbSaveAll('upcoming_projects', upcomingData);
  try { localStorage.setItem(UP_KEY, JSON.stringify(upcomingData)); } catch(e){}
}

function saveDirect(){
  if(db) dbSaveAll('direct_properties', directData);
  try { localStorage.setItem(DIRECT_KEY, JSON.stringify(directData)); } catch(e){}
}

// ==========================================================================
// HISTORY SYSTEM (Import History & Recently Deleted with 5-Day Retention)
// ==========================================================================

function getHistoryData(){
  try {
    let raw = localStorage.getItem(HISTORY_KEY);
    if(raw){
      let parsed = JSON.parse(raw);
      if(parsed && typeof parsed === 'object'){
        if(!Array.isArray(parsed.importHistory)) parsed.importHistory = [];
        if(!Array.isArray(parsed.recentlyDeleted)) parsed.recentlyDeleted = [];
        return parsed;
      }
    }
  } catch(e){}
  return {
    importHistory: [],
    recentlyDeleted: []
  };
}

function saveHistoryData(hist){
  try {
    if(!hist || typeof hist !== 'object') return;
    if(!Array.isArray(hist.importHistory)) hist.importHistory = [];
    if(!Array.isArray(hist.recentlyDeleted)) hist.recentlyDeleted = [];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  } catch(e){
    console.error('Failed to save history data:', e);
  }
}

function formatHistoryDate(timestamp){
  let d = new Date(timestamp);
  if(!d || Number.isNaN(d.getTime())) return '';
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let day = String(d.getDate()).padStart(2, '0');
  let month = months[d.getMonth()];
  let year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatHistoryTime(timestamp){
  let d = new Date(timestamp);
  if(!d || Number.isNaN(d.getTime())) return '';
  let hours = d.getHours();
  let minutes = String(d.getMinutes()).padStart(2, '0');
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  let strHours = String(hours).padStart(2, '0');
  return `${strHours}:${minutes} ${ampm}`;
}

function getRemainingRetention(expiresAt, now = Date.now()){
  let diff = expiresAt - now;
  if(diff <= 0) return { text: 'Expired', isExpired: true, level: 'expired' };
  let totalHours = Math.floor(diff / (1000 * 60 * 60));
  let days = Math.floor(totalHours / 24);
  let remHours = totalHours % 24;
  let level = 'normal';
  if(totalHours <= 12) level = 'urgent';
  else if(totalHours <= 48) level = 'warn';

  if(days >= 1){
    return {
      text: `Auto delete in ${days} day${days > 1 ? 's' : ''}${remHours > 0 ? ` ${remHours}h` : ''}`,
      isExpired: false,
      level: level
    };
  } else if(totalHours >= 1){
    let mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      text: `Auto delete in ${totalHours} hour${totalHours > 1 ? 's' : ''}${mins > 0 ? ` ${mins}m` : ''}`,
      isExpired: false,
      level: level
    };
  } else {
    let mins = Math.max(1, Math.floor(diff / (1000 * 60)));
    return {
      text: `Auto delete in ${mins} minute${mins > 1 ? 's' : ''}`,
      isExpired: false,
      level: 'urgent'
    };
  }
}

function cleanupExpiredDeletedItems(){
  let hist = getHistoryData();
  let now = Date.now();
  let before = hist.recentlyDeleted.length;
  hist.recentlyDeleted = hist.recentlyDeleted.filter(item => {
    let exp = item.expiresAt || (item.deletedAt + RETENTION_MS);
    return exp > now;
  });
  if(hist.recentlyDeleted.length !== before){
    saveHistoryData(hist);
  }
}

function moveToRecentlyDeleted(type, originalRecord){
  let hist = getHistoryData();
  let now = Date.now();
  let expiresAt = now + RETENTION_MS;
  let deletedItem = {
    id: 'del_' + now + '_' + Math.random().toString(36).substr(2, 6),
    type: type, // 'property', 'direct', or 'upcoming'
    record: JSON.parse(JSON.stringify(originalRecord)),
    deletedAt: now,
    deletedDate: formatHistoryDate(now),
    deletedTime: formatHistoryTime(now),
    expiresAt: expiresAt,
    autoDeleteDate: formatHistoryDate(expiresAt),
    autoDeleteTime: formatHistoryTime(expiresAt)
  };
  // Ensure no duplicates
  hist.recentlyDeleted = hist.recentlyDeleted.filter(x => x.record && x.record.id !== originalRecord.id);
  hist.recentlyDeleted.unshift(deletedItem);
  saveHistoryData(hist);
}

function restoreDeletedItem(deletedId){
  let hist = getHistoryData();
  let idx = hist.recentlyDeleted.findIndex(x => x.id === deletedId);
  if(idx === -1){
    toast('Record not found or already removed');
    return;
  }
  let item = hist.recentlyDeleted[idx];
  let rec = item.record;
  if(!rec){
    hist.recentlyDeleted.splice(idx, 1);
    saveHistoryData(hist);
    return;
  }

  if(item.type === 'property'){
    if(!data.some(x => x.id === rec.id)){
      data.unshift(rec);
    }
    save();
  } else if(item.type === 'direct'){
    if(typeof directData !== 'undefined' && !directData.some(x => x.id === rec.id)){
      directData.unshift(rec);
    }
    saveDirect();
  } else if(item.type === 'upcoming'){
    if(!upcomingData.some(x => x.id === rec.id)){
      upcomingData.unshift(rec);
    }
    saveUpcoming();
  }

  hist.recentlyDeleted.splice(idx, 1);
  saveHistoryData(hist);
  renderAll();
  renderRecentlyDeleted();
  toast(`"${rec.name || 'Item'}" restored successfully`);
}

let pendingPermanentDeleteId = null;

function openPermanentDeleteModal(deletedId){
  let hist = getHistoryData();
  let item = hist.recentlyDeleted.find(x => x.id === deletedId);
  if(!item) return;
  pendingPermanentDeleteId = deletedId;
  let targetNameEl = document.getElementById('permanentDeleteTargetName');
  if(targetNameEl){
    let typeLabel = item.type === 'property' ? 'Property' : (item.type === 'direct' ? 'Direct Property' : 'Upcoming Project');
    targetNameEl.textContent = `"${item.record?.name || 'Selected Item'}" (${typeLabel})`;
  }
  let modal = document.getElementById('permanentDeleteModal');
  if(modal) modal.classList.add('show');
}

function confirmPermanentDelete(){
  if(!pendingPermanentDeleteId){
    closeModal('permanentDeleteModal');
    return;
  }
  let hist = getHistoryData();
  let item = hist.recentlyDeleted.find(x => x.id === pendingPermanentDeleteId);
  let itemName = item?.record?.name || 'Record';
  hist.recentlyDeleted = hist.recentlyDeleted.filter(x => x.id !== pendingPermanentDeleteId);
  saveHistoryData(hist);
  pendingPermanentDeleteId = null;
  closeModal('permanentDeleteModal');
  renderRecentlyDeleted();
  toast(`"${itemName}" permanently deleted`);
}

function addImportHistoryRecord({ fileName, propertiesCount = 0, directPropertiesCount = 0, upcomingCount = 0, sourceType = 'JSON Backup', status = 'Successful' }){
  let hist = getHistoryData();
  let now = Date.now();
  let total = propertiesCount + directPropertiesCount + upcomingCount;
  let rec = {
    id: 'imp_' + now + '_' + Math.random().toString(36).substr(2, 6),
    fileName: fileName || 'backup_file.json',
    date: formatHistoryDate(now),
    time: formatHistoryTime(now),
    timestamp: now,
    totalCount: total,
    propertiesCount: propertiesCount,
    directPropertiesCount: directPropertiesCount,
    upcomingCount: upcomingCount,
    status: status,
    sourceType: sourceType
  };
  hist.importHistory.unshift(rec);
  saveHistoryData(hist);
  if(currentPage === 'history' && activeHistoryTab === 'import'){
    renderImportHistory();
  }
}

let activeHistoryTab = 'import'; // 'import' or 'deleted'

function setHistoryTab(tab){
  activeHistoryTab = tab;
  let importBtn = document.getElementById('histTabImportBtn');
  let deletedBtn = document.getElementById('histTabDeletedBtn');
  let importCont = document.getElementById('importHistoryContainer');
  let deletedCont = document.getElementById('recentlyDeletedContainer');
  let searchInput = document.getElementById('historySearchInput');

  if(importBtn) importBtn.classList.toggle('active', tab === 'import');
  if(deletedBtn) deletedBtn.classList.toggle('active', tab === 'deleted');

  if(importCont) importCont.style.display = tab === 'import' ? '' : 'none';
  if(deletedCont) deletedCont.style.display = tab === 'deleted' ? '' : 'none';

  if(searchInput){
    searchInput.placeholder = tab === 'import' ? 'Search file name, date, status...' : 'Search name, location, type...';
    searchInput.value = '';
  }
  let clearBtn = document.getElementById('clearHistorySearchBtn');
  if(clearBtn) clearBtn.style.display = 'none';

  renderCurrentHistoryTab();
}

function clearHistorySearch(){
  let searchInput = document.getElementById('historySearchInput');
  if(searchInput) searchInput.value = '';
  let clearBtn = document.getElementById('clearHistorySearchBtn');
  if(clearBtn) clearBtn.style.display = 'none';
  renderCurrentHistoryTab();
}

function renderCurrentHistoryTab(){
  let searchInput = document.getElementById('historySearchInput');
  let query = (searchInput?.value || '').trim();
  let clearBtn = document.getElementById('clearHistorySearchBtn');
  if(clearBtn) clearBtn.style.display = query ? '' : 'none';

  if(activeHistoryTab === 'import'){
    renderImportHistory(query);
  } else {
    renderRecentlyDeleted(query);
  }
}

function renderHistoryPage(){
  cleanupExpiredDeletedItems();
  renderCurrentHistoryTab();
}

function renderImportHistory(query = ''){
  let hist = getHistoryData();
  let list = hist.importHistory || [];
  let countElem = document.getElementById('historyTabCount');
  let container = document.getElementById('importHistoryContainer');
  if(!container) return;

  if(query){
    let q = query.toLowerCase();
    list = list.filter(item => {
      let f = (item.fileName || '').toLowerCase();
      let d = (item.date || '').toLowerCase();
      let t = (item.time || '').toLowerCase();
      let s = (item.status || '').toLowerCase();
      let st = (item.sourceType || '').toLowerCase();
      return f.includes(q) || d.includes(q) || t.includes(q) || s.includes(q) || st.includes(q);
    });
  }

  if(countElem){
    countElem.textContent = `${list.length} ${list.length === 1 ? 'import record' : 'import records'}`;
  }

  if(!list.length){
    container.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon">📥</div>
        <div class="history-empty-title">${query ? 'No matching import records' : 'No Import History yet'}</div>
        <div class="history-empty-desc">
          ${query ? 'Try searching with different keywords such as file name or date.' : 'When you import JSON or Excel backups, a complete log of your imported files and record counts will automatically appear here.'}
        </div>
      </div>
    `;
    return;
  }

  let rowsHtml = list.map(item => {
    return `
      <tr>
        <td>
          <div class="property-name" style="font-size:13.5px">📄 ${esc(item.fileName)}</div>
          <div class="muted" style="font-size:11px;margin-top:2px">ID: ${esc(item.id)}</div>
        </td>
        <td>
          <div style="font-weight:600">${esc(item.date)}</div>
          <div class="muted" style="font-size:11px">${esc(item.time)}</div>
        </td>
        <td>
          <div style="font-weight:700;color:var(--text);margin-bottom:2px">Total: ${item.totalCount} records</div>
          <div class="muted" style="font-size:11.5px">
            ${item.propertiesCount} Properties • ${item.directPropertiesCount} Direct • ${item.upcomingCount} Upcoming
          </div>
        </td>
        <td>
          <span class="badge slab">${esc(item.sourceType || 'Backup')}</span>
        </td>
        <td>
          <span class="badge-status-success">✓ ${esc(item.status || 'Successful')}</span>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Date & Time</th>
            <th>Imported Breakdown</th>
            <th>Source</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

function renderRecentlyDeleted(query = ''){
  cleanupExpiredDeletedItems();
  let hist = getHistoryData();
  let list = hist.recentlyDeleted || [];
  let countElem = document.getElementById('historyTabCount');
  let container = document.getElementById('recentlyDeletedContainer');
  if(!container) return;

  if(query){
    let q = query.toLowerCase();
    list = list.filter(item => {
      let r = item.record || {};
      let name = (r.name || '').toLowerCase();
      let loc = (r.location || '').toLowerCase();
      let type = (r.type || '').toLowerCase();
      let sec = (item.type || '').toLowerCase();
      return name.includes(q) || loc.includes(q) || type.includes(q) || sec.includes(q);
    });
  }

  if(countElem){
    countElem.textContent = `${list.length} ${list.length === 1 ? 'deleted record' : 'deleted records'}`;
  }

  if(!list.length){
    container.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon">🗑️</div>
        <div class="history-empty-title">${query ? 'No matching deleted records' : 'No Recently Deleted Items'}</div>
        <div class="history-empty-desc">
          ${query ? 'No deleted items matched your search query.' : 'When you delete a Property, Direct Property, or Upcoming Project, it is safely stored here for 5 days. You can restore it anytime or delete it permanently.'}
        </div>
      </div>
    `;
    return;
  }

  let now = Date.now();
  let rowsHtml = list.map(item => {
    let rec = item.record || {};
    let exp = item.expiresAt || (item.deletedAt + RETENTION_MS);
    let retention = getRemainingRetention(exp, now);
    let typeBadge = item.type === 'direct'
      ? '<span class="badge badge-source-direct">Direct Property</span>'
      : (item.type === 'upcoming'
        ? '<span class="badge badge-source-up">Upcoming Project</span>'
        : '<span class="badge badge-source-prop">Property</span>');

    let countdownClass = retention.level === 'urgent'
      ? 'badge-countdown-urgent'
      : (retention.level === 'warn' ? 'badge-countdown-warn' : '');

    let priceStr = rec.price ? money(rec.price) : (rec.startingPrice ? money(rec.startingPrice) : '');
    let details = [];
    if(rec.location) details.push(`📍 ${esc(rec.location)}`);
    if(rec.type) details.push(esc(rec.bhk ? rec.bhk + ' ' + rec.type : rec.type));
    if(priceStr) details.push(priceStr);
    if(rec.owner) details.push(`👤 ${esc(rec.owner)}`);

    return `
      <tr>
        <td>
          <div class="property-name" style="font-size:14px">${esc(rec.name || 'Unnamed')}</div>
          <div class="muted" style="font-size:12px;margin-top:2px">${details.join(' • ')}</div>
        </td>
        <td>${typeBadge}</td>
        <td>
          <div style="font-weight:600">${esc(item.deletedDate || '')}</div>
          <div class="muted" style="font-size:11px">${esc(item.deletedTime || '')}</div>
        </td>
        <td>
          <span class="badge-countdown ${countdownClass}">⏳ ${retention.text}</span>
          <div class="muted" style="font-size:11px;margin-top:2px">Expires: ${esc(item.autoDeleteDate || '')}, ${esc(item.autoDeleteTime || '')}</div>
        </td>
        <td style="text-align:right">
          <div class="history-actions" style="justify-content:flex-end">
            <button type="button" class="btn-restore" onclick="restoreDeletedItem('${item.id}')" title="Restore back to active inventory">↩ Restore</button>
            <button type="button" class="btn-perm-delete" onclick="openPermanentDeleteModal('${item.id}')" title="Permanently delete now">🗑️ Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Item Name & Details</th>
            <th>Original Type</th>
            <th>Deleted On</th>
            <th>Auto Delete In</th>
            <th style="text-align:right">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

function updateProjectCategoryPreview(){
  let price = Number(document.getElementById('pPrice').value)||0;
  let cat = getPriceCategory(price);
  let slab = getBudgetSlab(price);
  let catEl = document.getElementById('pCatPreview');
  let slabEl = document.getElementById('pSlabPreview');
  if(catEl){
    catEl.textContent = cat;
    catEl.className = 'badge cat-' + cat.toLowerCase().replace(/\s+/g,'-');
  }
  if(slabEl){
    slabEl.textContent = slab;
  }
}

function updatePropertyCategoryPreview(){
  let price = Number(document.getElementById('fPrice').value)||0;
  let cat = getPropertyCategory(price);
  let slab = getPropertyBudgetSlab(price);
  let catEl = document.getElementById('fCatPreview');
  let slabEl = document.getElementById('fSlabPreview');
  if(catEl){
    catEl.textContent = cat;
    catEl.className = 'badge cat-' + cat.toLowerCase().replace(/[^\w-]/g,'-').replace(/-+/g,'-');
  }
  if(slabEl){
    slabEl.textContent = slab;
  }
}

// IMAGE HANDLING (Compression & Optimization for LocalStorage & IndexedDB)
function isValidImageFile(file){
  if(!file) return false;
  if(file.type){
    if(/image\/(jpeg|jpg|pjpeg|png|webp)/i.test(file.type)) return true;
    if(file.type.toLowerCase().startsWith('image/')) return true;
  }
  if(file.name && /\.(jpe?g|png|webp)$/i.test(file.name)){
    return true;
  }
  return false;
}

function compressImage(file, maxWidth = 1000, maxHeight = 800, quality = 0.75){
  return new Promise((resolve, reject) => {
    if(!isValidImageFile(file)){
      return reject(new Error('Please upload a valid image (JPG, JPEG, PNG, or WEBP).'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      if(!result){
        return reject(new Error('Failed to read image data.'));
      }
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if(!w || !h){
          return reject(new Error('Unable to determine image dimensions.'));
        }
        if(w > maxWidth || h > maxHeight){
          if(w / h > maxWidth / maxHeight){
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          } else {
            w = Math.round((w * maxHeight) / h);
            h = maxHeight;
          }
        }
        try {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch(canvasErr){
          resolve(result);
        }
      };
      img.onerror = () => reject(new Error('Unable to decode image file.'));
      img.src = result;
    };
    reader.onerror = () => reject(new Error('Error reading image file.'));
    reader.readAsDataURL(file);
  });
}

async function handleImageUpload(input, moduleType){
  const file = input.files && input.files[0];
  if(!file) return;
  try {
    const dataUrl = await compressImage(file);
    if(moduleType === 'property'){
      document.getElementById('fPhoto').value = dataUrl;
      const wrap = document.getElementById('fPhotoPreviewWrap');
      const img = document.getElementById('fPhotoPreview');
      img.src = dataUrl;
      wrap.style.display = 'flex';
    } else {
      document.getElementById('pPhoto').value = dataUrl;
      const wrap = document.getElementById('pPhotoPreviewWrap');
      const img = document.getElementById('pPhotoPreview');
      img.src = dataUrl;
      wrap.style.display = 'flex';
    }
    toast('Image uploaded and optimized');
  } catch(err) {
    toast(err.message || 'Image processing failed');
  }
  input.value = '';
}

function removeUploadedImage(moduleType){
  if(moduleType === 'property'){
    document.getElementById('fPhoto').value = '';
    const wrap = document.getElementById('fPhotoPreviewWrap');
    wrap.style.display = 'none';
    document.getElementById('fPhotoPreview').src = '';
  } else {
    document.getElementById('pPhoto').value = '';
    const wrap = document.getElementById('pPhotoPreviewWrap');
    wrap.style.display = 'none';
    document.getElementById('pPhotoPreview').src = '';
  }
  toast('Image removed');
}

function onPhotoUrlChange(moduleType){
  if(moduleType === 'property'){
    let val = (document.getElementById('fPhoto').value||'').trim();
    let wrap = document.getElementById('fPhotoPreviewWrap');
    let img = document.getElementById('fPhotoPreview');
    if(val){
      img.src = val;
      wrap.style.display = 'flex';
    } else {
      wrap.style.display = 'none';
      img.src = '';
    }
  } else {
    let val = (document.getElementById('pPhoto').value||'').trim();
    let wrap = document.getElementById('pPhotoPreviewWrap');
    let img = document.getElementById('pPhotoPreview');
    if(val){
      img.src = val;
      wrap.style.display = 'flex';
    } else {
      wrap.style.display = 'none';
      img.src = '';
    }
  }
}

// LIGHTBOX (Image Viewer Modal)
function openLightbox(src, caption){
  if(!src) return;
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  img.src = src;
  cap.textContent = caption || '';
  modal.classList.add('show');
}

function closeLightbox(e){
  if(!e || e.target.id === 'lightboxModal' || e.target.classList.contains('lightbox-close')){
    document.getElementById('lightboxModal').classList.remove('show');
  }
}

function showNotice(icon, title, subtext, actionBtn){
  document.getElementById('noticeIcon').textContent = icon;
  document.getElementById('noticeTitle').textContent = title;
  document.getElementById('noticeSubtext').textContent = subtext;
  let actionsEl = document.getElementById('noticeActions');
  if(actionBtn){
    actionsEl.innerHTML = `
      <button class="btn" onclick="closeModal('actionNoticeModal')">Close</button>
      <button class="btn primary" id="noticeCustomBtn">${esc(actionBtn.label)}</button>
    `;
    document.getElementById('noticeCustomBtn').onclick = actionBtn.onClick;
  } else {
    actionsEl.innerHTML = `<button class="btn primary" style="min-width:90px" onclick="closeModal('actionNoticeModal')">OK</button>`;
  }
  document.getElementById('actionNoticeModal').classList.add('show');
}

function handleDetailCall(type, id){
  let p = type === 'property' ? (data.find(x => x.id === id) || (typeof directData !== 'undefined' ? directData.find(x => x.id === id) : null)) : upcomingData.find(x => x.id === id);
  if(!p) return;
  let phone = (p.phone || '').trim();
  if(phone){
    window.location.href = 'tel:' + phone;
  } else {
    let mod = type === 'upcoming' ? 'Project' : 'Property';
    showNotice('📞', 'Phone Number Available नहीं है', `इस ${mod} में कोई Phone Number दर्ज नहीं किया गया है।`);
  }
}

function handleDetailWhatsApp(type, id){
  let p = type === 'property' ? (data.find(x => x.id === id) || (typeof directData !== 'undefined' ? directData.find(x => x.id === id) : null)) : upcomingData.find(x => x.id === id);
  if(!p) return;
  let phone = (p.phone || '').trim();
  if(phone){
    let clean = phone.replace(/\D/g, '');
    window.open('https://wa.me/91' + clean, '_blank');
  } else {
    let mod = type === 'upcoming' ? 'Project' : 'Property';
    showNotice('💬', 'WhatsApp Number Available नहीं है', `इस ${mod} में कोई WhatsApp Phone Number दर्ज नहीं किया गया है।`);
  }
}

function handleDetailMaps(type, id){
  let p = type === 'property' ? (data.find(x => x.id === id) || (typeof directData !== 'undefined' ? directData.find(x => x.id === id) : null)) : upcomingData.find(x => x.id === id);
  if(!p) return;
  let map = (p.map || '').trim();
  if(map){
    window.open(map, '_blank');
  } else {
    let mod = type === 'upcoming' ? 'Project' : 'Property';
    showNotice('📍', 'Google Maps Location Available नहीं है', `इस ${mod} के लिए कोई Google Maps URL दर्ज नहीं किया गया है।`);
  }
}

function handleDetailImage(type, id){
  let p = type === 'property' ? (data.find(x => x.id === id) || (typeof directData !== 'undefined' ? directData.find(x => x.id === id) : null)) : upcomingData.find(x => x.id === id);
  if(!p) return;
  let photo = (p.photo || '').trim();
  if(photo){
    openLightbox(photo, p.name);
  } else {
    let mod = type === 'upcoming' ? 'Project' : (p.isDirect ? 'Direct Property' : 'Property');
    showNotice(
      '📷',
      'Image Available नहीं है',
      `इस ${mod} की Image अभी Add नहीं की गई है।`,
      {
        label: '＋ Add Image',
        onClick: () => {
          closeModal('actionNoticeModal');
          if(type === 'upcoming'){
            closeModal('projectDetailModal');
            openProjectForm(id, true);
          } else if(p.isDirect || (p.id && p.id.startsWith('dp_'))){
            closeModal('detailModal');
            openDirectPropertyForm(id, true);
          } else {
            closeModal('detailModal');
            openForm(id, true);
          }
        }
      }
    );
  }
}

function showNoImageModal(type, id){
  handleDetailImage(type, id);
}

function toggleDetailFav(type, id){
  if(type === 'property'){
    let p = data.find(x => x.id === id);
    let isDirect = false;
    if(!p && typeof directData !== 'undefined'){
      p = directData.find(x => x.id === id);
      isDirect = true;
    }
    if(!p) return;
    p.favorite = !p.favorite;
    if(isDirect) saveDirect(); else save();
    renderAll();
    let btn = document.getElementById('dPropFavBtn');
    if(btn){
      btn.innerHTML = p.favorite ? '★ Shortlisted' : '⭐ Favorite';
      btn.style.background = p.favorite ? '#eff6ff' : '';
      btn.style.color = p.favorite ? '#1d4ed8' : '';
      btn.style.borderColor = p.favorite ? '#93c5fd' : '';
      btn.style.fontWeight = p.favorite ? '700' : '';
    }
    toast(p.favorite ? (isDirect ? 'Direct Property added to favorites' : 'Property added to favorites') : (isDirect ? 'Direct Property removed from favorites' : 'Property removed from favorites'));
  } else {
    let p = upcomingData.find(x => x.id === id);
    if(!p) return;
    p.favorite = !p.favorite;
    saveUpcoming();
    renderAll();
    let btn = document.getElementById('dProjectFavBtn');
    if(btn){
      btn.innerHTML = p.favorite ? '★ Shortlisted' : '⭐ Favorite';
      btn.style.background = p.favorite ? '#eff6ff' : '';
      btn.style.color = p.favorite ? '#1d4ed8' : '';
      btn.style.borderColor = p.favorite ? '#93c5fd' : '';
      btn.style.fontWeight = p.favorite ? '700' : '';
    }
    toast(p.favorite ? 'Project added to favorites' : 'Project removed from favorites');
  }
}

// HELPERS
function money(n){n=Number(n)||0;if(n>=10000000)return '₹'+(n/10000000).toFixed(n%10000000?1:0)+' Cr';if(n>=100000)return '₹'+(n/100000).toFixed(n%100000?1:0)+' L';return n?'₹'+n.toLocaleString('en-IN'):'—'}
function moneyRange(start,max){
  let s = money(start);
  if(max && Number(max)>Number(start)) return s + ' – ' + money(max);
  return s;
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
let toastTimer;
function toast(t, actionHtml, duration = 2400){
  let e = document.getElementById('toast');
  if(!e) return;
  if(actionHtml){
    e.innerHTML = `<span>${t}</span>${actionHtml}`;
  } else {
    e.textContent = t;
  }
  e.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => e.classList.remove('show'), duration);
}
function toggleFilterCollapse(groupId, btnId){
  const grp = document.getElementById(groupId);
  const btn = document.getElementById(btnId);
  if(!grp) return;
  const isOpen = grp.classList.toggle('open');
  if(btn){
    btn.classList.toggle('active', isOpen);
    btn.innerHTML = isOpen ? '⚡ Filter ▲' : '⚡ Filter ▼';
  }
}

function toggleSidebar(force){
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebarBackdrop');
  if(!sb) return;
  const isOpen = typeof force === 'boolean' ? force : !sb.classList.contains('open');
  sb.classList.toggle('open', isOpen);
  if(bd) bd.classList.toggle('show', isOpen);
}

// NAVIGATION & PAGE ROUTING
let currentPage = 'dashboard';
function showPage(page){
  currentPage = page;
  if(window.innerWidth <= 992 || window.innerHeight <= 550){
    toggleSidebar(false);
  }
  const mbNav = document.getElementById('mobileBottomNav');
  if(mbNav) mbNav.classList.remove('nav-hidden');
  document.querySelectorAll('[id$="Page"]').forEach(x=>x.style.display='none');
  let target = document.getElementById(page+'Page');
  if(target) target.style.display='';
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  
  // Hide duplicate top header on mobile when viewing Upcoming Projects
  const topHeader = document.querySelector('.top');
  if(topHeader){
    topHeader.classList.toggle('hide-on-upcoming', page === 'upcoming');
  }
  document.body.classList.toggle('page-upcoming', page === 'upcoming');
  
  let titles={
    dashboard:['Property Manager','Manage your properties, projects & follow-ups'],
    properties:['Properties','Search, filter, update and manage every property.'],
    directProperty:['Direct Property','Properties personally sourced directly from clients and owners.'],
    upcoming:['Upcoming Projects','Explore and manage future project launches, luxury & economical pipelines.'],
    favorites:['Favorites','Your combined shortlisted properties and upcoming projects.'],
    followups:['Follow-ups','Keep track of upcoming calls and visits.'],
    search:['Master Search','Search across all properties, upcoming projects, locations & contacts.'],
    profile:['Profile','Manage your personal details and view your real-time activity summary.'],
    settings:['Settings','Categories & Filters configuration and management.'],
    history:['History','Review system import logs and recover recently deleted items within 5 days.'],
    about:['About & How to Use','Complete user guide, workflows, and practical tips for Property Manager Pro.']
  };
  if(titles[page]){
    document.getElementById('pageTitle').textContent=titles[page][0];
    document.getElementById('pageSub').textContent=titles[page][1];
  }
  
  let topBtn = document.getElementById('topAddBtn');
  if(topBtn){
    if(page === 'upcoming'){
      topBtn.textContent = '＋ Add Project';
      topBtn.style.display = '';
    } else if(page === 'directProperty'){
      topBtn.textContent = '＋ Add Direct Property';
      topBtn.style.display = '';
    } else if(page === 'profile' || page === 'search' || page === 'settings' || page === 'about' || page === 'history'){
      topBtn.style.display = 'none';
    } else {
      topBtn.textContent = '＋ Add Property';
      topBtn.style.display = '';
    }
  }

  if(typeof window !== 'undefined' && (window.innerWidth <= 992 || window.innerHeight <= 550)) document.getElementById('sidebar')?.classList.remove('open');
  if(page==='properties')renderProperties();
  if(page==='directProperty')renderDirectProperties();
  if(page==='upcoming')renderUpcoming();
  if(page==='favorites')renderFavorites();
  if(page==='followups')renderFollowups();
  if(page==='search')renderMasterSearch();
  if(page==='profile'){
    renderProfile();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  if(page==='settings'){
    renderSettingsPage();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    setTimeout(() => centerActiveSettingsTab(false), 60);
  }
  if(page==='history'){
    renderHistoryPage();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  if(page==='about'){
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Update mobile bottom nav active status
  document.querySelectorAll('.mb-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mbPage === page);
  });
  if(page==='dashboard')renderDashboard();
}
document.querySelectorAll('.nav button[data-page]').forEach(b=>b.onclick=()=>showPage(b.dataset.page));

function handleTopAdd(){
  if(currentPage==='upcoming'){
    openProjectForm();
  } else if(currentPage==='directProperty'){
    openDirectPropertyForm();
  } else if(currentPage==='profile'){
    openProfileModal();
  } else {
    openForm();
  }
}

// DASHBOARD RENDER
function renderDashboard(){
  updateProfileAvatars();
  let total = data.length;
  let av = data.filter(p => p.status === 'Available').length;
  let hold = data.filter(p => p.status === 'Hold').length;
  let propFav = data.filter(p => p.favorite).length;
  let upFav = upcomingData.filter(p => p.favorite).length;
  let totalFav = propFav + upFav;
  let uTot = upcomingData.length;
  let followCount = data.filter(p => p.follow).length;

  // Empty state vs Content display
  let emptyEl = document.getElementById('dashEmptyState');
  let contentEl = document.getElementById('dashContent');
  if(!total && !uTot){
    if(emptyEl) emptyEl.style.display = 'block';
    if(contentEl) contentEl.style.display = 'none';
    return;
  } else {
    if(emptyEl) emptyEl.style.display = 'none';
    if(contentEl) contentEl.style.display = 'block';
  }

  // Update Overview Statistics
  let elSTotal = document.getElementById('sTotal');
  if(elSTotal) elSTotal.textContent = total;
  let elSAvail = document.getElementById('sAvailable');
  if(elSAvail) elSAvail.textContent = av;
  let elSHold = document.getElementById('sHold');
  if(elSHold) elSHold.textContent = hold;
  let elSFav = document.getElementById('sFav');
  if(elSFav) elSFav.textContent = totalFav;
  let elSFavB = document.getElementById('sFavBreakdown');
  if(elSFavB) elSFavB.textContent = `${propFav} props • ${upFav} projects`;
  let elSFollow = document.getElementById('sFollow');
  if(elSFollow) elSFollow.textContent = followCount;

  let elUTotal = document.getElementById('uTotal');
  if(elUTotal) elUTotal.textContent = uTot;
  let elUTotal2 = document.getElementById('uTotal2');
  if(elUTotal2) elUTotal2.textContent = uTot;

  // Needs Your Attention
  let attentionEl = document.getElementById('dashAttentionContainer');
  if(attentionEl){
    let attentionItems = [];

    // Follow-ups due
    data.filter(p => p.follow).forEach(p => {
      attentionItems.push({
        id: p.id,
        type: 'followup',
        title: p.name,
        badge: '📅 Follow-up Due: ' + p.follow,
        badgeClass: 'badge-attention-follow',
        location: p.location,
        owner: p.owner || 'Client',
        phone: p.phone || '',
        status: p.status
      });
    });

    // On Hold properties
    data.filter(p => p.status === 'Hold').forEach(p => {
      if(!attentionItems.some(x => x.id === p.id)){
        attentionItems.push({
          id: p.id,
          type: 'hold',
          title: p.name,
          badge: '⏳ Status: On Hold',
          badgeClass: 'badge-attention-hold',
          location: p.location,
          owner: p.owner || 'Client',
          phone: p.phone || '',
          status: p.status
        });
      }
    });

    if(!attentionItems.length){
      attentionEl.innerHTML = `<div class="empty" style="padding:20px 14px">
        <div style="font-size:26px;margin-bottom:6px">✅</div>
        <b style="font-size:14px">No follow-ups due</b>
        <div class="muted" style="font-size:12px;margin-top:4px">All properties are on track. Scheduled client calls and visits will appear here.</div>
      </div>`;
    } else {
      attentionEl.innerHTML = attentionItems.slice(0, 4).map(item => `
        <div class="dash-attention-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <span class="badge ${item.badgeClass}">${esc(item.badge)}</span>
            <button class="mini primary" onclick="view('${item.id}')">View</button>
          </div>
          <h4 style="margin:8px 0 3px;font-size:14.5px">${esc(item.title)}</h4>
          <div class="muted" style="font-size:12px">📍 ${esc(item.location)}</div>
          ${item.phone ? `<div style="margin-top:6px;font-size:12px"><a href="tel:${esc(item.phone)}" style="color:var(--primary);text-decoration:none;font-weight:600">📞 ${esc(item.owner ? item.owner + ' (' + item.phone + ')' : item.phone)}</a></div>` : ''}
        </div>
      `).join('');
    }
  }

  // Recent Properties
  let recentEl = document.getElementById('recentBody');
  if(recentEl){
    let recent = [...data].sort((a,b) => String(b.created).localeCompare(String(a.created))).slice(0, 7);
    recentEl.innerHTML = recent.map(p => {
      let typeDesc = `Property • ${esc(p.bhk ? p.bhk : p.type)}`;
      return `<tr>
        <td>
          <b>${esc(p.name)}</b>
          <div class="muted" style="font-size:11.5px;margin-top:2px">${typeDesc}</div>
        </td>
        <td>
          <div style="font-weight:600;font-size:13px">📍 ${esc(p.location)}</div>
        </td>
        <td><b>${money(p.price)}</b></td>
        <td><span class="badge ${(p.status || 'available').toLowerCase()}">${esc(p.status || 'Available')}</span></td>
        <td><button class="mini primary" onclick="view('${p.id}')">View</button></td>
      </tr>`;
    }).join('');
  }

  // Inventory by Location
  let summaryEl = document.getElementById('summaryList');
  if(summaryEl){
    let loc = {};
    data.forEach(p => {
      let l = p.location || 'Other';
      loc[l] = (loc[l] || 0) + 1;
    });
    let sortedLocs = Object.entries(loc).sort((a,b) => b[1] - a[1]);
    let maxCount = Math.max(...Object.values(loc), 1);
    summaryEl.innerHTML = sortedLocs.slice(0, 7).map(([area, count]) => {
      return `<div class="dash-loc-item">
        <div class="dash-loc-info">
          <span class="dash-loc-name">📍 ${esc(area)}</span>
          <b class="dash-loc-count">${count} ${count === 1 ? 'property' : 'properties'}</b>
        </div>
        <div class="dash-loc-bar-bg">
          <div class="dash-loc-bar-fill" style="width:${Math.round((count / maxCount) * 100)}%"></div>
        </div>
      </div>`;
    }).join('');
  }

  // Upcoming projects dashboard summary
  let uEco = upcomingData.filter(p => p.priceCategory === 'Economical').length;
  let uMid = upcomingData.filter(p => p.priceCategory === 'Mid-Premium').length;
  let uLux = upcomingData.filter(p => p.priceCategory === 'Luxury').length;
  let elUEco = document.getElementById('uEconomical');
  if(elUEco) elUEco.textContent = uEco;
  let elUMid = document.getElementById('uMidPremium');
  if(elUMid) elUMid.textContent = uMid;
  let elULux = document.getElementById('uLuxury');
  if(elULux) elULux.textContent = uLux;

  let recentUpEl = document.getElementById('recentUpcomingBody');
  if(recentUpEl){
    let recentUp = [...upcomingData].sort((a,b) => String(b.created).localeCompare(String(a.created))).slice(0, 6);
    recentUpEl.innerHTML = recentUp.map(p => {
      let catClass = 'cat-' + (p.priceCategory || 'Economical').toLowerCase().replace(/\s+/g, '-');
      let statusClass = (p.status || 'Upcoming').toLowerCase().replace(/\s+/g, '-');
      return `<tr>
        <td>
          <b>${esc(p.name)}</b>
          <div class="muted" style="font-size:11.5px;margin-top:2px">Project • By ${esc(p.developer || p.type)}</div>
        </td>
        <td>
          <div style="font-weight:600;font-size:13px">📍 ${esc(p.location)}</div>
        </td>
        <td><b>${moneyRange(p.price, p.maxPrice)}</b></td>
        <td>
          <span class="badge ${catClass}">${esc(p.priceCategory)}</span>
          <span class="badge slab">${esc(p.budgetSlab)}</span>
        </td>
        <td><span class="badge ${statusClass}">${esc(p.status)}</span></td>
        <td>${esc(p.launchDate || p.possessionDate || '—')}</td>
        <td><button class="mini primary" onclick="viewProject('${p.id}')">View</button></td>
      </tr>`;
    }).join('');
  }
}

// ==================== PROPERTIES CODE (ADVANCED FILTERS) ====================
function fillLocations(){
  if(typeof populateAllConfigDropdowns === 'function') populateAllConfigDropdowns();
}
function fillPropertyTypes(){
  if(typeof populateAllConfigDropdowns === 'function') populateAllConfigDropdowns();
}

let currentView='table';
function setView(v){currentView=v;tableViewBtn.classList.toggle('active',v==='table');cardViewBtn.classList.toggle('active',v==='card');renderProperties()}

function filtered(){
  let q=(search.value||'').toLowerCase().trim();
  let loc=filterLocation.value;
  let typ=filterType.value;
  let bhk=filterBhk.value;
  let cat=filterCategory.value;
  let slab=filterSlab.value;
  let st=filterStatus.value;

  let a=data.filter(p=>{
    if(loc && p.location!==loc) return false;
    if(typ && p.type!==typ) return false;
    if(st && p.status!==st) return false;

    // BHK / Configuration Filter
    if(bhk){
      let b=(p.bhk||'').toLowerCase();
      if(bhk==='1 BHK' && !b.includes('1 bhk') && !b.includes('1bhk')) return false;
      if(bhk==='2 BHK' && !b.includes('2 bhk') && !b.includes('2bhk')) return false;
      if(bhk==='3 BHK' && !b.includes('3 bhk') && !b.includes('3bhk')) return false;
      if(bhk==='4 BHK' && !b.includes('4 bhk') && !b.includes('4bhk')) return false;
      if(bhk==='5 BHK+'){
        let m=b.match(/(\d+)\s*bhk/);
        let n=m?parseInt(m[1]):0;
        if(n<5) return false;
      }
      if(bhk==='non-bhk'){
        if(b.includes('bhk')) return false;
      }
    }

    // Price Category Filter
    if(cat){
      let pCat=getPropertyCategory(p.price);
      if(pCat!==cat) return false;
    }

    // Budget Slab Filter
    if(slab){
      let cr=(Number(p.price)||0)/10000000;
      if(slab==='Below ₹1 Cr' && cr>=1) return false;
      if(slab==='₹1 Cr' && (cr<1 || cr>=2)) return false;
      if(slab==='₹2 Cr' && (cr<2 || cr>=3)) return false;
      if(slab==='₹3 Cr' && (cr<3 || cr>=5)) return false;
      if(slab==='₹5 Cr+' && cr<5) return false;
    }

    // Global Search
    if(q){
      let text=[p.name, p.location, p.type, p.bhk, p.owner, p.phone, p.facing, p.road, p.notes, p.price, p.area, p.developer].filter(Boolean).join(' ').toLowerCase();
      if(!text.includes(q)) return false;
    }

    return true;
  });

  let s=sortBy.value;
  a.sort((x,y)=>{
    if(s==='az') return x.name.localeCompare(y.name);
    if(s==='priceLow') return (Number(x.price)||0)-(Number(y.price)||0);
    if(s==='priceHigh') return (Number(y.price)||0)-(Number(x.price)||0);
    if(s==='areaHigh') return (Number(y.area)||0)-(Number(x.area)||0);
    if(s==='old' || s==='oldest') return String(x.created).localeCompare(String(y.created));
    return String(y.created).localeCompare(String(x.created));
  });
  return a;
}

function renderProperties(){
  fillLocations();
  fillPropertyTypes();
  let a=filtered();resultCount.textContent=a.length+' result'+(a.length!==1?'s':'');
  if(!a.length){propertyResults.innerHTML='<div class="empty">No properties found matching your criteria.<br><button class="btn" style="margin-top:10px" onclick="clearFilters()">Clear filters</button></div>';return}
  if(currentView==='table'){
   propertyResults.innerHTML=`<div class="table-wrap"><table class="table"><thead><tr><th>Property</th><th>Location</th><th>Type / BHK</th><th>Area</th><th>Price & Slab</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead><tbody>${a.map(p=>row(p)).join('')}</tbody></table></div><div class="pagination"><span>Showing ${a.length} properties</span><span>LocalStorage • Offline</span></div>`;
  }else propertyResults.innerHTML='<div class="grid">'+a.map(card).join('')+'</div>';
}

function row(p){
  let cat = getPropertyCategory(p.price);
  let slab = getPropertyBudgetSlab(p.price);
  let catClass = 'cat-' + cat.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
  return `<tr>
    <td><div class="property-name">${esc(p.name)}</div><div class="muted">${esc(p.facing||'')} ${p.road?'• '+esc(p.road):''}</div></td>
    <td>${esc(p.location)}</td>
    <td>${esc(p.type)}<div class="muted">${esc(p.bhk||'—')}</div></td>
    <td>${p.area?esc(p.area)+' yd²':'—'}</td>
    <td>
      <b>${money(p.price)}</b>
      <div class="tag-row" style="margin-top:4px">
        <span class="badge ${catClass}">${esc(cat)}</span>
        <span class="badge slab">${esc(slab)}</span>
      </div>
    </td>
    <td>${esc(p.owner||'—')}<div class="muted">${esc(p.phone||'')}</div></td>
    <td><span class="badge ${(p.status || 'available').toLowerCase()}">${esc(p.status || 'Available')}</span></td>
    <td><div class="actions"><button class="mini" onclick="view('${p.id}')">View</button><button class="mini" onclick="openForm('${p.id}')">Edit</button><button class="mini" onclick="toggleFav('${p.id}')" title="${p.favorite?'Remove from favorites':'Add to favorites'}">${p.favorite?'★':'☆'}</button><button class="mini" onclick="removeProp('${p.id}')">Delete</button></div></td>
  </tr>`;
}

function card(p){
  let cat = getPropertyCategory(p.price);
  let slab = getPropertyBudgetSlab(p.price);
  let catClass = 'cat-' + cat.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
  let hasImg = p.photo && p.photo.trim();

  return `<article class="prop-card">
    ${hasImg ? `<div class="prop-cover" onclick="openLightbox('${esc(p.photo)}', '${esc(p.name)}')" title="Click to view full image"><img src="${esc(p.photo)}" alt="${esc(p.name)}" onerror="this.parentElement.style.display='none'"></div>` : ''}
    <div class="prop-body">
      <div style="display:flex;justify-content:space-between;gap:5px">
        <h3>${esc(p.name)}</h3>
        <button class="mini" onclick="toggleFav('${p.id}')" title="${p.favorite?'Remove from favorites':'Add to favorites'}">${p.favorite?'★':'☆'}</button>
      </div>
      <div class="muted">${esc(p.location)}</div>
      <div class="tag-row" style="margin:6px 0 2px">
        <span class="badge ${catClass}">${esc(cat)}</span>
        <span class="badge slab">${esc(slab)}</span>
      </div>
      <div class="prop-meta">
        <span>${esc(p.type)}</span>
        ${p.bhk?`<span>${esc(p.bhk)}</span>`:''}
        ${p.area?`<span>${esc(p.area)} yd²</span>`:''}
        <span>${esc(p.facing||'')}</span>
      </div>
      <div class="prop-price">${money(p.price)}</div>
      <span class="badge ${(p.status || 'available').toLowerCase()}">${esc(p.status || 'Available')}</span>
      <div class="prop-actions" style="margin-top:9px">
        <button class="mini" onclick="view('${p.id}')">View</button>
        <button class="mini" onclick="openForm('${p.id}')">Edit</button>
      </div>
    </div>
  </article>`;
}

function clearFilters(){
  search.value='';
  filterLocation.value='';
  filterType.value='';
  filterBhk.value='';
  filterCategory.value='';
  filterSlab.value='';
  filterStatus.value='';
  sortBy.value='new';
  renderProperties();
}

let formPropertySource = 'company';

function openForm(id, focusPhoto = false){
  formPropertySource = 'company';
  let fSource = document.getElementById('fSource');
  if(fSource) fSource.value = 'company';
  let badge = document.getElementById('formSourceBadge');
  if(badge) badge.style.display = 'none';

  let p=id?data.find(x=>x.id===id):null;
  let ft = document.getElementById('formTitle');
  if(ft) ft.textContent = p ? 'Edit Property' : 'Add Property';
  let vals=p||{id:'',name:'',location:'',type:'Villa',bhk:'',area:'',dim:'',facing:'',road:'',price:'',status:'Available',owner:'',phone:'',follow:'',map:'',photo:'',video:'',notes:''};
  Object.entries({fId:'id',fName:'name',fLocation:'location',fType:'type',fBhk:'bhk',fArea:'area',fDim:'dim',fFacing:'facing',fRoad:'road',fPrice:'price',fStatus:'status',fOwner:'owner',fPhone:'phone',fFollow:'follow',fMap:'map',fPhoto:'photo',fVideo:'video',fNotes:'notes'}).forEach(([el,k])=>document.getElementById(el).value=vals[k]??'');
  
  // Set image preview
  let photoVal = (vals.photo||'').trim();
  const pWrap = document.getElementById('fPhotoPreviewWrap');
  const pImg = document.getElementById('fPhotoPreview');
  if(photoVal){
    pImg.src = photoVal;
    pWrap.style.display = 'flex';
  } else {
    pImg.src = '';
    pWrap.style.display = 'none';
  }

  updatePropertyCategoryPreview();
  let fm = document.getElementById('formModal');
  if(fm) fm.classList.add('show');
  if(focusPhoto){
    setTimeout(()=>{
      let el = document.getElementById('fPhotoFile');
      if(el){
        el.scrollIntoView({behavior:'smooth', block:'center'});
        el.focus();
      }
    }, 200);
  }
}

function openDirectPropertyForm(id, focusPhoto = false){
  formPropertySource = 'direct';
  let fSource = document.getElementById('fSource');
  if(fSource) fSource.value = 'direct';
  let badge = document.getElementById('formSourceBadge');
  if(badge){
    badge.style.display = '';
    badge.textContent = '🔑 DIRECT PROPERTY';
  }

  let p = id ? (typeof directData !== 'undefined' ? directData.find(x => x.id === id) : null) : null;
  let ft = document.getElementById('formTitle');
  if(ft) ft.textContent = p ? 'Edit Direct Property' : 'Add Direct Property';
  let vals = p || { id:'', name:'', location:'', type:'Villa', bhk:'', area:'', dim:'', facing:'', road:'', price:'', status:'Available', owner:'', phone:'', follow:'', map:'', photo:'', video:'', notes:'' };
  Object.entries({fId:'id',fName:'name',fLocation:'location',fType:'type',fBhk:'bhk',fArea:'area',fDim:'dim',fFacing:'facing',fRoad:'road',fPrice:'price',fStatus:'status',fOwner:'owner',fPhone:'phone',fFollow:'follow',fMap:'map',fPhoto:'photo',fVideo:'video',fNotes:'notes'}).forEach(([el,k])=>document.getElementById(el).value=vals[k]??'');

  let photoVal = (vals.photo||'').trim();
  const pWrap = document.getElementById('fPhotoPreviewWrap');
  const pImg = document.getElementById('fPhotoPreview');
  if(photoVal){
    pImg.src = photoVal;
    pWrap.style.display = 'flex';
  } else {
    pImg.src = '';
    pWrap.style.display = 'none';
  }

  updatePropertyCategoryPreview();
  let fm = document.getElementById('formModal');
  if(fm) fm.classList.add('show');
  if(focusPhoto){
    setTimeout(()=>{
      let el = document.getElementById('fPhotoFile');
      if(el){
        el.scrollIntoView({behavior:'smooth', block:'center'});
        el.focus();
      }
    }, 200);
  }
}

function saveProperty(){
  let isDirect = formPropertySource === 'direct' || (document.getElementById('fSource')?.value === 'direct') || (document.getElementById('fId')?.value.startsWith('dp_'));
  let id = fId.value || (isDirect ? ('dp_' + Date.now()) : ('p' + Date.now()));
  let old = isDirect ? directData.find(p=>p.id===id) : data.find(p=>p.id===id);
  let price = Number(fPrice.value) || 0;
  let p = {
    id,
    name: fName.value.trim(),
    location: fLocation.value.trim(),
    type: fType.value,
    bhk: fBhk.value.trim(),
    area: Number(fArea.value) || 0,
    dim: fDim.value.trim(),
    facing: fFacing.value.trim(),
    road: fRoad.value.trim(),
    price: price,
    priceCategory: getPropertyCategory(price),
    budgetSlab: getPropertyBudgetSlab(price),
    status: fStatus.value,
    owner: fOwner.value.trim(),
    phone: fPhone.value.trim(),
    follow: fFollow.value,
    map: fMap.value.trim(),
    photo: fPhoto.value.trim(),
    video: fVideo.value.trim(),
    notes: fNotes.value.trim(),
    favorite: old?.favorite || false,
    isDirect: isDirect,
    source: isDirect ? 'direct' : 'company',
    created: old?.created || new Date().toISOString().slice(0,10)
  };
  if(!p.name || !p.location){ toast('Property name and location are required'); return; }

  if(isDirect){
    let i = directData.findIndex(x => x.id === id);
    if(i >= 0) directData[i] = p; else directData.unshift(p);
    saveDirect();
    closeModal('formModal');
    renderAll();
    toast(i >= 0 ? 'Direct Property updated' : 'Direct Property added');
  } else {
    let i = data.findIndex(x => x.id === id);
    if(i >= 0) data[i] = p; else data.unshift(p);
    save();
    closeModal('formModal');
    renderAll();
    toast(i >= 0 ? 'Property updated' : 'Property added');
  }
}

function removeProp(id){
  let p = data.find(x => x.id === id);
  if(!p) return;
  if(!confirm('Delete "' + p.name + '"? It will be moved to Recently Deleted (kept for 5 days).')) return;
  data = data.filter(x => x.id !== id);
  save();
  moveToRecentlyDeleted('property', p);
  renderAll();
  toast('Property moved to Recently Deleted');
}

function removeDirectProperty(id){
  let p = directData.find(x => x.id === id);
  if(!p) return;
  if(!confirm('Delete Direct Property "' + p.name + '"? It will be moved to Recently Deleted (kept for 5 days).')) return;
  directData = directData.filter(x => x.id !== id);
  saveDirect();
  moveToRecentlyDeleted('direct', p);
  renderAll();
  toast('Direct Property moved to Recently Deleted');
}

function toggleFav(id){
  let p = data.find(x => x.id === id);
  if(p){
    p.favorite = !p.favorite;
    save();
    renderAll();
    toast(p.favorite ? 'Property added to favorites' : 'Property removed from favorites');
    return;
  }
  if(typeof directData !== 'undefined'){
    let dp = directData.find(x => x.id === id);
    if(dp){
      dp.favorite = !dp.favorite;
      saveDirect();
      renderAll();
      toast(dp.favorite ? 'Direct Property added to favorites' : 'Direct Property removed from favorites');
      return;
    }
  }
}

function view(id){
  let p = data.find(x => x.id === id) || (typeof directData !== 'undefined' ? directData.find(x => x.id === id) : null);
  if(!p) return;
  dTitle.textContent = p.name;
  let isDirect = !!p.isDirect || (p.id && p.id.startsWith('dp_'));
  let cat = getPropertyCategory(p.price);
  let slab = getPropertyBudgetSlab(p.price);
  let catClass = 'cat-' + cat.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
  let sourceBadge = isDirect
    ? `<span class="badge badge-source-direct">🔑 DIRECT PROPERTY (Personally Sourced)</span>`
    : `<span class="badge badge-source-prop">🏢 COMPANY INVENTORY</span>`;

  detailBody.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px">
      <div>
        <div style="margin-bottom:6px">${sourceBadge}</div>
        <div class="muted">📍 ${esc(p.location)}</div>
        <div style="font-size:22px;font-weight:800;margin-top:4px">${money(p.price)}</div>
        <div class="tag-row" style="margin-top:5px">
          <span class="badge ${catClass}">${esc(cat)}</span>
          <span class="badge slab">${esc(slab)}</span>
        </div>
      </div>
      <span class="badge ${p.status.toLowerCase()}">${esc(p.status)}</span>
    </div>
    <div class="details">${[
      ['Source Type', isDirect ? 'Direct Client/Owner' : 'Company Inventory'],
      ['Type', p.type],
      ['BHK', p.bhk || '—'],
      ['Area', p.area ? p.area + ' yd²' : '—'],
      ['Price Category', cat],
      ['Budget Slab', slab],
      ['Dimensions', p.dim || '—'],
      ['Facing', p.facing || '—'],
      ['Road', p.road || '—'],
      ['Owner / Client', p.owner || '—'],
      ['Phone', p.phone || '—'],
      ['Follow-up', p.follow || '—']
    ].map(x=>`<div class="detail"><label>${esc(x[0])}</label><b>${esc(x[1])}</b></div>`).join('')}${p.video ? `<div class="detail"><label>Video Tour</label><b><a href="${esc(p.video)}" target="_blank" style="color:#2563eb;text-decoration:none">▶ Watch Video</a></b></div>` : ''}</div>
    <h3 style="font-size:14px;margin:18px 0 8px">Notes</h3><div class="notes">${esc(p.notes||'No notes')}</div>`;
  
  let isFav = !!p.favorite;
  let editFunc = isDirect ? `openDirectPropertyForm('${p.id}');closeModal('detailModal')` : `openForm('${p.id}');closeModal('detailModal')`;
  let delFunc = isDirect ? `removeDirectProperty('${p.id}');closeModal('detailModal')` : `removeProp('${p.id}');closeModal('detailModal')`;

  detailFoot.innerHTML = `
    <button class="btn" id="dPropFavBtn" style="${isFav?'background:#eff6ff;color:#1d4ed8;border-color:#93c5fd;font-weight:700':''}" onclick="toggleFav('${p.id}')">${isFav ? '★ Shortlisted' : '⭐ Favorite'}</button>
    ${p.phone ? `<button class="btn" onclick="handleDetailCall('property', '${p.id}')">📞 Call</button>` : ''}
    ${p.phone ? `<button class="btn" onclick="handleDetailWhatsApp('property', '${p.id}')">💬 WhatsApp</button>` : ''}
    ${p.map ? `<button class="btn" onclick="handleDetailMaps('property', '${p.id}')">📍 Maps</button>` : ''}
    ${p.photo ? `<button class="btn" onclick="openLightbox('${esc(p.photo)}', '${esc(p.name)}')">📷 Image</button>` : ''}
    <button class="btn" onclick="${editFunc}">✏️ Edit</button>
    <button class="btn" style="color:#ef4444;border-color:#fca5a5" onclick="${delFunc}">🗑️ Delete</button>
  `;
  detailModal.classList.add('show');
}

// ==================== DIRECT PROPERTY CODE ====================
let directView = 'table';
function setDirectView(v){
  directView = v;
  let tb = document.getElementById('directTableViewBtn');
  let cb = document.getElementById('directCardViewBtn');
  if(tb) tb.classList.toggle('active', v === 'table');
  if(cb) cb.classList.toggle('active', v === 'card');
  renderDirectProperties();
}

function clearDirectFilters(){
  let elS = document.getElementById('directSearch'); if(elS) elS.value = '';
  let elL = document.getElementById('directFilterLocation'); if(elL) elL.value = '';
  let elT = document.getElementById('directFilterType'); if(elT) elT.value = '';
  let elB = document.getElementById('directFilterBhk'); if(elB) elB.value = '';
  let elC = document.getElementById('directFilterCategory'); if(elC) elC.value = '';
  let elSl = document.getElementById('directFilterSlab'); if(elSl) elSl.value = '';
  let elSt = document.getElementById('directFilterStatus'); if(elSt) elSt.value = '';
  let elSo = document.getElementById('directSortBy'); if(elSo) elSo.value = 'new';
  renderDirectProperties();
}

function renderDirectProperties(){
  let target = document.getElementById('directPropertyResults');
  if(!target) return;
  let list = (typeof directData !== 'undefined' ? directData : []);

  let s = (document.getElementById('directSearch')?.value || '').toLowerCase().trim();
  let l = document.getElementById('directFilterLocation')?.value || '';
  let t = document.getElementById('directFilterType')?.value || '';
  let b = document.getElementById('directFilterBhk')?.value || '';
  let c = document.getElementById('directFilterCategory')?.value || '';
  let sl = document.getElementById('directFilterSlab')?.value || '';
  let st = document.getElementById('directFilterStatus')?.value || '';
  let so = document.getElementById('directSortBy')?.value || 'new';

  let filtered = list.filter(p => {
    let cat = p.priceCategory || getPropertyCategory(p.price);
    let slab = p.budgetSlab || getPropertyBudgetSlab(p.price);
    let blob = [p.name, p.location, p.type, p.bhk, p.owner, p.phone, p.notes, p.status, p.dim, p.facing, p.road, cat, slab, money(p.price)].join(' ').toLowerCase();

    if(s && !blob.includes(s)) return false;
    if(l && p.location !== l) return false;
    if(t && p.type !== t) return false;
    if(b){
      if(b === 'non-bhk'){
        if(p.bhk && p.bhk.trim()) return false;
      } else if(b === '5 BHK+'){
        let m = (p.bhk || '').match(/(\d+)/);
        if(!m || Number(m[1]) < 5) return false;
      } else {
        if((p.bhk || '').toLowerCase() !== b.toLowerCase()) return false;
      }
    }
    if(c && cat !== c) return false;
    if(sl && slab !== sl) return false;
    if(st && p.status !== st) return false;
    return true;
  });

  filtered.sort((x, y) => {
    if(so === 'az') return String(x.name).localeCompare(String(y.name));
    if(so === 'priceLow') return (Number(x.price)||0) - (Number(y.price)||0);
    if(so === 'priceHigh') return (Number(y.price)||0) - (Number(x.price)||0);
    if(so === 'areaHigh') return (Number(y.area)||0) - (Number(x.area)||0);
    if(so === 'old' || so === 'oldest') return String(x.created || x.id).localeCompare(String(y.created || y.id));
    return String(y.created || y.id).localeCompare(String(x.created || x.id));
  });

  let countEl = document.getElementById('directResultCount');
  if(countEl) countEl.textContent = `${filtered.length} direct propert${filtered.length !== 1 ? 'ies' : 'y'}`;

  if(!filtered.length){
    target.innerHTML = `<div class="empty">
      <div style="font-size:32px;margin-bottom:8px">🔑</div>
      <b>No direct properties found</b>
      <div style="color:var(--muted);margin-top:4px">Try adjusting your filters or click below to add a direct property.</div>
      <button class="btn primary" style="margin-top:12px" onclick="openDirectPropertyForm()">＋ Add Direct Property</button>
    </div>`;
    return;
  }

  if(directView === 'table'){
    target.innerHTML = `<div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Type / BHK</th>
            <th>Location</th>
            <th>Price</th>
            <th>Category & Slab</th>
            <th>Status</th>
            <th>Owner / Client</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(directRow).join('')}
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <span>Showing ${filtered.length} of ${list.length} direct properties</span>
      <span>Direct Client/Owner Sourced • Isolated Storage</span>
    </div>`;
  } else {
    target.innerHTML = `<div class="grid">${filtered.map(directCard).join('')}</div>`;
  }
}

function directRow(p){
  let cat = getPropertyCategory(p.price);
  let slab = getPropertyBudgetSlab(p.price);
  let catClass = 'cat-' + cat.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
  return `<tr>
    <td>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
        <span class="badge badge-source-direct" style="font-size:10px;padding:2px 6px">🔑 DIRECT</span>
        <div class="property-name">${esc(p.name)}</div>
      </div>
      <div class="muted">${esc(p.facing||'')} ${p.road?'• '+esc(p.road):''}</div>
    </td>
    <td>${esc(p.type)}<div class="muted">${esc(p.bhk||'—')}</div></td>
    <td><b>${esc(p.location)}</b></td>
    <td><b>${money(p.price)}</b></td>
    <td>
      <div class="tag-row">
        <span class="badge ${catClass}">${esc(cat)}</span>
        <span class="badge slab">${esc(slab)}</span>
      </div>
    </td>
    <td><span class="badge ${p.status.toLowerCase()}">${esc(p.status)}</span></td>
    <td>
      <div><b>${esc(p.owner||'Direct Owner')}</b></div>
      ${p.phone ? `<a href="tel:${esc(p.phone)}" style="font-size:12px;color:var(--primary);text-decoration:none">📞 ${esc(p.phone)}</a>` : ''}
    </td>
    <td>
      <div class="actions">
        <button class="mini" onclick="view('${p.id}')">View</button>
        <button class="mini" onclick="openDirectPropertyForm('${p.id}')">Edit</button>
        <button class="mini" onclick="toggleFav('${p.id}')" title="${p.favorite?'Remove from favorites':'Add to favorites'}">${p.favorite?'★':'☆'}</button>
        <button class="mini" onclick="removeDirectProperty('${p.id}')">Delete</button>
      </div>
    </td>
  </tr>`;
}

function directCard(p){
  let cat = getPropertyCategory(p.price);
  let slab = getPropertyBudgetSlab(p.price);
  let catClass = 'cat-' + cat.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
  let hasImg = p.photo && p.photo.trim();

  return `<article class="prop-card">
    ${hasImg ? `<div class="prop-cover" onclick="openLightbox('${esc(p.photo)}', '${esc(p.name)}')" title="Click to view full image"><img src="${esc(p.photo)}" alt="${esc(p.name)}" onerror="this.parentElement.style.display='none'"></div>` : ''}
    <div class="prop-body">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <span class="badge badge-source-direct">🔑 DIRECT PROPERTY</span>
          <span class="badge ${p.status.toLowerCase()}">${esc(p.status)}</span>
        </div>
        <button class="mini" onclick="toggleFav('${p.id}')" title="${p.favorite?'Remove from favorites':'Add to favorites'}">${p.favorite?'★':'☆'}</button>
      </div>
      <h3 style="margin:8px 0 3px">${esc(p.name)}</h3>
      <div class="muted">📍 ${esc(p.location)}</div>
      <div class="tag-row" style="margin:6px 0 4px">
        <span class="badge ${catClass}">${esc(cat)}</span>
        <span class="badge slab">${esc(slab)}</span>
      </div>
      <div class="prop-meta">
        <span>${esc(p.type)}</span>
        ${p.bhk?`<span>${esc(p.bhk)}</span>`:''}
        ${p.area?`<span>${esc(p.area)} yd²</span>`:''}
        <span>${esc(p.facing||'')}</span>
      </div>
      <div style="margin-top:6px;font-size:12px;background:rgba(234,179,8,0.1);padding:4px 8px;border-radius:6px;border:1px solid rgba(234,179,8,0.25)">
        👤 <b>${esc(p.owner||'Direct Owner')}</b> ${p.phone ? `• <a href="tel:${esc(p.phone)}" style="color:var(--primary);text-decoration:none">${esc(p.phone)}</a>` : ''}
      </div>
      <div class="prop-price" style="margin-top:6px">${money(p.price)}</div>
      <div class="prop-actions" style="margin-top:9px;display:flex;gap:6px;flex-wrap:wrap">
        <button class="mini" onclick="view('${p.id}')">View</button>
        <button class="mini" onclick="openDirectPropertyForm('${p.id}')">Edit</button>
        ${p.phone ? `<a class="mini" href="tel:${esc(p.phone)}">📞 Call</a>` : ''}
        ${p.phone ? `<button class="mini" onclick="window.open('https://wa.me/91${esc(p.phone.replace(/\\D/g,''))}')">💬 WhatsApp</button>` : ''}
      </div>
    </div>
  </article>`;
}

// ==================== UPCOMING PROJECTS CODE ====================
let upCurrentView = 'table';
function setUpView(v){
  upCurrentView = v;
  upTableViewBtn.classList.toggle('active', v === 'table');
  upCardViewBtn.classList.toggle('active', v === 'card');
  renderUpcoming();
}

function fillUpcomingLocations(){
  if(typeof populateAllConfigDropdowns === 'function') populateAllConfigDropdowns();
}

function filteredUpcoming(){
  let q = (upSearch.value||'').toLowerCase().trim();
  let loc = upFilterLocation.value;
  let typ = upFilterType.value;
  let cat = upFilterCategory.value;
  let slab = upFilterSlab.value;
  let st = upFilterStatus.value;
  
  let list = upcomingData.filter(p=>{
    if(loc && p.location !== loc) return false;
    if(typ && p.type !== typ) return false;
    if(cat && p.priceCategory !== cat) return false;
    if(slab && p.budgetSlab !== slab) return false;
    if(st && p.status !== st) return false;
    if(q){
      let text = [p.name, p.developer, p.location, p.type, p.bhk, p.owner, p.phone, p.notes, p.priceCategory, p.budgetSlab, p.launchDate, p.possessionDate].join(' ').toLowerCase();
      if(!text.includes(q)) return false;
    }
    return true;
  });

  let s = upSortBy.value;
  list.sort((x,y)=>{
    if(s === 'az') return x.name.localeCompare(y.name);
    if(s === 'priceLow') return (Number(x.price)||0) - (Number(y.price)||0);
    if(s === 'priceHigh') return (Number(y.price)||0) - (Number(x.price)||0);
    if(s === 'old' || s === 'oldest') return String(x.created).localeCompare(String(y.created));
    return String(y.created).localeCompare(String(x.created));
  });
  return list;
}

function renderUpcoming(){
  fillUpcomingLocations();
  let list = filteredUpcoming();
  upResultCount.textContent = list.length + ' project' + (list.length !== 1 ? 's' : '');

  if(!list.length){
    upcomingResults.innerHTML = '<div class="empty">No upcoming projects found matching your criteria.<br><button class="btn" style="margin-top:10px" onclick="clearProjectFilters()">Clear filters</button></div>';
    return;
  }

  if(upCurrentView === 'table'){
    upcomingResults.innerHTML = `<div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Project & Developer</th>
            <th>Location</th>
            <th>Type / Config</th>
            <th>Price Range</th>
            <th>Category & Slab</th>
            <th>Status</th>
            <th>Possession / Launch</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(p => upRow(p)).join('')}
        </tbody>
      </table>
    </div>
    <div class="pagination"><span>Showing ${list.length} upcoming projects</span><span>Dedicated LocalStorage • Offline</span></div>`;
  } else {
    upcomingResults.innerHTML = '<div class="grid">' + list.map(upCard).join('') + '</div>';
  }
}

function upRow(p){
  let catClass = 'cat-' + (p.priceCategory||'Economical').toLowerCase().replace(/\s+/g,'-');
  let statusClass = (p.status||'Upcoming').toLowerCase().replace(/\s+/g,'-');
  return `<tr>
    <td>
      <div class="property-name">${esc(p.name)}</div>
      <div class="muted">By ${esc(p.developer||'Independent / N/A')}</div>
    </td>
    <td>${esc(p.location)}</td>
    <td>
      <b>${esc(p.type)}</b>
      <div class="muted">${esc(p.bhk||'—')}</div>
    </td>
    <td><b>${moneyRange(p.price, p.maxPrice)}</b></td>
    <td>
      <div class="tag-row">
        <span class="badge ${catClass}">${esc(p.priceCategory)}</span>
        <span class="badge slab">${esc(p.budgetSlab)}</span>
      </div>
    </td>
    <td><span class="badge ${statusClass}">${esc(p.status)}</span></td>
    <td>
      <div>${esc(p.possessionDate||'—')}</div>
      <div class="muted">${p.launchDate ? 'Launch: '+esc(p.launchDate) : ''}</div>
    </td>
    <td>
      <div class="actions">
        <button class="mini" onclick="viewProject('${p.id}')">View</button>
        <button class="mini" onclick="openProjectForm('${p.id}')">Edit</button>
        <button class="mini" onclick="toggleProjectFav('${p.id}')" title="${p.favorite?'Remove from favorites':'Add to favorites'}">${p.favorite?'★':'☆'}</button>
        <button class="mini" onclick="removeProject('${p.id}')">Delete</button>
      </div>
    </td>
  </tr>`;
}

function upCard(p){
  let catClass = 'cat-' + (p.priceCategory||'Economical').toLowerCase().replace(/\s+/g,'-');
  let statusClass = (p.status||'Upcoming').toLowerCase().replace(/\s+/g,'-');
  let hasImg = p.photo && p.photo.trim();

  return `<article class="prop-card">
    ${hasImg ? `<div class="prop-cover" onclick="openLightbox('${esc(p.photo)}', '${esc(p.name)}')" title="Click to view full image"><img src="${esc(p.photo)}" alt="${esc(p.name)}" onerror="this.parentElement.style.display='none'"></div>` : ''}
    <div class="prop-body">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <h3 style="margin:0">${esc(p.name)}</h3>
        <div style="display:flex;gap:5px;align-items:center">
          <button class="mini" onclick="toggleProjectFav('${p.id}')" title="${p.favorite?'Remove from favorites':'Add to favorites'}">${p.favorite?'★':'☆'}</button>
          <span class="badge ${statusClass}">${esc(p.status)}</span>
        </div>
      </div>
      <div class="muted" style="margin-top:2px">By ${esc(p.developer||'Independent')} • ${esc(p.location)}</div>
      <div class="tag-row" style="margin:8px 0 4px">
        <span class="badge ${catClass}">${esc(p.priceCategory)}</span>
        <span class="badge slab">${esc(p.budgetSlab)}</span>
      </div>
      <div class="prop-price">${moneyRange(p.price, p.maxPrice)}</div>
      <div class="prop-meta">
        <span>${esc(p.type)}</span>
        ${p.bhk ? `<span>${esc(p.bhk)}</span>` : ''}
        ${p.area ? `<span>${esc(p.area)}</span>` : ''}
        ${p.possessionDate ? `<span>Possession: ${esc(p.possessionDate)}</span>` : ''}
      </div>
      <div class="prop-actions" style="margin-top:9px">
        <button class="mini" onclick="viewProject('${p.id}')">View</button>
        <button class="mini" onclick="openProjectForm('${p.id}')">Edit</button>
        <button class="mini" onclick="removeProject('${p.id}')">Delete</button>
      </div>
    </div>
  </article>`;
}

function clearProjectFilters(){
  upSearch.value = '';
  upFilterLocation.value = '';
  upFilterType.value = '';
  upFilterCategory.value = '';
  upFilterSlab.value = '';
  upFilterStatus.value = '';
  upSortBy.value = 'new';
  renderUpcoming();
}

function openProjectForm(id, focusPhoto = false){
  let p = id ? upcomingData.find(x=>x.id===id) : null;
  pFormTitle.textContent = p ? 'Edit Upcoming Project' : 'Add Upcoming Project';
  let vals = p || {
    id: '',
    name: '',
    developer: '',
    location: '',
    type: 'Apartment',
    bhk: '',
    area: '',
    price: '',
    maxPrice: '',
    launchDate: '',
    possessionDate: '',
    status: 'Upcoming',
    owner: '',
    phone: '',
    map: '',
    photo: '',
    video: '',
    brochure: '',
    notes: ''
  };

  document.getElementById('pId').value = vals.id || '';
  document.getElementById('pName').value = vals.name || '';
  document.getElementById('pDeveloper').value = vals.developer || '';
  document.getElementById('pLocation').value = vals.location || '';
  document.getElementById('pType').value = vals.type || 'Apartment';
  document.getElementById('pBhk').value = vals.bhk || '';
  document.getElementById('pArea').value = vals.area || '';
  document.getElementById('pPrice').value = vals.price || '';
  document.getElementById('pMaxPrice').value = vals.maxPrice || '';
  document.getElementById('pLaunch').value = vals.launchDate || '';
  document.getElementById('pPossession').value = vals.possessionDate || '';
  document.getElementById('pStatus').value = vals.status || 'Upcoming';
  document.getElementById('pOwner').value = vals.owner || '';
  document.getElementById('pPhone').value = vals.phone || '';
  document.getElementById('pMap').value = vals.map || '';
  document.getElementById('pPhoto').value = vals.photo || '';
  document.getElementById('pVideo').value = vals.video || '';
  document.getElementById('pBrochure').value = vals.brochure || '';
  document.getElementById('pNotes').value = vals.notes || '';

  // Set image preview
  let photoVal = (vals.photo||'').trim();
  const pWrap = document.getElementById('pPhotoPreviewWrap');
  const pImg = document.getElementById('pPhotoPreview');
  if(photoVal){
    pImg.src = photoVal;
    pWrap.style.display = 'flex';
  } else {
    pImg.src = '';
    pWrap.style.display = 'none';
  }

  updateProjectCategoryPreview();
  projectFormModal.classList.add('show');
  if(focusPhoto){
    setTimeout(()=>{
      let el = document.getElementById('pPhotoFile');
      if(el){
        el.scrollIntoView({behavior:'smooth', block:'center'});
        el.focus();
      }
    }, 200);
  }
}

function saveProject(){
  let id = pId.value || 'up' + Date.now();
  let old = upcomingData.find(p=>p.id===id);
  let price = Number(pPrice.value) || 0;
  let maxPrice = Number(pMaxPrice.value) || 0;
  let p = {
    id,
    name: pName.value.trim(),
    developer: pDeveloper.value.trim(),
    location: pLocation.value.trim(),
    type: pType.value,
    bhk: pBhk.value.trim(),
    area: pArea.value.trim(),
    price: price,
    maxPrice: maxPrice,
    priceCategory: getPriceCategory(price),
    budgetSlab: getBudgetSlab(price),
    launchDate: pLaunch.value.trim(),
    possessionDate: pPossession.value.trim(),
    status: pStatus.value,
    owner: pOwner.value.trim(),
    phone: pPhone.value.trim(),
    map: pMap.value.trim(),
    photo: pPhoto.value.trim(),
    video: pVideo.value.trim(),
    brochure: pBrochure.value.trim(),
    notes: pNotes.value.trim(),
    favorite: old?.favorite || false,
    created: old?.created || new Date().toISOString().slice(0,10)
  };

  if(!p.name || !p.location){
    toast('Project name and location are required');
    return;
  }

  let i = upcomingData.findIndex(x=>x.id===id);
  if(i >= 0) upcomingData[i] = p;
  else upcomingData.unshift(p);

  saveUpcoming();
  closeModal('projectFormModal');
  renderAll();
  toast(i >= 0 ? 'Upcoming project updated' : 'Upcoming project added');
}

function removeProject(id){
  let p = upcomingData.find(x=>x.id===id);
  if(!p) return;
  if(!confirm('Delete upcoming project "' + p.name + '"? It will be moved to Recently Deleted (kept for 5 days).')) return;
  upcomingData = upcomingData.filter(x=>x.id!==id);
  saveUpcoming();
  moveToRecentlyDeleted('upcoming', p);
  renderAll();
  toast('Upcoming project moved to Recently Deleted');
}

function toggleProjectFav(id){
  let p = upcomingData.find(x=>x.id===id);
  if(p){
    p.favorite = !p.favorite;
    saveUpcoming();
    renderAll();
    toast(p.favorite ? 'Project added to favorites' : 'Project removed from favorites');
  }
}

function viewProject(id){
  let p = upcomingData.find(x=>x.id===id);
  if(!p) return;
  pdTitle.textContent = p.name;
  let catClass = 'cat-' + (p.priceCategory||'Economical').toLowerCase().replace(/\s+/g,'-');
  let statusClass = (p.status||'Upcoming').toLowerCase().replace(/\s+/g,'-');

  pdBody.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px">
      <div>
        <div class="muted">${esc(p.location)} ${p.developer ? '• By '+esc(p.developer) : ''}</div>
        <div style="font-size:22px;font-weight:800;margin-top:4px">${moneyRange(p.price, p.maxPrice)}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px">
        <span class="badge ${statusClass}">${esc(p.status)}</span>
        <div class="tag-row">
          <span class="badge ${catClass}">${esc(p.priceCategory)}</span>
          <span class="badge slab">${esc(p.budgetSlab)}</span>
        </div>
      </div>
    </div>
    <div class="details">
      ${[
        ['Type', p.type],
        ['BHK / Config', p.bhk || '—'],
        ['Area / Size', p.area || '—'],
        ['Expected Launch', p.launchDate || '—'],
        ['Possession', p.possessionDate || '—'],
        ['Price Category', p.priceCategory],
        ['Budget Slab', p.budgetSlab],
        ['Contact Person', p.owner || '—'],
        ['Phone', p.phone || '—']
      ].map(x => `<div class="detail"><label>${esc(x[0])}</label><b>${esc(x[1])}</b></div>`).join('')}
      ${p.brochure ? `<div class="detail"><label>Brochure</label><b><a href="${esc(p.brochure)}" target="_blank" style="color:#2563eb;text-decoration:none">📄 Open Brochure</a></b></div>` : ''}
      ${p.video ? `<div class="detail"><label>Video Tour</label><b><a href="${esc(p.video)}" target="_blank" style="color:#2563eb;text-decoration:none">▶ Watch Video</a></b></div>` : ''}
    </div>
    <h3 style="font-size:14px;margin:18px 0 8px">Notes & Amenities</h3>
    <div class="notes">${esc(p.notes || 'No notes added.')}</div>
  `;

  let isFav = !!p.favorite;
  pdFoot.innerHTML = `
    <button class="btn" id="dProjectFavBtn" style="${isFav?'background:#eff6ff;color:#1d4ed8;border-color:#93c5fd;font-weight:700':''}" onclick="toggleDetailFav('upcoming', '${p.id}')">${isFav ? '★ Shortlisted' : '⭐ Favorite'}</button>
    <button class="btn" onclick="handleDetailCall('upcoming', '${p.id}')">📞 Call</button>
    <button class="btn" onclick="handleDetailWhatsApp('upcoming', '${p.id}')">💬 WhatsApp</button>
    <button class="btn" onclick="handleDetailMaps('upcoming', '${p.id}')">📍 Maps</button>
    <button class="btn" onclick="handleDetailImage('upcoming', '${p.id}')">📷 Image</button>
    <button class="btn" onclick="openProjectForm('${p.id}');closeModal('projectDetailModal')">✏️ Edit</button>
  `;
  projectDetailModal.classList.add('show');
}

// ==================== COMBINED FAVORITES SYSTEM ====================
let favFilter = 'all'; // 'all' | 'property' | 'upcoming'
let favView = 'table'; // 'table' | 'card'

function setFavFilter(f){
  favFilter = f;
  let buttons = document.querySelectorAll('#favSourceFilter button');
  buttons.forEach((b, idx)=>{
    b.classList.toggle('active', (idx===0 && f==='all') || (idx===1 && f==='property') || (idx===2 && f==='upcoming'));
  });
  renderFavorites();
}

function setFavView(v){
  favView = v;
  favTableViewBtn.classList.toggle('active', v === 'table');
  favCardViewBtn.classList.toggle('active', v === 'card');
  renderFavorites();
}

function getFavoritesList(){
  let propFavs = data.filter(p=>p.favorite).map(p=>({
    ...p,
    source: 'property',
    favKey: 'property:' + p.id
  }));

  let directFavs = (typeof directData !== 'undefined' ? directData : []).filter(p=>p.favorite).map(p=>({
    ...p,
    source: 'direct',
    favKey: 'direct:' + p.id
  }));

  let upFavs = upcomingData.filter(p=>p.favorite).map(p=>({
    ...p,
    source: 'upcoming',
    favKey: 'upcoming:' + p.id
  }));

  // Update counter badges
  let elAll = document.getElementById('favCountAll');
  let elProp = document.getElementById('favCountProp');
  let elUp = document.getElementById('favCountUp');
  if(elAll) elAll.textContent = propFavs.length + directFavs.length + upFavs.length;
  if(elProp) elProp.textContent = propFavs.length + directFavs.length;
  if(elUp) elUp.textContent = upFavs.length;

  let combined = [];
  if(favFilter === 'all' || favFilter === 'property'){
    combined.push(...propFavs, ...directFavs);
  }
  if(favFilter === 'all' || favFilter === 'upcoming'){
    combined.push(...upFavs);
  }

  combined.sort((a,b) => String(b.created).localeCompare(String(a.created)));
  return combined;
}

function favRow(item){
  let isProp = item.source === 'property' || item.source === 'direct';
  let sourceBadge = item.source === 'direct'
    ? `<span class="badge badge-source-direct">🔑 DIRECT PROPERTY</span>`
    : item.source === 'property'
    ? `<span class="badge badge-source-prop">🏠 PROPERTY</span>`
    : `<span class="badge badge-source-up">🏗️ UPCOMING PROJECT</span>`;
  let priceStr = isProp ? money(item.price) : moneyRange(item.price, item.maxPrice);
  let statusClass = (item.status||'').toLowerCase().replace(/\s+/g, '-');
  let viewFunc = item.source === 'upcoming' ? `viewProject('${item.id}')` : `view('${item.id}')`;
  let unfavFunc = item.source === 'upcoming' ? `toggleProjectFav('${item.id}')` : `toggleFav('${item.id}')`;

  return `<tr>
    <td>
      <div class="property-name">${esc(item.name)}</div>
      <div class="muted">${isProp ? esc(item.bhk || item.type) : 'By ' + esc(item.developer || item.type)}</div>
    </td>
    <td>${sourceBadge}</td>
    <td>${esc(item.location)}</td>
    <td><b>${priceStr}</b></td>
    <td><span class="badge ${statusClass}">${esc(item.status)}</span></td>
    <td>
      <div class="actions">
        <button class="mini" onclick="${viewFunc}">View</button>
        <button class="mini" onclick="${unfavFunc}" title="Remove from favorites">★ Remove</button>
      </div>
    </td>
  </tr>`;
}

function favCard(item){
  let isProp = item.source === 'property' || item.source === 'direct';
  let sourceBadge = item.source === 'direct'
    ? `<span class="badge badge-source-direct">🔑 DIRECT PROPERTY</span>`
    : item.source === 'property'
    ? `<span class="badge badge-source-prop">🏠 PROPERTY</span>`
    : `<span class="badge badge-source-up">🏗️ UPCOMING PROJECT</span>`;
  let priceStr = isProp ? money(item.price) : moneyRange(item.price, item.maxPrice);
  let statusClass = (item.status||'').toLowerCase().replace(/\s+/g, '-');
  let viewFunc = item.source === 'upcoming' ? `viewProject('${item.id}')` : `view('${item.id}')`;
  let unfavFunc = item.source === 'upcoming' ? `toggleProjectFav('${item.id}')` : `toggleFav('${item.id}')`;
  let hasImg = item.photo && item.photo.trim();

  return `<article class="prop-card">
    ${hasImg ? `<div class="prop-cover" onclick="openLightbox('${esc(item.photo)}', '${esc(item.name)}')" title="Click to view full image"><img src="${esc(item.photo)}" alt="${esc(item.name)}" onerror="this.parentElement.style.display='none'"></div>` : ''}
    <div class="prop-body">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
        <h3 style="margin:0">${esc(item.name)}</h3>
        <button class="mini" onclick="${unfavFunc}" title="Remove from favorites">★</button>
      </div>
      <div class="muted" style="margin-top:2px">${esc(item.location)} ${item.developer ? '• By '+esc(item.developer) : ''}</div>
      <div class="tag-row" style="margin:6px 0">
        ${sourceBadge}
        <span class="badge ${statusClass}">${esc(item.status)}</span>
      </div>
      <div class="prop-price">${priceStr}</div>
      <div class="prop-actions" style="margin-top:9px">
        <button class="mini" onclick="${viewFunc}">View</button>
        <button class="mini" onclick="${unfavFunc}">Remove</button>
      </div>
    </div>
  </article>`;
}

function renderFavorites(){
  let favResults = document.getElementById('favResults');
  if(!favResults) return;
  let list = getFavoritesList();
  if(!list.length){
    let filterText = favFilter === 'property' ? 'properties' : favFilter === 'upcoming' ? 'upcoming projects' : 'items';
    favResults.innerHTML = `<div class="empty">No favorite ${filterText} yet.<br>Tap ☆ on any property or upcoming project to shortlist it.</div>`;
    return;
  }

  if(favView === 'table'){
    favResults.innerHTML = `<div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Source</th>
            <th>Location</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(favRow).join('')}
        </tbody>
      </table>
    </div>
    <div class="pagination"><span>Showing ${list.length} favorited items</span><span>Combined Reference • Isolated Storage</span></div>`;
  } else {
    favResults.innerHTML = '<div class="grid">' + list.map(favCard).join('') + '</div>';
  }
}

function renderFollowups(){
  let followResults = document.getElementById('followResults');
  if(!followResults) return;
  let allList = [
    ...data.map(p => ({ ...p, isDirect: false })),
    ...(typeof directData !== 'undefined' ? directData.map(p => ({ ...p, isDirect: true })) : [])
  ];
  let a = allList.filter(p => p.follow).sort((x, y) => String(x.follow).localeCompare(String(y.follow)));
  followResults.innerHTML = a.length
    ? '<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Property</th><th>Source</th><th>Owner / Client</th><th>Phone</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
      a.map(p => `<tr>
        <td><b>${esc(p.follow)}</b></td>
        <td>
          <div class="property-name">${esc(p.name)}</div>
          <div class="muted">${esc(p.location)}</div>
        </td>
        <td>${p.isDirect ? `<span class="badge badge-source-direct" style="font-size:10px">🔑 DIRECT</span>` : `<span class="badge badge-source-prop" style="font-size:10px">🏢 COMPANY</span>`}</td>
        <td>${esc(p.owner || '—')}</td>
        <td>${p.phone ? `<a href="tel:${esc(p.phone)}">${esc(p.phone)}</a>` : '—'}</td>
        <td><span class="badge ${p.status.toLowerCase()}">${esc(p.status)}</span></td>
        <td><button class="mini" onclick="view('${p.id}')">View</button></td>
      </tr>`).join('') +
      '</tbody></table></div>'
    : '<div class="empty">No follow-ups scheduled.</div>';
}

// BACKUP & RESTORE (Excel .xlsx / .xls + JSON with complete photos & multi-sheet structure)
function exportSpreadsheetML(dateStr){
  function escXml(s){
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  const propHeaders = ['ID', 'Property Name', 'Location', 'Type', 'BHK', 'Area (yd²)', 'Dimensions', 'Facing', 'Road Width', 'Price (₹)', 'Price Category', 'Budget Slab', 'Status', 'Owner / Broker', 'Phone', 'Follow-up Date', 'Google Maps URL', 'Video URL', 'Notes', 'Favorite', 'Photo / Image Data', 'Created Date'];
  const propRows = data.map(p => [
    p.id || '',
    p.name || '',
    p.location || '',
    p.type || '',
    p.bhk || '',
    p.area || '',
    p.dim || '',
    p.facing || '',
    p.road || '',
    Number(p.price) || 0,
    p.priceCategory || getPropertyCategory(p.price),
    p.budgetSlab || getPropertyBudgetSlab(p.price),
    p.status || '',
    p.owner || '',
    p.phone || '',
    p.follow || '',
    p.map || '',
    p.video || '',
    p.notes || '',
    p.favorite ? 'YES' : 'NO',
    p.photo || '',
    p.created || ''
  ]);

  const directHeaders = ['ID', 'Direct Property Name', 'Location', 'Type', 'BHK', 'Area (yd²)', 'Dimensions', 'Facing', 'Road Width', 'Price (₹)', 'Price Category', 'Budget Slab', 'Status', 'Owner / Client Contact', 'Phone', 'Follow-up Date', 'Google Maps URL', 'Video URL', 'Notes', 'Favorite', 'Photo / Image Data', 'Created Date'];
  const directRows = (typeof directData !== 'undefined' ? directData : []).map(p => [
    p.id || '',
    p.name || '',
    p.location || '',
    p.type || '',
    p.bhk || '',
    p.area || '',
    p.dim || '',
    p.facing || '',
    p.road || '',
    Number(p.price) || 0,
    p.priceCategory || getPropertyCategory(p.price),
    p.budgetSlab || getPropertyBudgetSlab(p.price),
    p.status || '',
    p.owner || '',
    p.phone || '',
    p.follow || '',
    p.map || '',
    p.video || '',
    p.notes || '',
    p.favorite ? 'YES' : 'NO',
    p.photo || '',
    p.created || ''
  ]);

  const upHeaders = ['ID', 'Project Name', 'Developer / Builder', 'Location', 'Project Type', 'BHK / Config', 'Area / Plot Size', 'Starting Price (₹)', 'Max Price (₹)', 'Price Category', 'Budget Slab', 'Project Status', 'Launch Date', 'Possession Date', 'Contact Person', 'Contact Phone', 'Google Maps URL', 'Brochure / Website', 'Video URL', 'Notes / Description', 'Favorite', 'Photo / Image Data', 'Created Date'];
  const upRows = upcomingData.map(p => [
    p.id || '',
    p.name || '',
    p.developer || '',
    p.location || '',
    p.type || '',
    p.bhk || '',
    p.area || '',
    Number(p.price) || 0,
    Number(p.maxPrice) || '',
    p.priceCategory || getPriceCategory(p.price),
    p.budgetSlab || getBudgetSlab(p.price),
    p.status || '',
    p.launchDate || '',
    p.possessionDate || '',
    p.owner || '',
    p.phone || '',
    p.map || '',
    p.brochure || '',
    p.video || '',
    p.notes || '',
    p.favorite ? 'YES' : 'NO',
    p.photo || '',
    p.created || ''
  ]);

  const favHeaders = ['Module', 'ID', 'Name / Project', 'Location', 'Type', 'Price (₹)', 'Status', 'Contact', 'Phone', 'Photo / Image Data'];
  const favProps = data.filter(p => p.favorite).map(p => ['Property', p.id||'', p.name||'', p.location||'', p.type||'', Number(p.price)||0, p.status||'', p.owner||'', p.phone||'', p.photo||'']);
  const favDirects = (typeof directData !== 'undefined' ? directData : []).filter(p => p.favorite).map(p => ['Direct Property', p.id||'', p.name||'', p.location||'', p.type||'', Number(p.price)||0, p.status||'', p.owner||'', p.phone||'', p.photo||'']);
  const favUps = upcomingData.filter(u => u.favorite).map(u => ['Upcoming Project', u.id||'', u.name||'', u.location||'', u.type||'', Number(u.price)||0, u.status||'', u.owner||'', u.phone||'', u.photo||'']);
  const favRows = [...favProps, ...favDirects, ...favUps];

  const infoHeaders = ['Parameter', 'Value'];
  const infoRows = [
    ['Application', 'Property Manager Pro'],
    ['Version', '2.0'],
    ['Export Date', new Date().toISOString()],
    ['Total Company Properties', data.length],
    ['Total Direct Properties', (typeof directData !== 'undefined' ? directData.length : 0)],
    ['Total Upcoming Projects', upcomingData.length],
    ['Total Favorites', favRows.length],
    ['Storage Engine', 'IndexedDB']
  ];

  const sheets = [
    { name: 'Properties', headers: propHeaders, rows: propRows },
    { name: 'Direct Properties', headers: directHeaders, rows: directRows },
    { name: 'Upcoming Projects', headers: upHeaders, rows: upRows },
    { name: 'Favorites', headers: favHeaders, rows: favRows },
    { name: 'CRM Info', headers: infoHeaders, rows: infoRows }
  ];

  let xml = '<?xml version="1.0"?>\n' +
    '<?mso-application progid="Excel.Sheet"?>\n' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n' +
    ' xmlns:o="urn:schemas-microsoft-com:office:office"\n' +
    ' xmlns:x="urn:schemas-microsoft-com:office:excel"\n' +
    ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\n' +
    ' xmlns:html="http://www.w3.org/TR/REC-html40">\n' +
    ' <Styles>\n' +
    '  <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Bottom"/></Style>\n' +
    '  <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#2563EB" ss:Pattern="Solid"/><Alignment ss:Vertical="Center"/></Style>\n' +
    ' </Styles>\n';

  for(const sheet of sheets){
    xml += ` <Worksheet ss:Name="${escXml(sheet.name)}">\n  <Table>\n`;
    xml += '   <Row ss:Height="22">\n';
    for(const h of sheet.headers){
      xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${escXml(h)}</Data></Cell>\n`;
    }
    xml += '   </Row>\n';
    for(const row of sheet.rows){
      xml += '   <Row>\n';
      for(const val of row){
        let isNum = typeof val === 'number' && !isNaN(val);
        let type = isNum ? 'Number' : 'String';
        xml += `    <Cell><Data ss:Type="${type}">${escXml(val)}</Data></Cell>\n`;
      }
      xml += '   </Row>\n';
    }
    xml += '  </Table>\n </Worksheet>\n';
  }
  xml += '</Workbook>';

  let blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Property_Manager_Backup_${dateStr}.xls`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }, 200);
  return xml;
}

function exportBackup(){
  const dateStr = new Date().toISOString().slice(0, 10);
  try {
    if(window.XLSX && XLSX.utils && XLSX.writeFile){
      const wb = XLSX.utils.book_new();

      // Properties Sheet
      const propRows = data.map(p => ({
        "ID": p.id || '',
        "Property Name": p.name || '',
        "Location": p.location || '',
        "Type": p.type || '',
        "BHK": p.bhk || '',
        "Area (yd²)": p.area || '',
        "Dimensions": p.dim || '',
        "Facing": p.facing || '',
        "Road Width": p.road || '',
        "Price (₹)": Number(p.price) || 0,
        "Price Category": p.priceCategory || getPropertyCategory(p.price),
        "Budget Slab": p.budgetSlab || getPropertyBudgetSlab(p.price),
        "Status": p.status || '',
        "Owner / Broker": p.owner || '',
        "Phone": p.phone || '',
        "Follow-up Date": p.follow || '',
        "Google Maps URL": p.map || '',
        "Video URL": p.video || '',
        "Notes": p.notes || '',
        "Favorite": p.favorite ? 'YES' : 'NO',
        "Photo / Image Data": p.photo || '',
        "Created Date": p.created || ''
      }));
      const wsProps = XLSX.utils.json_to_sheet(propRows);
      XLSX.utils.book_append_sheet(wb, wsProps, "Properties");

      // Upcoming Projects Sheet
      const upRows = upcomingData.map(p => ({
        "ID": p.id || '',
        "Project Name": p.name || '',
        "Developer / Builder": p.developer || '',
        "Location": p.location || '',
        "Project Type": p.type || '',
        "BHK / Config": p.bhk || '',
        "Area / Plot Size": p.area || '',
        "Starting Price (₹)": Number(p.price) || 0,
        "Max Price (₹)": Number(p.maxPrice) || '',
        "Price Category": p.priceCategory || getPriceCategory(p.price),
        "Budget Slab": p.budgetSlab || getBudgetSlab(p.price),
        "Project Status": p.status || '',
        "Launch Date": p.launchDate || '',
        "Possession Date": p.possessionDate || '',
        "Contact Person": p.owner || '',
        "Contact Phone": p.phone || '',
        "Google Maps URL": p.map || '',
        "Brochure / Website": p.brochure || '',
        "Video URL": p.video || '',
        "Notes / Description": p.notes || '',
        "Favorite": p.favorite ? 'YES' : 'NO',
        "Photo / Image Data": p.photo || '',
        "Created Date": p.created || ''
      }));
      const wsUp = XLSX.utils.json_to_sheet(upRows);
      XLSX.utils.book_append_sheet(wb, wsUp, "Upcoming Projects");

      // Favorites Sheet
      const favList = [
        ...data.filter(p => p.favorite).map(p => ({
          "Module": "Property",
          "ID": p.id || '',
          "Name / Project": p.name || '',
          "Location": p.location || '',
          "Type": p.type || '',
          "Price (₹)": Number(p.price) || 0,
          "Status": p.status || '',
          "Contact": p.owner || '',
          "Phone": p.phone || '',
          "Photo / Image Data": p.photo || ''
        })),
        ...upcomingData.filter(u => u.favorite).map(u => ({
          "Module": "Upcoming Project",
          "ID": u.id || '',
          "Name / Project": u.name || '',
          "Location": u.location || '',
          "Type": u.type || '',
          "Price (₹)": Number(u.price) || 0,
          "Status": u.status || '',
          "Contact": u.owner || '',
          "Phone": u.phone || '',
          "Photo / Image Data": u.photo || ''
        }))
      ];
      const wsFav = XLSX.utils.json_to_sheet(favList);
      XLSX.utils.book_append_sheet(wb, wsFav, "Favorites");

      // CRM Info Sheet
      const metaRows = [
        { "Parameter": "Application", "Value": "Property Manager Pro" },
        { "Parameter": "Version", "Value": "2.0" },
        { "Parameter": "Export Date", "Value": new Date().toISOString() },
        { "Parameter": "Total Properties", "Value": data.length },
        { "Parameter": "Total Upcoming Projects", "Value": upcomingData.length },
        { "Parameter": "Total Favorites", "Value": favList.length },
        { "Parameter": "Storage Engine", "Value": "IndexedDB" }
      ];
      const wsMeta = XLSX.utils.json_to_sheet(metaRows);
      XLSX.utils.book_append_sheet(wb, wsMeta, "CRM Info");

      XLSX.writeFile(wb, `Property_Manager_Backup_${dateStr}.xlsx`);
      toast(`Excel Backup exported successfully (.xlsx)`);
    } else {
      // Offline XML SpreadsheetML fallback
      exportSpreadsheetML(dateStr);
      toast(`Excel Backup exported successfully (.xls)`);
    }
  } catch(err) {
    console.error('Backup export error:', err);
    // JSON backup fallback
    const payload = {
      version: 2,
      exportDate: new Date().toISOString(),
      properties: data,
      upcoming: upcomingData
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Property_Manager_Backup_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Backup exported as JSON');
  }
}

function importData(){
  let i = document.createElement('input');
  i.type = 'file';
  i.accept = '.xlsx, .xls, .json';
  i.onchange = async () => {
    let file = i.files && i.files[0];
    if(!file) return;
    let fileName = file.name.toLowerCase();

    // 1. JSON FILE IMPORT
    if(fileName.endsWith('.json')){
      try {
        let text = await file.text();
        let x = JSON.parse(text);
        let importedProps = 0;
        let importedDirect = 0;
        let importedUpcoming = 0;

        if(Array.isArray(x)){
          data = x;
          importedProps = data.length;
          save();
          renderAll();
          addImportHistoryRecord({
            fileName: file.name,
            propertiesCount: importedProps,
            directPropertiesCount: 0,
            upcomingCount: 0,
            sourceType: 'JSON Backup',
            status: 'Successful'
          });
          toast('Properties backup imported successfully');
        } else if(x && (Array.isArray(x.properties) || Array.isArray(x.upcoming) || Array.isArray(x.directProperties) || Array.isArray(x.direct))){
          if(Array.isArray(x.properties)){
            data = x.properties;
            importedProps = data.length;
            save();
          }
          if(Array.isArray(x.upcoming)){
            upcomingData = x.upcoming;
            importedUpcoming = upcomingData.length;
            saveUpcoming();
          }
          if(Array.isArray(x.directProperties) || Array.isArray(x.direct)){
            directData = Array.isArray(x.directProperties) ? x.directProperties : x.direct;
            importedDirect = directData.length;
            saveDirect();
          }
          renderAll();
          addImportHistoryRecord({
            fileName: file.name,
            propertiesCount: importedProps,
            directPropertiesCount: importedDirect,
            upcomingCount: importedUpcoming,
            sourceType: 'JSON Backup',
            status: 'Successful'
          });
          toast('Full backup imported successfully');
        } else {
          throw new Error('Unrecognized JSON backup format');
        }
      } catch(e) {
        toast('Invalid JSON backup file');
      }
      return;
    }

    // 2. EXCEL FILE (.xlsx, .xls) IMPORT
    if(fileName.endsWith('.xlsx') || fileName.endsWith('.xls')){
      try {
        if(!window.XLSX){
          throw new Error('Excel parser library not loaded. Please connect to internet or use JSON backup.');
        }
        let buffer = await file.arrayBuffer();
        let wb = XLSX.read(buffer, { type: 'array' });
        
        let importedProps = 0;
        let importedUpcoming = 0;

        // Check for Properties sheet
        let propSheetName = wb.SheetNames.find(s => /^prop/i.test(s.trim()));
        if(!propSheetName && wb.SheetNames.length > 0){
          let testRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
          if(testRows.length && (testRows[0]['Property Name'] || testRows[0]['Road Width'] || testRows[0]['Dimensions'])){
            propSheetName = wb.SheetNames[0];
          }
        }

        if(propSheetName && wb.Sheets[propSheetName]){
          let rows = XLSX.utils.sheet_to_json(wb.Sheets[propSheetName]);
          if(rows && rows.length){
            data = rows.map((row, idx) => {
              let priceNum = Number(row['Price (₹)'] || row['Price'] || row['price']) || 0;
              let p = {
                id: String(row['ID'] || row['id'] || ('p_' + (idx + 1))),
                name: String(row['Property Name'] || row['Name'] || row['name'] || 'Unnamed Property'),
                location: String(row['Location'] || row['location'] || ''),
                type: String(row['Type'] || row['type'] || 'Plot'),
                bhk: String(row['BHK'] || row['bhk'] || ''),
                area: Number(row['Area (yd²)'] || row['Area'] || row['area']) || 0,
                dim: String(row['Dimensions'] || row['dim'] || ''),
                facing: String(row['Facing'] || row['facing'] || ''),
                road: String(row['Road Width'] || row['road'] || ''),
                price: priceNum,
                priceCategory: String(row['Price Category'] || getPropertyCategory(priceNum)),
                budgetSlab: String(row['Budget Slab'] || getPropertyBudgetSlab(priceNum)),
                status: String(row['Status'] || row['status'] || 'Available'),
                owner: String(row['Owner / Broker'] || row['Owner'] || row['owner'] || ''),
                phone: String(row['Phone'] || row['phone'] || ''),
                follow: String(row['Follow-up Date'] || row['follow'] || ''),
                map: String(row['Google Maps URL'] || row['map'] || ''),
                video: String(row['Video URL'] || row['video'] || ''),
                notes: String(row['Notes'] || row['notes'] || ''),
                favorite: String(row['Favorite'] || row['favorite']).toUpperCase() === 'YES' || row['favorite'] === true,
                photo: String(row['Photo / Image Data'] || row['Photo URL'] || row['Photo'] || row['photo'] || ''),
                created: String(row['Created Date'] || row['created'] || new Date().toISOString().slice(0, 10))
              };
              return p;
            });
            importedProps = data.length;
            save();
          }
        }

        // Check for Upcoming Projects sheet
        let upSheetName = wb.SheetNames.find(s => /upcom/i.test(s.trim()));
        if(!upSheetName && wb.SheetNames.length > 1){
          let testRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[1]]);
          if(testRows.length && (testRows[0]['Project Name'] || testRows[0]['Developer / Builder'] || testRows[0]['Starting Price (₹)'])){
            upSheetName = wb.SheetNames[1];
          }
        }

        if(upSheetName && wb.Sheets[upSheetName]){
          let rows = XLSX.utils.sheet_to_json(wb.Sheets[upSheetName]);
          if(rows && rows.length){
            upcomingData = rows.map((row, idx) => {
              let priceNum = Number(row['Starting Price (₹)'] || row['Price (₹)'] || row['Price'] || row['price']) || 0;
              let u = {
                id: String(row['ID'] || row['id'] || ('up_' + (idx + 1))),
                name: String(row['Project Name'] || row['Name'] || row['name'] || 'Unnamed Project'),
                developer: String(row['Developer / Builder'] || row['Developer'] || row['developer'] || ''),
                location: String(row['Location'] || row['location'] || ''),
                type: String(row['Project Type'] || row['Type'] || row['type'] || 'Apartment'),
                bhk: String(row['BHK / Config'] || row['BHK'] || row['bhk'] || ''),
                area: String(row['Area / Plot Size'] || row['Area'] || row['area'] || ''),
                price: priceNum,
                maxPrice: Number(row['Max Price (₹)'] || row['maxPrice']) || 0,
                priceCategory: String(row['Price Category'] || getPriceCategory(priceNum)),
                budgetSlab: String(row['Budget Slab'] || getBudgetSlab(priceNum)),
                status: String(row['Project Status'] || row['Status'] || row['status'] || 'Upcoming'),
                launchDate: String(row['Launch Date'] || row['launchDate'] || ''),
                possessionDate: String(row['Possession Date'] || row['possessionDate'] || ''),
                owner: String(row['Contact Person'] || row['Owner'] || row['owner'] || ''),
                phone: String(row['Contact Phone'] || row['Phone'] || row['phone'] || ''),
                map: String(row['Google Maps URL'] || row['map'] || ''),
                brochure: String(row['Brochure / Website'] || row['brochure'] || ''),
                video: String(row['Video URL'] || row['video'] || ''),
                notes: String(row['Notes / Description'] || row['Notes'] || row['notes'] || ''),
                favorite: String(row['Favorite'] || row['favorite']).toUpperCase() === 'YES' || row['favorite'] === true,
                photo: String(row['Photo / Image Data'] || row['Photo URL'] || row['Photo'] || row['photo'] || ''),
                created: String(row['Created Date'] || row['created'] || new Date().toISOString().slice(0, 10))
              };
              return u;
            });
            importedUpcoming = upcomingData.length;
            saveUpcoming();
          }
        }

        if(importedProps > 0 || importedUpcoming > 0){
          renderAll();
          addImportHistoryRecord({
            fileName: file.name,
            propertiesCount: importedProps,
            directPropertiesCount: 0,
            upcomingCount: importedUpcoming,
            sourceType: 'Excel Backup',
            status: 'Successful'
          });
          toast(`Excel restored: ${importedProps} Properties, ${importedUpcoming} Upcoming Projects`);
        } else {
          toast('No recognized property records found in Excel file');
        }
      } catch(err){
        console.error('Import error:', err);
        toast('Failed to parse Excel file: ' + (err.message || 'Unknown error'));
      }
      return;
    }

    toast('Please select a valid .xlsx, .xls or .json backup file');
  };
  i.click();
}

const exportJSON = exportBackup;
const importJSON = importData;

// RESTORE DEMO
function restoreDemo(){
  if(confirm('Restore the demo dataset? Current local changes will be replaced.')){
    data = initial.map((p,i)=>({...p,id:'p'+(i+1)}));
    upcomingData = initialUpcoming.map((p,i)=>({
      ...p,
      id:'up'+(i+1),
      priceCategory: getPriceCategory(p.price),
      budgetSlab: getBudgetSlab(p.price),
      favorite: p.favorite || false
    }));
    save();
    saveUpcoming();
    renderAll();
    toast('Demo data restored');
  }
}

// ==========================================================================
// MASTER SEARCH MODULE (Global Search across Properties & Upcoming Projects)
// ==========================================================================

function setMasterView(v){
  masterView = v;
  let cardBtn = document.getElementById('msCardViewBtn');
  let tableBtn = document.getElementById('msTableViewBtn');
  if(cardBtn) cardBtn.classList.toggle('active', v === 'card');
  if(tableBtn) tableBtn.classList.toggle('active', v === 'table');
  renderMasterSearch();
}

function fillMasterLocations(){
  if(typeof populateAllConfigDropdowns === 'function') populateAllConfigDropdowns();
}

function clearMasterSearchQuery(){
  let inp = document.getElementById('masterSearchInput');
  if(inp){
    inp.value = '';
    inp.focus();
  }
  let btn = document.getElementById('masterClearBtn');
  if(btn) btn.style.display = 'none';
  renderMasterSearch();
}

function clearMasterFilters(){
  let t = document.getElementById('masterFilterType');
  let l = document.getElementById('masterFilterLocation');
  let c = document.getElementById('masterFilterCategory');
  let s = document.getElementById('masterFilterStatus');
  let sb = document.getElementById('masterSortBy');
  if(t) t.value = '';
  if(l) l.value = '';
  if(c) c.value = '';
  if(s) s.value = '';
  if(sb) sb.value = 'relevance';
  renderMasterSearch();
  toast('Filters cleared');
}

function clearMasterAllSearch(){
  let inp = document.getElementById('masterSearchInput');
  if(inp) inp.value = '';
  let btn = document.getElementById('masterClearBtn');
  if(btn) btn.style.display = 'none';
  clearMasterFilters();
}

function getMasterSearchList(){
  let q = (document.getElementById('masterSearchInput')?.value || '').toLowerCase().trim();
  let typeFilter = document.getElementById('masterFilterType')?.value || '';
  let locFilter = document.getElementById('masterFilterLocation')?.value || '';
  let catFilter = document.getElementById('masterFilterCategory')?.value || '';
  let statusFilter = document.getElementById('masterFilterStatus')?.value || '';
  let sortBy = document.getElementById('masterSortBy')?.value || 'relevance';

  let items = [];

  // 1. Ingest Properties
  if(!typeFilter || typeFilter === 'property' || typeFilter === 'contact'){
    data.forEach(p => {
      let cat = getPropertyCategory(p.price);
      let searchCorpus = [
        p.name,
        p.location,
        p.type,
        p.bhk,
        p.owner,
        p.phone,
        p.notes,
        p.status,
        p.facing,
        p.road,
        p.area ? p.area + ' sqyds' : '',
        cat,
        p.budgetSlab,
        money(p.price),
        p.map,
        'property',
        'dehradun'
      ].filter(Boolean).join(' ').toLowerCase();

      items.push({
        id: p.id,
        source: 'property',
        sourceLabel: 'PROPERTY',
        name: p.name,
        developer: '',
        location: p.location,
        type: p.type || 'Property',
        bhk: p.bhk || '',
        area: p.area ? p.area + ' Sqyds' : '',
        price: p.price,
        maxPrice: null,
        priceFormatted: money(p.price),
        category: cat,
        status: p.status || 'Available',
        owner: p.owner || '',
        phone: p.phone || '',
        notes: p.notes || '',
        map: p.map || '',
        photo: p.photo || '',
        favorite: !!p.favorite,
        created: p.created || '',
        searchCorpus: searchCorpus
      });
    });
  }

  // 2. Ingest Direct Properties
  if(!typeFilter || typeFilter === 'direct' || typeFilter === 'contact'){
    (typeof directData !== 'undefined' ? directData : []).forEach(p => {
      let cat = p.priceCategory || getPropertyCategory(p.price);
      let searchCorpus = [
        p.name,
        p.location,
        p.type,
        p.bhk,
        p.owner,
        p.phone,
        p.notes,
        p.status,
        p.area,
        p.dim,
        p.facing,
        p.road,
        money(p.price),
        cat,
        p.budgetSlab || getPropertyBudgetSlab(p.price),
        p.follow,
        p.map,
        'direct',
        'direct property',
        'client property',
        'dehradun'
      ].filter(Boolean).join(' ').toLowerCase();

      items.push({
        id: p.id,
        source: 'direct',
        sourceLabel: 'DIRECT PROPERTY',
        name: p.name,
        developer: '',
        location: p.location,
        type: p.type || 'Property',
        bhk: p.bhk || '',
        area: p.area ? p.area + ' Sqyds' : '',
        price: p.price,
        maxPrice: null,
        priceFormatted: money(p.price),
        category: cat,
        status: p.status || 'Available',
        owner: p.owner || '',
        phone: p.phone || '',
        notes: p.notes || '',
        map: p.map || '',
        photo: p.photo || '',
        favorite: !!p.favorite,
        created: p.created || '',
        searchCorpus: searchCorpus
      });
    });
  }

  // 3. Ingest Upcoming Projects
  if(!typeFilter || typeFilter === 'project' || typeFilter === 'contact'){
    upcomingData.forEach(p => {
      let cat = p.priceCategory || 'Economical';
      let searchCorpus = [
        p.name,
        p.developer,
        p.location,
        p.type,
        p.bhk,
        p.owner,
        p.phone,
        p.notes,
        p.status,
        p.area,
        cat,
        p.budgetSlab,
        p.launchDate,
        p.possessionDate,
        moneyRange(p.price, p.maxPrice),
        p.map,
        'project',
        'upcoming project',
        'dehradun'
      ].filter(Boolean).join(' ').toLowerCase();

      items.push({
        id: p.id,
        source: 'project',
        sourceLabel: 'PROJECT',
        name: p.name,
        developer: p.developer || '',
        location: p.location,
        type: p.type || 'Project',
        bhk: p.bhk || '',
        area: p.area || '',
        price: p.price,
        maxPrice: p.maxPrice,
        priceFormatted: moneyRange(p.price, p.maxPrice),
        category: cat,
        status: p.status || 'Upcoming',
        owner: p.owner || '',
        phone: p.phone || '',
        notes: p.notes || '',
        map: p.map || '',
        photo: p.photo || '',
        favorite: !!p.favorite,
        created: p.created || '',
        searchCorpus: searchCorpus
      });
    });
  }

  // Filter: Contact / Owner only
  if(typeFilter === 'contact'){
    items = items.filter(it => (it.owner && it.owner.trim()) || (it.phone && it.phone.trim()));
  }

  // Filter: Location
  if(locFilter){
    items = items.filter(it => it.location === locFilter);
  }

  // Filter: Price Category
  if(catFilter){
    items = items.filter(it => it.category === catFilter);
  }

  // Filter: Status
  if(statusFilter){
    items = items.filter(it => it.status === statusFilter);
  }

  // Filter: Search Query (Multi-token, case-insensitive, partial matching)
  if(q){
    let tokens = q.split(/\s+/).filter(Boolean);
    items = items.filter(it => tokens.every(token => it.searchCorpus.includes(token)));
  }

  // Sort Results
  items.sort((x, y) => {
    if(sortBy === 'az') return x.name.localeCompare(y.name);
    if(sortBy === 'priceLow') return (Number(x.price)||0) - (Number(y.price)||0);
    if(sortBy === 'priceHigh') return (Number(y.price)||0) - (Number(x.price)||0);
    if(sortBy === 'old' || sortBy === 'oldest') return String(x.created).localeCompare(String(y.created));
    return String(y.created).localeCompare(String(x.created));
  });

  return items;
}

function masterCard(item){
  let sourceBadge = item.source === 'direct'
    ? `<span class="badge badge-source-direct">🔑 DIRECT PROPERTY</span>`
    : item.source === 'project'
    ? `<span class="badge badge-source-up">🏗️ PROJECT</span>`
    : `<span class="badge badge-source-prop">🏠 PROPERTY</span>`;
  let statusClass = (item.status||'').toLowerCase().replace(/\s+/g, '-');
  let viewFunc = item.source === 'project' ? `viewProject('${item.id}')` : `view('${item.id}')`;
  let favToggleFunc = item.source === 'project' ? `toggleProjectFav('${item.id}')` : `toggleFav('${item.id}')`;
  let isFav = !!item.favorite;
  let hasImg = item.photo && item.photo.trim();

  // Location display with City
  let locDisplay = item.location || '';
  if(locDisplay && !locDisplay.toLowerCase().includes('dehradun')){
    locDisplay += ', Dehradun';
  }

  // Meta specifications
  let metaTags = [];
  if(item.type) metaTags.push(`<b>${esc(item.type)}</b>`);
  if(item.bhk) metaTags.push(esc(item.bhk));
  if(item.area) metaTags.push(esc(item.area));
  if(item.developer) metaTags.push('By ' + esc(item.developer));

  // Contact line
  let contactHtml = '';
  if(item.owner || item.phone){
    contactHtml = `<div class="ms-contact-chip">
      <span>👤 ${esc(item.owner || 'Contact')}</span>
      ${item.phone ? `<a href="tel:${esc(item.phone)}" style="color:var(--primary);text-decoration:none;font-weight:600">📞 ${esc(item.phone)}</a>` : ''}
    </div>`;
  }

  return `<article class="prop-card master-result-card">
    ${hasImg ? `<div class="prop-cover" onclick="openLightbox('${esc(item.photo)}', '${esc(item.name)}')" title="Click to view full image"><img src="${esc(item.photo)}" alt="${esc(item.name)}" onerror="this.parentElement.style.display='none'"></div>` : ''}
    <div class="prop-body">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          ${sourceBadge}
          <span class="badge ${statusClass}">${esc(item.status)}</span>
        </div>
        <button class="mini" onclick="${favToggleFunc}" title="Toggle favorite">${isFav ? '★' : '☆'}</button>
      </div>
      <h3 style="margin:8px 0 3px;font-size:15px;line-height:1.3">${esc(item.name)}</h3>
      <div class="ms-loc-line" style="margin-bottom:4px">📍 ${esc(locDisplay)}</div>
      <div class="muted" style="font-size:12px;line-height:1.4">${metaTags.join(' • ')}</div>
      ${contactHtml}
      <div class="prop-price" style="margin-top:8px">${item.priceFormatted}</div>
      <div class="prop-actions" style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
        <button class="mini primary" onclick="${viewFunc}">👁️ View</button>
        ${item.phone ? `<a class="mini" href="tel:${esc(item.phone)}">📞 Call</a>` : ''}
        ${item.phone ? `<button class="mini" onclick="window.open('https://wa.me/91${esc(item.phone.replace(/\\D/g,''))}')">💬 WhatsApp</button>` : ''}
        ${item.map ? `<button class="mini" onclick="window.open('${esc(item.map)}')">📍 Maps</button>` : ''}
      </div>
    </div>
  </article>`;
}

function masterRow(item){
  let sourceBadge = item.source === 'direct'
    ? `<span class="badge badge-source-direct">🔑 DIRECT PROPERTY</span>`
    : item.source === 'project'
    ? `<span class="badge badge-source-up">🏗️ PROJECT</span>`
    : `<span class="badge badge-source-prop">🏠 PROPERTY</span>`;
  let statusClass = (item.status||'').toLowerCase().replace(/\s+/g, '-');
  let viewFunc = item.source === 'project' ? `viewProject('${item.id}')` : `view('${item.id}')`;
  let locDisplay = item.location;
  if(!locDisplay.toLowerCase().includes('dehradun')) locDisplay += ', Dehradun';

  return `<tr>
    <td>${sourceBadge}</td>
    <td>
      <div class="property-name">${esc(item.name)}</div>
      <div class="muted">${esc(item.type)} ${item.bhk ? '• '+esc(item.bhk) : ''} ${item.developer ? '• By '+esc(item.developer) : ''}</div>
    </td>
    <td><b>${esc(locDisplay)}</b></td>
    <td>
      <div>${esc(item.owner || '—')}</div>
      ${item.phone ? `<a href="tel:${esc(item.phone)}" style="font-size:12px">${esc(item.phone)}</a>` : ''}
    </td>
    <td><b>${item.priceFormatted}</b></td>
    <td><span class="badge ${statusClass}">${esc(item.status)}</span></td>
    <td>
      <div class="actions">
        <button class="mini primary" onclick="${viewFunc}">View</button>
      </div>
    </td>
  </tr>`;
}

function renderMasterSearch(){
  let resultsContainer = document.getElementById('masterSearchResults');
  if(!resultsContainer) return;

  fillMasterLocations();

  let inp = document.getElementById('masterSearchInput');
  let q = (inp?.value || '').trim();
  let clearBtn = document.getElementById('masterClearBtn');
  if(clearBtn) clearBtn.style.display = q ? 'block' : 'none';

  let list = getMasterSearchList();

  // Results count badge
  let countEl = document.getElementById('masterSearchResultCount');
  if(countEl){
    countEl.textContent = `${list.length} result${list.length !== 1 ? 's' : ''} found across Properties & Projects`;
  }

  // Summary bar & active filter chips
  let statsLine = document.getElementById('masterStatsLine');
  if(statsLine){
    statsLine.innerHTML = `<b>Filters | ${list.length} Results</b>`;
  }

  let chipsContainer = document.getElementById('masterActiveFilterChips');
  if(chipsContainer){
    let chips = [];
    let t = document.getElementById('masterFilterType')?.value;
    let l = document.getElementById('masterFilterLocation')?.value;
    let c = document.getElementById('masterFilterCategory')?.value;
    let s = document.getElementById('masterFilterStatus')?.value;
    if(t) chips.push(`<span class="ms-filter-chip">Type: ${esc(t)}</span>`);
    if(l) chips.push(`<span class="ms-filter-chip">Location: ${esc(l)}</span>`);
    if(c) chips.push(`<span class="ms-filter-chip">Category: ${esc(c)}</span>`);
    if(s) chips.push(`<span class="ms-filter-chip">Status: ${esc(s)}</span>`);
    chipsContainer.innerHTML = chips.join('');
  }

  // Empty state handling
  if(!list.length){
    let hasFilterOrQuery = q || document.getElementById('masterFilterType')?.value || document.getElementById('masterFilterLocation')?.value || document.getElementById('masterFilterCategory')?.value || document.getElementById('masterFilterStatus')?.value;
    resultsContainer.innerHTML = `<div class="empty">
      <div style="font-size:32px;margin-bottom:8px">🔍</div>
      <b style="font-size:16px">No results found</b>
      <div style="color:var(--muted);margin-top:6px;max-width:340px;margin-left:auto;margin-right:auto">
        ${q ? `We couldn't find any properties or projects matching "<b>${esc(q)}</b>".` : 'No records match your selected filters.'}
      </div>
      <div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        ${q ? `<button class="btn" onclick="clearMasterSearchQuery()">Clear Search Query</button>` : ''}
        ${hasFilterOrQuery ? `<button class="btn primary" onclick="clearMasterAllSearch()">Clear All Search & Filters</button>` : ''}
      </div>
    </div>`;
    return;
  }

  if(masterView === 'table'){
    resultsContainer.innerHTML = `<div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Name / Details</th>
            <th>Location</th>
            <th>Owner / Contact</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(masterRow).join('')}
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <span>Showing ${list.length} records</span>
      <span>Unified Master Search • LocalStorage / IndexedDB</span>
    </div>`;
  } else {
    resultsContainer.innerHTML = '<div class="grid">' + list.map(masterCard).join('') + '</div>';
  }
}

// ==================== SETTINGS: CATEGORIES & FILTERS MODULE ====================

const settingsTabMeta = {
  types: {
    title: 'Types & Sub-categories',
    addTitle: 'Add Type',
    editTitle: 'Edit Type',
    desc: 'Property and project types used across inventory, forms, and search filters.',
    nameLabel: 'Type Name *',
    namePlaceholder: 'e.g. Villa, Duplex, Penthouse, Farmhouse...'
  },
  locations: {
    title: 'Locations',
    addTitle: 'Add Location',
    editTitle: 'Edit Location',
    desc: 'Prime areas, localities, and cities for properties and upcoming projects.',
    nameLabel: 'Location Name *',
    namePlaceholder: 'e.g. Rajpur, Jakhan, Sahastradhara Road...'
  },
  statuses: {
    title: 'Inventory Statuses',
    addTitle: 'Add Status',
    editTitle: 'Edit Status',
    desc: 'Inventory lifecycle states (Available, Hold, Sold, Pre-Launch, Ready) with badge styles.',
    nameLabel: 'Status Name *',
    namePlaceholder: 'e.g. Available, Hold, Under Negotiation, Ready...'
  },
  priceCategories: {
    title: 'Price Categories',
    addTitle: 'Add Price Category',
    editTitle: 'Edit Price Category',
    desc: 'Price brackets and categories (Below ₹1 Cr, Economical, Mid-Premium, Luxury) with min/max amounts.',
    nameLabel: 'Category Label *',
    namePlaceholder: 'e.g. Economical, Mid-Premium, Luxury, Ultra Luxury...'
  },
  budgetSlabs: {
    title: 'Budget Slabs',
    addTitle: 'Add Budget Slab',
    editTitle: 'Edit Budget Slab',
    desc: 'Budget slabs used for quick financial filtering across properties and projects.',
    nameLabel: 'Budget Slab Label *',
    namePlaceholder: 'e.g. ₹1 Cr, ₹2 Cr, ₹5 Cr+...'
  },
  sortOptions: {
    title: 'Sort Options',
    addTitle: 'Add Sort Option',
    editTitle: 'Edit Sort Option',
    desc: 'Sorting criteria and order options available in property, project, and search lists.',
    nameLabel: 'Sort Option Label *',
    namePlaceholder: 'e.g. Price: Low to High, Newest First...'
  },
  customFilters: {
    title: 'Custom Filters',
    addTitle: 'Add Custom Filter',
    editTitle: 'Edit Custom Filter',
    desc: 'Custom filter dimensions (Facing, BHK Configuration, Road Width, Furnishing) and their options.',
    nameLabel: 'Filter Name *',
    namePlaceholder: 'e.g. Facing, Road Width, Furnishing...'
  }
};

let currentSettingsTab = 'types';

function centerActiveSettingsTab(smooth = true){
  const bar = document.querySelector('.settings-tabs-bar');
  if(!bar) return;
  const activeBtn = bar.querySelector('.settings-tab-btn.active');
  if(!activeBtn) return;

  const barWidth = bar.clientWidth;
  const btnLeft = activeBtn.offsetLeft;
  const btnWidth = activeBtn.offsetWidth;
  const scrollTarget = btnLeft - (barWidth - btnWidth) / 2;

  bar.scrollTo({
    left: Math.max(0, scrollTarget),
    behavior: smooth ? 'smooth' : 'auto'
  });
}

window.addEventListener('resize', () => {
  const sp = document.getElementById('settingsPage');
  if(sp && sp.style.display !== 'none'){
    centerActiveSettingsTab(false);
  }
});

function setSettingsTab(tabName){
  currentSettingsTab = tabName;
  document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-cfg-tab') === tabName);
  });
  renderSettingsPage();
  requestAnimationFrame(() => centerActiveSettingsTab(true));
}

function getAppliesBadge(appliesTo){
  if(appliesTo === 'property') return '<span class="badge-applies property">🏠 Property Only</span>';
  if(appliesTo === 'project') return '<span class="badge-applies project">🏗️ Project Only</span>';
  return '<span class="badge-applies both">🌐 Both</span>';
}

function renderSettingsItem(item, idx, total, tab){
  let appliesBadge = getAppliesBadge(item.appliesTo);
  let exampleBadge = item.isExample ? '<span class="badge-example">Example — You can edit or delete this</span>' : '';

  let detailsHtml = '';
  if(tab === 'types'){
    if(item.subcategories && item.subcategories.length){
      detailsHtml = `<div class="subcat-chips">
        ${item.subcategories.map(s => `<span class="subcat-chip">${esc(s)}</span>`).join('')}
      </div>`;
    }
  } else if(tab === 'statuses'){
    detailsHtml = `<div style="margin-top:4px">
      <span class="badge ${esc(item.badgeClass || 'available')}">${esc(item.name)}</span>
    </div>`;
  } else if(tab === 'priceCategories' || tab === 'budgetSlabs'){
    let minP = item.minPrice != null ? item.minPrice : 0;
    let maxP = item.maxPrice;
    let rangeStr = '';
    if(maxP == null || maxP === '' || maxP === Infinity){
      rangeStr = `Range: ${money(minP)}+`;
    } else {
      rangeStr = `Range: ${money(minP)} – ${money(maxP)}`;
    }
    detailsHtml = `<div class="config-range-text">${rangeStr}</div>`;
  } else if(tab === 'sortOptions'){
    let behaviorMap = {
      newest: 'Newest First (Creation Date)',
      new: 'Newest First (Creation Date)',
      oldest: 'Oldest First (Creation Date)',
      old: 'Oldest First (Creation Date)',
      priceLow: 'Price: Low to High',
      priceHigh: 'Price: High to Low',
      az: 'Name: A to Z'
    };
    detailsHtml = `<div class="config-range-text">Sort logic: ${esc(behaviorMap[item.value] || item.value || 'Custom')}</div>`;
  } else if(tab === 'customFilters'){
    if(item.options && item.options.length){
      detailsHtml = `<div class="subcat-chips">
        ${item.options.map(o => `<span class="subcat-chip">${esc(o)}</span>`).join('')}
      </div>`;
    }
  }

  return `
    <div class="config-item-card ${item.enabled ? '' : 'config-item-disabled'}">
      <div class="config-item-left">
        <div class="config-reorder-btns">
          <button type="button" class="config-reorder-btn" ${idx === 0 ? 'disabled' : ''} onclick="reorderConfigItem('${item.id}', -1)" title="Move up">▲</button>
          <button type="button" class="config-reorder-btn" ${idx === total - 1 ? 'disabled' : ''} onclick="reorderConfigItem('${item.id}', 1)" title="Move down">▼</button>
        </div>
        <div>
          <div class="config-item-title">
            <span>${esc(item.name)}</span>
            ${appliesBadge}
            ${exampleBadge}
            ${!item.enabled ? '<span class="badge-disabled">Disabled</span>' : ''}
          </div>
          ${detailsHtml}
        </div>
      </div>
      <div class="config-item-right">
        <button type="button" class="config-toggle-btn ${item.enabled ? 'active' : 'inactive'}" onclick="toggleConfigItem('${item.id}')" title="${item.enabled ? 'Click to disable' : 'Click to enable'}">
          ${item.enabled ? '✓ Enabled' : '✕ Disabled'}
        </button>
        <button type="button" class="btn" style="padding:6px 12px;font-size:12px" onclick="openConfigModal('edit', '${item.id}')">✏️ Edit</button>
        <button type="button" class="btn" style="padding:6px 12px;font-size:12px;color:var(--danger)" onclick="deleteConfigItem('${item.id}')" title="Delete entry">🗑️</button>
      </div>
    </div>
  `;
}

function renderSettingsPage(){
  let tab = currentSettingsTab;
  let meta = settingsTabMeta[tab] || {
    title: 'Categories & Filters',
    desc: 'Centrally configure categories and filters.',
    nameLabel: 'Name *',
    namePlaceholder: 'Enter name...'
  };

  let descElem = document.getElementById('settingsTabDesc');
  let countElem = document.getElementById('settingsTabCount');
  let list = appConfig[tab] || [];

  if(descElem) descElem.textContent = meta.desc;
  if(countElem) countElem.textContent = `${list.length} ${list.length === 1 ? 'entry' : 'entries'}`;

  let container = document.getElementById('settingsItemsContainer');
  if(!container) return;

  if(!list.length){
    container.innerHTML = `
      <div class="empty" style="padding:40px 20px;text-align:center">
        <div style="font-size:36px;margin-bottom:8px">⚙️</div>
        <b style="font-size:16px">No entries found</b>
        <div style="color:var(--muted);margin-top:6px;max-width:360px;margin-left:auto;margin-right:auto">
          You have no entries in this category yet. Click below to add your first entry.
        </div>
        <div style="margin-top:14px">
          <button type="button" class="btn primary" onclick="openConfigModal()">＋ Add New Entry</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((item, idx) => renderSettingsItem(item, idx, list.length, tab)).join('');
}

function openConfigModal(mode = 'add', itemId = null){
  let tab = currentSettingsTab;
  let meta = settingsTabMeta[tab] || {
    nameLabel: 'Name / Label *',
    namePlaceholder: 'Enter name...'
  };

  let tabInput = document.getElementById('cfgItemTab');
  let idInput = document.getElementById('cfgItemId');
  let nameLabel = document.getElementById('cfgNameLabel');
  let nameInput = document.getElementById('cfgName');

  if(tabInput) tabInput.value = tab;
  if(idInput) idInput.value = itemId || '';
  if(nameLabel) nameLabel.textContent = meta.nameLabel;
  if(nameInput) nameInput.placeholder = meta.namePlaceholder;

  let subcatGroup = document.getElementById('cfgSubcategoriesGroup');
  let badgeGroup = document.getElementById('cfgStatusBadgeGroup');
  let minPriceGroup = document.getElementById('cfgMinPriceGroup');
  let maxPriceGroup = document.getElementById('cfgMaxPriceGroup');
  let sortValGroup = document.getElementById('cfgSortValGroup');
  let filterOptionsGroup = document.getElementById('cfgFilterOptionsGroup');

  if(subcatGroup) subcatGroup.style.display = (tab === 'types') ? '' : 'none';
  if(badgeGroup) badgeGroup.style.display = (tab === 'statuses') ? '' : 'none';
  if(minPriceGroup) minPriceGroup.style.display = (tab === 'priceCategories' || tab === 'budgetSlabs') ? '' : 'none';
  if(maxPriceGroup) maxPriceGroup.style.display = (tab === 'priceCategories' || tab === 'budgetSlabs') ? '' : 'none';
  if(sortValGroup) sortValGroup.style.display = (tab === 'sortOptions') ? '' : 'none';
  if(filterOptionsGroup) filterOptionsGroup.style.display = (tab === 'customFilters') ? '' : 'none';

  let titleElem = document.getElementById('configModalTitle');

  if(mode === 'edit' && itemId){
    let item = (appConfig[tab] || []).find(x => x.id === itemId);
    if(!item) return;

    if(titleElem) titleElem.textContent = meta.editTitle || ('Edit ' + meta.nameLabel.replace('*', '').trim());
    if(nameInput) nameInput.value = item.name || '';
    let appliesToSel = document.getElementById('cfgAppliesTo');
    if(appliesToSel) appliesToSel.value = item.appliesTo || 'both';
    let enabledBox = document.getElementById('cfgEnabled');
    if(enabledBox) enabledBox.checked = item.enabled !== false;

    if(tab === 'types'){
      let subInp = document.getElementById('cfgSubcategories');
      if(subInp) subInp.value = Array.isArray(item.subcategories) ? item.subcategories.join(', ') : '';
    } else if(tab === 'statuses'){
      let badgeSel = document.getElementById('cfgBadgeClass');
      if(badgeSel) badgeSel.value = item.badgeClass || 'available';
    } else if(tab === 'priceCategories' || tab === 'budgetSlabs'){
      let minInp = document.getElementById('cfgMinPrice');
      let maxInp = document.getElementById('cfgMaxPrice');
      if(minInp) minInp.value = item.minPrice != null ? item.minPrice : '';
      if(maxInp) maxInp.value = (item.maxPrice != null && item.maxPrice !== Infinity) ? item.maxPrice : '';
    } else if(tab === 'sortOptions'){
      let sortSel = document.getElementById('cfgSortVal');
      if(sortSel) sortSel.value = item.value || 'newest';
    } else if(tab === 'customFilters'){
      let optInp = document.getElementById('cfgFilterOptions');
      if(optInp) optInp.value = Array.isArray(item.options) ? item.options.join(', ') : '';
    }
  } else {
    if(titleElem) titleElem.textContent = meta.addTitle || ('Add ' + meta.nameLabel.replace('*', '').trim());
    if(nameInput) nameInput.value = '';
    let appliesToSel = document.getElementById('cfgAppliesTo');
    if(appliesToSel) appliesToSel.value = 'both';
    let enabledBox = document.getElementById('cfgEnabled');
    if(enabledBox) enabledBox.checked = true;

    if(tab === 'types'){
      let subInp = document.getElementById('cfgSubcategories');
      if(subInp) subInp.value = '';
    } else if(tab === 'statuses'){
      let badgeSel = document.getElementById('cfgBadgeClass');
      if(badgeSel) badgeSel.value = 'available';
    } else if(tab === 'priceCategories' || tab === 'budgetSlabs'){
      let minInp = document.getElementById('cfgMinPrice');
      let maxInp = document.getElementById('cfgMaxPrice');
      if(minInp) minInp.value = '';
      if(maxInp) maxInp.value = '';
    } else if(tab === 'sortOptions'){
      let sortSel = document.getElementById('cfgSortVal');
      if(sortSel) sortSel.value = 'newest';
    } else if(tab === 'customFilters'){
      let optInp = document.getElementById('cfgFilterOptions');
      if(optInp) optInp.value = '';
    }
  }

  document.getElementById('configItemModal')?.classList.add('show');
  setTimeout(() => document.getElementById('cfgName')?.focus(), 50);
}

function saveConfigItem(){
  let tab = document.getElementById('cfgItemTab')?.value || currentSettingsTab;
  let id = document.getElementById('cfgItemId')?.value;
  let name = (document.getElementById('cfgName')?.value || '').trim();
  let appliesTo = document.getElementById('cfgAppliesTo')?.value || 'both';
  let enabled = document.getElementById('cfgEnabled') ? document.getElementById('cfgEnabled').checked : true;

  if(!name){
    toast('Please enter a name or label');
    document.getElementById('cfgName')?.focus();
    return;
  }

  if(!appConfig[tab]) appConfig[tab] = [];

  let itemData = {
    name,
    appliesTo,
    enabled,
    isExample: false // Any user-created or edited entry becomes normal data
  };

  if(tab === 'types'){
    let subStr = (document.getElementById('cfgSubcategories')?.value || '').trim();
    itemData.subcategories = subStr ? subStr.split(',').map(s=>s.trim()).filter(Boolean) : [];
  } else if(tab === 'statuses'){
    itemData.badgeClass = document.getElementById('cfgBadgeClass')?.value || 'available';
  } else if(tab === 'priceCategories' || tab === 'budgetSlabs'){
    let minP = document.getElementById('cfgMinPrice')?.value;
    let maxP = document.getElementById('cfgMaxPrice')?.value;
    itemData.minPrice = (minP !== '' && minP != null) ? Number(minP) : 0;
    itemData.maxPrice = (maxP !== '' && maxP != null) ? Number(maxP) : Infinity;
  } else if(tab === 'sortOptions'){
    itemData.value = document.getElementById('cfgSortVal')?.value || 'newest';
  } else if(tab === 'customFilters'){
    let optStr = (document.getElementById('cfgFilterOptions')?.value || '').trim();
    itemData.options = optStr ? optStr.split(',').map(s=>s.trim()).filter(Boolean) : [];
  }

  if(id){
    let idx = appConfig[tab].findIndex(x => x.id === id);
    if(idx !== -1){
      appConfig[tab][idx] = { ...appConfig[tab][idx], ...itemData, id };
    }
  } else {
    itemData.id = tab.slice(0, 4) + '_' + Date.now();
    appConfig[tab].push(itemData);
  }

  if(!Array.isArray(appConfig.deletedIds)) appConfig.deletedIds = [];
  if(id && appConfig.deletedIds.includes(id)){
    appConfig.deletedIds = appConfig.deletedIds.filter(x => x !== id);
  }
  let normName = name.toLowerCase();
  if(appConfig.deletedIds.includes(normName)){
    appConfig.deletedIds = appConfig.deletedIds.filter(x => x !== normName);
  }

  saveAppConfig(appConfig);
  closeModal('configItemModal');
  renderSettingsPage();
  populateAllConfigDropdowns();
  toast(id ? 'Entry updated successfully' : 'New entry created successfully');
}

function deleteConfigItem(itemId){
  let tab = currentSettingsTab;
  let item = (appConfig[tab] || []).find(x => x.id === itemId);
  let itemName = item ? item.name : 'this entry';
  if(!confirm(`Are you sure you want to delete "${itemName}"?`)){
    return;
  }
  if(!Array.isArray(appConfig.deletedIds)){
    appConfig.deletedIds = [];
  }
  if(itemId && !appConfig.deletedIds.includes(itemId)){
    appConfig.deletedIds.push(itemId);
  }
  if(item && item.name){
    let norm = String(item.name).trim().toLowerCase();
    if(!appConfig.deletedIds.includes(norm)){
      appConfig.deletedIds.push(norm);
    }
  }
  appConfig[tab] = (appConfig[tab] || []).filter(x => x.id !== itemId);
  saveAppConfig(appConfig);
  renderSettingsPage();
  populateAllConfigDropdowns();
  toast(`"${itemName}" deleted`);
}

function toggleConfigItem(itemId){
  let tab = currentSettingsTab;
  let item = (appConfig[tab] || []).find(x => x.id === itemId);
  if(!item) return;
  item.enabled = !item.enabled;
  saveAppConfig(appConfig);
  renderSettingsPage();
  populateAllConfigDropdowns();
  toast(item.enabled ? `"${item.name}" enabled` : `"${item.name}" disabled`);
}

function reorderConfigItem(itemId, direction){
  let tab = currentSettingsTab;
  let list = appConfig[tab] || [];
  let idx = list.findIndex(x => x.id === itemId);
  if(idx === -1) return;
  let targetIdx = idx + direction;
  if(targetIdx < 0 || targetIdx >= list.length) return;
  let temp = list[idx];
  list[idx] = list[targetIdx];
  list[targetIdx] = temp;
  saveAppConfig(appConfig);
  renderSettingsPage();
  populateAllConfigDropdowns();
}

// CENTRAL DROPDOWN POPULATOR FOR ALL APP PAGES
function populateAllConfigDropdowns(){
  let cfg = appConfig || loadAppConfig();

  function updateSelect(id, optionsHtml, preferredVal){
    let sel = document.getElementById(id);
    if(!sel) return;
    let curVal = sel.value;
    sel.innerHTML = optionsHtml;
    let opts = sel.options ? Array.from(sel.options) : [];
    if(curVal && opts.some(o => o.value === curVal)){
      sel.value = curVal;
    } else if(preferredVal !== undefined && opts.some(o => o.value === preferredVal)){
      sel.value = preferredVal;
    }
  }

  let propList = (typeof data !== 'undefined' && Array.isArray(data)) ? data : [];
  let directList = (typeof directData !== 'undefined' && Array.isArray(directData)) ? directData : [];
  let upList = (typeof upcomingData !== 'undefined' && Array.isArray(upcomingData)) ? upcomingData : [];

  // 1. Locations
  let enabledLocs = (cfg.locations || []).filter(x => x.enabled);
  let disabledLocNames = new Set((cfg.locations || []).filter(x => !x.enabled).map(x => String(x.name || '').trim().toLowerCase()));

  let extraPropLocs = propList.map(p => p.location).filter(Boolean).filter(loc => !disabledLocNames.has(String(loc).trim().toLowerCase()));
  let extraDirectLocs = directList.map(p => p.location).filter(Boolean).filter(loc => !disabledLocNames.has(String(loc).trim().toLowerCase()));
  let extraUpLocs = upList.map(u => u.location).filter(Boolean).filter(loc => !disabledLocNames.has(String(loc).trim().toLowerCase()));

  let propLocs = [...new Set([
    ...enabledLocs.filter(x => x.appliesTo !== 'project').map(x => x.name),
    ...extraPropLocs
  ])].sort();

  let directLocs = [...new Set([
    ...enabledLocs.filter(x => x.appliesTo !== 'project').map(x => x.name),
    ...extraDirectLocs
  ])].sort();

  let upLocs = [...new Set([
    ...enabledLocs.filter(x => x.appliesTo !== 'property').map(x => x.name),
    ...extraUpLocs
  ])].sort();

  let masterLocs = [...new Set([
    ...enabledLocs.map(x => x.name),
    ...extraPropLocs,
    ...extraDirectLocs,
    ...extraUpLocs
  ])].sort();

  updateSelect('filterLocation', '<option value="">All locations</option>' + propLocs.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('directFilterLocation', '<option value="">All locations</option>' + directLocs.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('upFilterLocation', '<option value="">All locations</option>' + upLocs.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('masterFilterLocation', '<option value="">All Locations / Cities</option>' + masterLocs.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));

  let datalistEl = document.getElementById('configLocationsList');
  if(datalistEl){
    datalistEl.innerHTML = masterLocs.map(x => `<option value="${esc(x)}">`).join('');
  }

  // 2. Types
  let enabledTypes = (cfg.types || []).filter(x => x.enabled);
  let propTypes = enabledTypes.filter(x => x.appliesTo !== 'project').map(x => x.name);
  let upTypes = enabledTypes.filter(x => x.appliesTo !== 'property').map(x => x.name);
  let allTypes = enabledTypes.map(x => x.name);

  updateSelect('filterType', '<option value="">All types</option>' + propTypes.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('directFilterType', '<option value="">All types</option>' + propTypes.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('upFilterType', '<option value="">All types</option>' + upTypes.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('masterFilterType', '<option value="">All Types</option>' + allTypes.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));

  if(propTypes.length){
    updateSelect('fType', propTypes.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  }
  if(upTypes.length){
    updateSelect('pType', upTypes.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  }

  // 3. Statuses
  let enabledStatuses = (cfg.statuses || []).filter(x => x.enabled);
  let propStatuses = enabledStatuses.filter(x => x.appliesTo !== 'project').map(x => x.name);
  let upStatuses = enabledStatuses.filter(x => x.appliesTo !== 'property').map(x => x.name);
  let allStatuses = enabledStatuses.map(x => x.name);

  updateSelect('filterStatus', '<option value="">All status</option>' + propStatuses.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('directFilterStatus', '<option value="">All status</option>' + propStatuses.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('upFilterStatus', '<option value="">All status</option>' + upStatuses.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('masterFilterStatus', '<option value="">All Statuses</option>' + allStatuses.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));

  if(propStatuses.length){
    updateSelect('fStatus', propStatuses.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  }
  if(upStatuses.length){
    updateSelect('pStatus', upStatuses.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  }

  // 4. Price Categories
  let enabledCats = (cfg.priceCategories || []).filter(x => x.enabled);
  let propCats = enabledCats.filter(x => x.appliesTo !== 'project').map(x => x.name);
  let upCats = enabledCats.filter(x => x.appliesTo !== 'property').map(x => x.name);
  let allCats = enabledCats.map(x => x.name);

  updateSelect('filterCategory', '<option value="">All price categories</option>' + propCats.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('directFilterCategory', '<option value="">All price categories</option>' + propCats.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('upFilterCategory', '<option value="">All price categories</option>' + upCats.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('masterFilterCategory', '<option value="">All Price Categories</option>' + allCats.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));

  // 5. Budget Slabs
  let enabledSlabs = (cfg.budgetSlabs || []).filter(x => x.enabled);
  let propSlabs = enabledSlabs.filter(x => x.appliesTo !== 'project').map(x => x.name);
  let upSlabs = enabledSlabs.filter(x => x.appliesTo !== 'property').map(x => x.name);

  updateSelect('filterSlab', '<option value="">All budget slabs</option>' + propSlabs.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('directFilterSlab', '<option value="">All budget slabs</option>' + propSlabs.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));
  updateSelect('upFilterSlab', '<option value="">All budget slabs</option>' + upSlabs.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join(''));

  // 6. Sort Options
  let enabledSorts = (cfg.sortOptions || []).filter(x => x.enabled);
  let propSorts = enabledSorts.filter(x => x.appliesTo !== 'project');
  let upSorts = enabledSorts.filter(x => x.appliesTo !== 'property');
  let allSorts = enabledSorts;

  if(propSorts.length){
    updateSelect('sortBy', propSorts.map(x => `<option value="${esc(x.value)}">${esc(x.name)}</option>`).join(''), propSorts[0].value);
    updateSelect('directSortBy', propSorts.map(x => `<option value="${esc(x.value)}">${esc(x.name)}</option>`).join(''), propSorts[0].value);
  }
  if(upSorts.length){
    updateSelect('upSortBy', upSorts.map(x => `<option value="${esc(x.value)}">${esc(x.name)}</option>`).join(''), upSorts[0].value);
  }
  if(allSorts.length){
    updateSelect('masterSortBy', '<option value="relevance">Sort: Relevance / Newest</option>' + allSorts.map(x => `<option value="${esc(x.value)}">${esc(x.name)}</option>`).join(''), 'relevance');
  }
}

// GLOBAL MODAL & RENDER CONTROLS
function closeModal(id){document.getElementById(id)?.classList.remove('show')}
document.querySelectorAll('.modal-bg').forEach(x=>x.addEventListener('click',e=>{if(e.target===x && x.id!=='profileSetupModal')x.classList.remove('show')}));

function renderAll(){
  populateAllConfigDropdowns();
  renderDashboard();
  if(document.getElementById('propertiesPage').style.display!=='none') renderProperties();
  if(document.getElementById('directPropertyPage') && document.getElementById('directPropertyPage').style.display!=='none') renderDirectProperties();
  if(document.getElementById('upcomingPage').style.display!=='none') renderUpcoming();
  renderFavorites();
  renderFollowups();
  if(document.getElementById('searchPage') && document.getElementById('searchPage').style.display!=='none') renderMasterSearch();
  if(document.getElementById('settingsPage') && document.getElementById('settingsPage').style.display!=='none') renderSettingsPage();
  if(document.getElementById('historyPage') && document.getElementById('historyPage').style.display!=='none') renderHistoryPage();
  renderProfile();
}

window.addEventListener('keydown', e => {
  if(e.key==='Escape'){
    let lb = document.getElementById('lightboxModal');
    if(lb && lb.classList.contains('show')){
      lb.classList.remove('show');
      return;
    }
    let notice = document.getElementById('actionNoticeModal');
    if(notice && notice.classList.contains('show')){
      notice.classList.remove('show');
      return;
    }
    document.querySelectorAll('.modal-bg:not(#profileSetupModal)').forEach(x=>x.classList.remove('show'));
  }
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){
    e.preventDefault();
    if(currentPage === 'upcoming'){
      let s = document.getElementById('upSearch');
      if(s) s.focus();
    } else {
      showPage('search');
      setTimeout(()=>{
        let s = document.getElementById('masterSearchInput');
        if(s) s.focus();
      }, 100);
    }
  }
});

// ==================== PROFILE MODULE UI HANDLERS ====================

function renderProfile(){
  currentProfile = loadProfile();
  updateProfileAvatars();
  
  let nameEl = document.getElementById('profileDisplayName');
  if(nameEl) nameEl.textContent = currentProfile.name || 'Munendra Singh';
  
  let roleEl = document.getElementById('profileDisplayRole');
  if(roleEl) roleEl.textContent = currentProfile.role || 'Property Manager';
  
  // Personal Information
  let infoNameEl = document.getElementById('infoName');
  if(infoNameEl) infoNameEl.textContent = currentProfile.name || '—';
  
  let infoPhoneEl = document.getElementById('infoPhone');
  if(infoPhoneEl) infoPhoneEl.textContent = currentProfile.phone || '—';
  
  let infoEmailEl = document.getElementById('infoEmail');
  if(infoEmailEl) infoEmailEl.textContent = currentProfile.email || '—';
  
  let infoCompanyEl = document.getElementById('infoCompany');
  if(infoCompanyEl) infoCompanyEl.textContent = currentProfile.company || '—';
  
  // My Activity - Dynamically calculated from CRM data
  let actPropsEl = document.getElementById('actProps');
  if(actPropsEl) actPropsEl.textContent = data.length;
  
  let actProjectsEl = document.getElementById('actProjects');
  if(actProjectsEl) actProjectsEl.textContent = upcomingData.length;
  
  let actFavsEl = document.getElementById('actFavs');
  if(actFavsEl){
    let propFavCount = data.filter(p => p.favorite).length;
    let upFavCount = upcomingData.filter(u => u.favorite).length;
    actFavsEl.textContent = propFavCount + upFavCount;
  }
  
  let actFollowsEl = document.getElementById('actFollows');
  if(actFollowsEl) actFollowsEl.textContent = data.filter(p => p.follow).length;
}

function openProfileModal(){
  currentProfile = loadProfile();
  let nameInput = document.getElementById('editProfileName');
  let roleInput = document.getElementById('editProfileRole');
  let phoneInput = document.getElementById('editProfilePhone');
  let emailInput = document.getElementById('editProfileEmail');
  let compInput = document.getElementById('editProfileCompany');
  let urlInput = document.getElementById('editProfilePhotoUrl');
  let fileInput = document.getElementById('editProfilePhotoFile');
  
  if(nameInput) nameInput.value = currentProfile.name || '';
  if(roleInput) roleInput.value = currentProfile.role || 'Property Manager';
  if(phoneInput) phoneInput.value = currentProfile.phone || '';
  if(emailInput) emailInput.value = currentProfile.email || '';
  if(compInput) compInput.value = currentProfile.company || '';
  if(urlInput) urlInput.value = currentProfile.photo && !currentProfile.photo.startsWith('data:') ? currentProfile.photo : '';
  if(fileInput) fileInput.value = '';
  
  profileTempPhoto = currentProfile.photo || '';
  updateProfilePhotoPreview(profileTempPhoto);
  
  let modal = document.getElementById('editProfileModal');
  if(modal) modal.classList.add('show');
}

function updateProfilePhotoPreview(src){
  const wrap = document.getElementById('editProfilePhotoPreviewWrap');
  const img = document.getElementById('editProfilePhotoPreview');
  if(wrap && img){
    if(src && typeof src === 'string' && src.trim()){
      img.onerror = function(){
        this.onerror = null;
        this.src = '';
        wrap.style.display = 'none';
      };
      img.onload = function(){
        wrap.style.display = 'flex';
      };
      img.src = src.trim();
      wrap.style.display = 'flex';
    } else {
      img.onerror = null;
      img.onload = null;
      img.src = '';
      wrap.style.display = 'none';
    }
  }
}

async function handleProfilePhotoUpload(inputOrFile){
  const file = (inputOrFile instanceof File) ? inputOrFile : (inputOrFile?.files && inputOrFile.files[0]);
  const fileInput = document.getElementById('editProfilePhotoFile');
  
  if(!file){
    return;
  }
  
  // 5. Validate file is an image (JPG, JPEG, PNG, WEBP)
  if(!isValidImageFile(file)){
    toast('Please select a valid image file (JPG, JPEG, PNG, or WEBP).');
    if(fileInput) fileInput.value = '';
    return;
  }
  
  // 1 & 3. Immediately show actual selected image using URL.createObjectURL(file)
  let blobUrl = '';
  try {
    blobUrl = URL.createObjectURL(file);
    updateProfilePhotoPreview(blobUrl);
  } catch(e){}
  
  // 6 & 8. Compress and convert to data URL for persistent storage in IndexedDB/LocalStorage
  try {
    const dataUrl = await compressImage(file, 400, 400, 0.85);
    profileTempPhoto = dataUrl;
    updateProfilePhotoPreview(dataUrl);
    
    if(blobUrl && blobUrl.startsWith('blob:')){
      try { URL.revokeObjectURL(blobUrl); } catch(e){}
    }
    
    // 9. Update the profile image using the existing profile save mechanism immediately
    currentProfile = {
      ...currentProfile,
      photo: dataUrl
    };
    saveProfile(currentProfile);
    
    // 9. Dashboard profile avatar must use the newly selected image
    updateProfileAvatars();
    toast('Profile photo updated');
  } catch(err){
    console.error('Error processing profile photo:', err);
    toast(err.message || 'Failed to read image file');
    if(blobUrl && blobUrl.startsWith('blob:')){
      try { URL.revokeObjectURL(blobUrl); } catch(e){}
    }
    if(!profileTempPhoto){
      updateProfilePhotoPreview('');
    }
    if(fileInput) fileInput.value = '';
  }
}

function handleProfileUrlInput(val){
  let cleanVal = (val || '').trim();
  if(cleanVal){
    profileTempPhoto = cleanVal;
    updateProfilePhotoPreview(cleanVal);
    currentProfile = {
      ...currentProfile,
      photo: cleanVal
    };
    saveProfile(currentProfile);
    updateProfileAvatars();
  } else if(!document.getElementById('editProfilePhotoFile')?.files?.length){
    profileTempPhoto = '';
    updateProfilePhotoPreview('');
    currentProfile = {
      ...currentProfile,
      photo: ''
    };
    saveProfile(currentProfile);
    updateProfileAvatars();
  }
}

function removeProfilePhoto(){
  profileTempPhoto = '';
  let fileInput = document.getElementById('editProfilePhotoFile');
  let urlInput = document.getElementById('editProfilePhotoUrl');
  if(fileInput) fileInput.value = '';
  if(urlInput) urlInput.value = '';
  updateProfilePhotoPreview('');
  
  currentProfile = {
    ...currentProfile,
    photo: ''
  };
  saveProfile(currentProfile);
  updateProfileAvatars();
  toast('Profile photo removed');
}

function saveProfileForm(){
  let name = (document.getElementById('editProfileName')?.value || '').trim() || 'Munendra Singh';
  let role = (document.getElementById('editProfileRole')?.value || '').trim() || 'Property Manager';
  let phone = (document.getElementById('editProfilePhone')?.value || '').trim();
  let email = (document.getElementById('editProfileEmail')?.value || '').trim();
  let company = (document.getElementById('editProfileCompany')?.value || '').trim();
  
  currentProfile = {
    ...currentProfile,
    name,
    role,
    phone,
    email,
    company,
    photo: profileTempPhoto
  };
  saveProfile(currentProfile);
  renderProfile();
  closeModal('editProfileModal');
  toast('Profile updated successfully');
}

// ==================== FIRST-TIME ONBOARDING SETUP HANDLERS ====================

function openProfileSetupModal(){
  let nameInput = document.getElementById('setupProfileName');
  let roleInput = document.getElementById('setupProfileRole');
  let phoneInput = document.getElementById('setupProfilePhone');
  let emailInput = document.getElementById('setupProfileEmail');
  let compInput = document.getElementById('setupProfileCompany');
  let urlInput = document.getElementById('setupProfilePhotoUrl');
  let fileInput = document.getElementById('setupProfilePhotoFile');

  if(nameInput) nameInput.value = '';
  if(roleInput) roleInput.value = 'Property Manager';
  if(phoneInput) phoneInput.value = '';
  if(emailInput) emailInput.value = '';
  if(compInput) compInput.value = '';
  if(urlInput) urlInput.value = '';
  if(fileInput) fileInput.value = '';

  setupTempPhoto = '';
  updateSetupPhotoPreview('');

  let modal = document.getElementById('profileSetupModal');
  if(modal) modal.classList.add('show');
}

function updateSetupPhotoPreview(src){
  const wrap = document.getElementById('setupProfilePhotoPreviewWrap');
  const img = document.getElementById('setupProfilePhotoPreview');
  if(wrap && img){
    if(src && typeof src === 'string' && src.trim()){
      img.onerror = function(){
        this.onerror = null;
        this.src = '';
        wrap.style.display = 'none';
      };
      img.onload = function(){
        wrap.style.display = 'flex';
      };
      img.src = src.trim();
      wrap.style.display = 'flex';
    } else {
      img.onerror = null;
      img.onload = null;
      img.src = '';
      wrap.style.display = 'none';
    }
  }
}

async function handleSetupPhotoUpload(inputOrFile){
  const file = (inputOrFile instanceof File) ? inputOrFile : (inputOrFile?.files && inputOrFile.files[0]);
  const fileInput = document.getElementById('setupProfilePhotoFile');
  
  if(!file) return;
  
  if(!isValidImageFile(file)){
    toast('Please select a valid image file (JPG, JPEG, PNG, or WEBP).');
    if(fileInput) fileInput.value = '';
    return;
  }
  
  let blobUrl = '';
  try {
    blobUrl = URL.createObjectURL(file);
    updateSetupPhotoPreview(blobUrl);
  } catch(e){}
  
  try {
    const dataUrl = await compressImage(file, 400, 400, 0.85);
    setupTempPhoto = dataUrl;
    updateSetupPhotoPreview(dataUrl);
    if(blobUrl && blobUrl.startsWith('blob:')){
      try { URL.revokeObjectURL(blobUrl); } catch(e){}
    }
    toast('Profile photo selected');
  } catch(err){
    console.error('Error processing setup profile photo:', err);
    toast(err.message || 'Failed to read image file');
    if(blobUrl && blobUrl.startsWith('blob:')){
      try { URL.revokeObjectURL(blobUrl); } catch(e){}
    }
    if(!setupTempPhoto){
      updateSetupPhotoPreview('');
    }
    if(fileInput) fileInput.value = '';
  }
}

function handleSetupPhotoUrlInput(val){
  let cleanVal = (val || '').trim();
  if(cleanVal){
    setupTempPhoto = cleanVal;
    updateSetupPhotoPreview(cleanVal);
  } else if(!document.getElementById('setupProfilePhotoFile')?.files?.length){
    setupTempPhoto = '';
    updateSetupPhotoPreview('');
  }
}

function removeSetupPhoto(){
  setupTempPhoto = '';
  let fileInput = document.getElementById('setupProfilePhotoFile');
  let urlInput = document.getElementById('setupProfilePhotoUrl');
  if(fileInput) fileInput.value = '';
  if(urlInput) urlInput.value = '';
  updateSetupPhotoPreview('');
  toast('Profile photo removed');
}

function saveFirstTimeProfile(){
  let nameInput = document.getElementById('setupProfileName');
  let name = (nameInput?.value || '').trim();
  
  if(!name){
    toast('Please enter your Full Name to continue.');
    if(nameInput){
      nameInput.focus();
      nameInput.style.borderColor = 'var(--danger)';
      setTimeout(() => { if(nameInput) nameInput.style.borderColor = ''; }, 2500);
    }
    return;
  }
  
  let role = (document.getElementById('setupProfileRole')?.value || '').trim() || 'Property Manager';
  let phone = (document.getElementById('setupProfilePhone')?.value || '').trim();
  let email = (document.getElementById('setupProfileEmail')?.value || '').trim();
  let company = (document.getElementById('setupProfileCompany')?.value || '').trim();
  
  let newProfile = {
    ...defaultProfile,
    name,
    role,
    phone,
    email,
    company,
    photo: setupTempPhoto || '',
    setupCompleted: true
  };
  
  saveProfile(newProfile);
  try {
    localStorage.setItem(PROFILE_SETUP_KEY, 'true');
  } catch(e){}
  
  currentProfile = newProfile;
  renderProfile();
  updateProfileAvatars();
  closeModal('profileSetupModal');
  showPage('dashboard');
  toast(`Welcome to Property Manager, ${name}!`);
}

function skipProfileSetup(){
  try {
    localStorage.setItem(PROFILE_SETUP_KEY, 'true');
  } catch(e){}
  closeModal('profileSetupModal');
  showPage('dashboard');
  toast('You can complete your profile anytime from Profile → Edit Profile.');
}

function handleMobileSearchNav(){
  showPage('properties');
  setTimeout(() => {
    let s = document.getElementById('search');
    if(s){
      s.focus();
      s.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}


// ==========================================================================
// MOBILE BOTTOM NAVIGATION & ☰ MENU POPUP
// ==========================================================================

function initScrollNavbar(){
  const onScrollOrTouch = () => {
    if(!scrollTicking){
      window.requestAnimationFrame(() => {
        handleNavbarScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  };

  window.addEventListener('scroll', onScrollOrTouch, { passive: true });
  window.addEventListener('touchmove', onScrollOrTouch, { passive: true });

  window.addEventListener('resize', () => {
    const nav = document.getElementById('mobileBottomNav');
    if(nav) nav.classList.remove('nav-hidden');
    lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  }, { passive: true });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      const nav = document.getElementById('mobileBottomNav');
      if(nav) nav.classList.remove('nav-hidden');
      lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    }, 150);
  });
}

function handleNavbarScroll(){
  const nav = document.getElementById('mobileBottomNav');
  if(!nav) return;
  
  // If navbar is not visible (desktop or tablet portrait where display is none), do not process
  const navDisplay = window.getComputedStyle(nav).display;
  if(navDisplay === 'none'){
    if(nav.classList.contains('nav-hidden')){
      nav.classList.remove('nav-hidden');
    }
    return;
  }
  
  if(isProgrammaticScroll){
    nav.classList.remove('nav-hidden');
    return;
  }

  const rawScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  const maxScroll = Math.max(0, (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight);
  // Clamp scroll position to document bounds (prevents iOS rubber-band overscroll jitter at top and bottom)
  const currentScrollY = Math.max(0, Math.min(maxScroll, rawScrollY));

  // At the top of the page (or during negative overscroll), always keep navbar visible
  if(currentScrollY <= 25){
    nav.classList.remove('nav-hidden');
    lastScrollY = currentScrollY;
    return;
  }

  const delta = currentScrollY - lastScrollY;

  // Anti-flicker threshold: ignore tiny movements (< 8px)
  if(Math.abs(delta) < 8) return;

  if(delta > 0 && currentScrollY > 50){
    // User scrolls DOWN -> smoothly HIDE
    nav.classList.add('nav-hidden');
    closeBottomMenu();
  } else if(delta < 0){
    // User scrolls UP -> smoothly SHOW
    nav.classList.remove('nav-hidden');
  }

  lastScrollY = currentScrollY;
}

function navigateTo(target){
  closeBottomMenu();
  const nav = document.getElementById('mobileBottomNav');
  if(nav) nav.classList.remove('nav-hidden');
  isProgrammaticScroll = true;

  showPage(target);

  if(target === 'search'){
    setTimeout(() => {
      let s = document.getElementById('masterSearchInput');
      if(s){
        s.focus();
        s.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  setTimeout(() => {
    isProgrammaticScroll = false;
    lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    if(nav) nav.classList.remove('nav-hidden');
  }, 600);
}

function toggleBottomMenu(){
  const popup = document.getElementById('bottomMenuPopup');
  const backdrop = document.getElementById('bottomMenuBackdrop');
  if(!popup) return;
  const isShow = !popup.classList.contains('show');
  popup.classList.toggle('show', isShow);
  if(backdrop) backdrop.classList.toggle('show', isShow);
}

function closeBottomMenu(){
  const popup = document.getElementById('bottomMenuPopup');
  const backdrop = document.getElementById('bottomMenuBackdrop');
  if(popup) popup.classList.remove('show');
  if(backdrop) backdrop.classList.remove('show');
}

// ==========================================================================
// THEME SWITCHING (Light / Dark)
// ==========================================================================

function toggleTheme(){
  let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  let newTheme = isDark ? 'light' : 'dark';
  if(newTheme === 'dark'){
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  try { localStorage.setItem('property_pro_theme', newTheme); } catch(e){}
  updateThemeMenuLabel();
  toast(newTheme === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
}

function updateThemeMenuLabel(){
  let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  let icon = document.getElementById('themeMenuIcon');
  let label = document.getElementById('themeMenuLabel');
  if(icon) icon.textContent = isDark ? '☀️' : '🌙';
  if(label) label.textContent = isDark ? 'Theme: Dark' : 'Theme: Light';

  let sideIcon = document.getElementById('sidebarThemeIcon');
  let sideText = document.getElementById('sidebarThemeText');
  let sideBtn = document.getElementById('sidebarThemeBtn');
  if(sideIcon) sideIcon.textContent = isDark ? '☀️' : '🌙';
  if(sideText) sideText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  if(sideBtn){
    let themeTitle = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    sideBtn.title = themeTitle;
    if(typeof sideBtn.setAttribute === 'function'){
      sideBtn.setAttribute('data-tooltip', isDark ? 'Light Mode' : 'Dark Mode');
    }
  }
}

function initTheme(){
  try {
    let t = localStorage.getItem('property_pro_theme');
    if(t === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch(e){}
  updateThemeMenuLabel();
}

// ==========================================================================
// SIDEBAR COLLAPSE / EXPAND SYSTEM
// ==========================================================================
const SIDEBAR_COLLAPSE_KEY = 'property_manager_pro_sidebar_collapsed';

function isSidebarCollapsed(){
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === 'true';
  } catch(e){
    return false;
  }
}

function setSidebarCollapsed(collapsed){
  let sidebar = document.getElementById('sidebar');
  let app = document.querySelector('.app');
  let toggleBtn = document.getElementById('sidebarToggleBtn');

  if(collapsed){
    sidebar?.classList.add('collapsed');
    app?.classList.add('sidebar-collapsed');
    document.body?.classList.add('sidebar-collapsed');
    if(toggleBtn){
      toggleBtn.title = 'Expand sidebar';
      if(typeof toggleBtn.setAttribute === 'function') toggleBtn.setAttribute('aria-label', 'Expand sidebar');
    }
  } else {
    sidebar?.classList.remove('collapsed');
    app?.classList.remove('sidebar-collapsed');
    document.body?.classList.remove('sidebar-collapsed');
    if(toggleBtn){
      toggleBtn.title = 'Collapse sidebar';
      if(typeof toggleBtn.setAttribute === 'function') toggleBtn.setAttribute('aria-label', 'Collapse sidebar');
    }
  }

  try {
    localStorage.setItem(SIDEBAR_COLLAPSE_KEY, collapsed ? 'true' : 'false');
  } catch(e){}
}

function toggleSidebarCollapse(){
  let sidebar = document.getElementById('sidebar');
  let isCollapsed = sidebar ? sidebar.classList.contains('collapsed') : false;
  setSidebarCollapsed(!isCollapsed);
}

function initSidebarCollapse(){
  if(typeof window !== 'undefined'){
    const checkCollapse = () => {
      if(window.innerWidth > 992 && window.innerHeight > 500){
        let saved = isSidebarCollapsed();
        setSidebarCollapsed(saved);
      } else {
        setSidebarCollapsed(false);
        const nav = document.getElementById('mobileBottomNav');
        if(nav) nav.classList.remove('nav-hidden');
      }
    };
    checkCollapse();
    window.addEventListener('resize', checkCollapse);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkCollapse, 150);
    });
  }
}

// ==========================================================================
// INITIALIZE APPLICATION
// Global variables and functions defined above before initialization calls
// ==========================================================================
renderAll();
updateProfileAvatars();
initStorage();
initTheme();
initScrollNavbar();
initSidebarCollapse();

const settingsAddBtnEl = document.getElementById('settingsAddBtn');
if(settingsAddBtnEl){
  settingsAddBtnEl.addEventListener('click', () => openConfigModal('add'));
}

if(!isProfileSetupCompleted()){
  showPage('dashboard');
  openProfileSetupModal();
} else {
  showPage('dashboard');
}
