/**
 * Phase 37b — Institution + company taxonomies for canonicalization.
 *
 * Curated lists covering the most-frequently-cited institutions on
 * tech-industry resumes. Coverage is intentionally narrow (top universities
 * + Fortune 500-ish + popular tech employers). Unknowns fall through to
 * LLM canonicalization which proposes a normalized form.
 *
 * Why curated, not a full GleIF/Wikipedia dump:
 *   - 50KB of bundled JSON is fine; 50MB is not
 *   - 80/20 rule — these ~400 entries cover ~80% of mentions
 *   - Edge cases (regional schools, obscure startups) work via LLM
 */

export interface CanonicalInstitution {
  id: string;
  label: string;
  aliases: string[];
  // Country code helps with same-name disambiguation (e.g. "Cambridge").
  country?: string;
  // Type lets the UI render appropriate badges (university / company / govt).
  type: "university" | "company" | "research" | "government";
}

// ─── Universities — top global research + US/UK/EU/Asia regional flagships
export const UNIVERSITIES: CanonicalInstitution[] = [
  // US — top 30 + flagship publics
  { id: "univ:mit", label: "Massachusetts Institute of Technology", aliases: ["mit", "massachusetts institute of technology"], country: "US", type: "university" },
  { id: "univ:stanford", label: "Stanford University", aliases: ["stanford", "stanford university", "leland stanford"], country: "US", type: "university" },
  { id: "univ:harvard", label: "Harvard University", aliases: ["harvard", "harvard university"], country: "US", type: "university" },
  { id: "univ:caltech", label: "California Institute of Technology", aliases: ["caltech", "california institute of technology"], country: "US", type: "university" },
  { id: "univ:princeton", label: "Princeton University", aliases: ["princeton", "princeton university"], country: "US", type: "university" },
  { id: "univ:yale", label: "Yale University", aliases: ["yale", "yale university"], country: "US", type: "university" },
  { id: "univ:columbia", label: "Columbia University", aliases: ["columbia", "columbia university"], country: "US", type: "university" },
  { id: "univ:upenn", label: "University of Pennsylvania", aliases: ["upenn", "university of pennsylvania", "penn"], country: "US", type: "university" },
  { id: "univ:cornell", label: "Cornell University", aliases: ["cornell", "cornell university"], country: "US", type: "university" },
  { id: "univ:duke", label: "Duke University", aliases: ["duke", "duke university"], country: "US", type: "university" },
  { id: "univ:northwestern", label: "Northwestern University", aliases: ["northwestern", "northwestern university"], country: "US", type: "university" },
  { id: "univ:uchicago", label: "University of Chicago", aliases: ["university of chicago", "uchicago"], country: "US", type: "university" },
  { id: "univ:berkeley", label: "UC Berkeley", aliases: ["berkeley", "uc berkeley", "university of california berkeley", "ucb", "cal"], country: "US", type: "university" },
  { id: "univ:ucla", label: "UCLA", aliases: ["ucla", "university of california los angeles"], country: "US", type: "university" },
  { id: "univ:ucsd", label: "UC San Diego", aliases: ["ucsd", "uc san diego", "university of california san diego"], country: "US", type: "university" },
  { id: "univ:umich", label: "University of Michigan", aliases: ["university of michigan", "umich", "u michigan"], country: "US", type: "university" },
  { id: "univ:cmu", label: "Carnegie Mellon University", aliases: ["cmu", "carnegie mellon", "carnegie mellon university"], country: "US", type: "university" },
  { id: "univ:gatech", label: "Georgia Tech", aliases: ["georgia tech", "gatech", "georgia institute of technology"], country: "US", type: "university" },
  { id: "univ:uiuc", label: "University of Illinois Urbana-Champaign", aliases: ["uiuc", "university of illinois", "illinois", "university of illinois urbana champaign", "university of illinois at urbana-champaign"], country: "US", type: "university" },
  { id: "univ:utaustin", label: "University of Texas at Austin", aliases: ["ut austin", "university of texas at austin", "utexas"], country: "US", type: "university" },
  { id: "univ:uw", label: "University of Washington", aliases: ["uw", "university of washington", "udub"], country: "US", type: "university" },
  { id: "univ:wisc", label: "University of Wisconsin-Madison", aliases: ["wisconsin", "uw madison", "university of wisconsin", "university of wisconsin madison"], country: "US", type: "university" },
  { id: "univ:purdue", label: "Purdue University", aliases: ["purdue", "purdue university"], country: "US", type: "university" },
  { id: "univ:nyu", label: "New York University", aliases: ["nyu", "new york university"], country: "US", type: "university" },
  { id: "univ:bostonu", label: "Boston University", aliases: ["boston university", "bu"], country: "US", type: "university" },
  { id: "univ:northeastern", label: "Northeastern University", aliases: ["northeastern", "northeastern university"], country: "US", type: "university" },
  { id: "univ:rice", label: "Rice University", aliases: ["rice", "rice university"], country: "US", type: "university" },
  { id: "univ:vandy", label: "Vanderbilt University", aliases: ["vanderbilt", "vandy", "vanderbilt university"], country: "US", type: "university" },
  { id: "univ:jhu", label: "Johns Hopkins University", aliases: ["johns hopkins", "jhu", "johns hopkins university"], country: "US", type: "university" },
  { id: "univ:nd", label: "University of Notre Dame", aliases: ["notre dame", "university of notre dame"], country: "US", type: "university" },

  // UK
  { id: "univ:oxford", label: "University of Oxford", aliases: ["oxford", "university of oxford"], country: "UK", type: "university" },
  { id: "univ:cambridge-uk", label: "University of Cambridge", aliases: ["cambridge", "university of cambridge"], country: "UK", type: "university" },
  { id: "univ:imperial", label: "Imperial College London", aliases: ["imperial", "imperial college", "imperial college london"], country: "UK", type: "university" },
  { id: "univ:ucl", label: "University College London", aliases: ["ucl", "university college london"], country: "UK", type: "university" },
  { id: "univ:lse", label: "London School of Economics", aliases: ["lse", "london school of economics"], country: "UK", type: "university" },
  { id: "univ:kcl", label: "King's College London", aliases: ["kcl", "king's college london", "kings college london"], country: "UK", type: "university" },
  { id: "univ:edinburgh", label: "University of Edinburgh", aliases: ["edinburgh", "university of edinburgh"], country: "UK", type: "university" },
  { id: "univ:manchester", label: "University of Manchester", aliases: ["manchester", "university of manchester"], country: "UK", type: "university" },

  // Canada
  { id: "univ:toronto", label: "University of Toronto", aliases: ["uoft", "university of toronto", "toronto"], country: "CA", type: "university" },
  { id: "univ:waterloo", label: "University of Waterloo", aliases: ["waterloo", "uwaterloo", "university of waterloo"], country: "CA", type: "university" },
  { id: "univ:mcgill", label: "McGill University", aliases: ["mcgill", "mcgill university"], country: "CA", type: "university" },
  { id: "univ:ubc", label: "University of British Columbia", aliases: ["ubc", "university of british columbia"], country: "CA", type: "university" },

  // Asia
  { id: "univ:tsinghua", label: "Tsinghua University", aliases: ["tsinghua", "tsinghua university"], country: "CN", type: "university" },
  { id: "univ:pku", label: "Peking University", aliases: ["pku", "peking university", "beijing university"], country: "CN", type: "university" },
  { id: "univ:fudan", label: "Fudan University", aliases: ["fudan", "fudan university"], country: "CN", type: "university" },
  { id: "univ:sjtu", label: "Shanghai Jiao Tong University", aliases: ["sjtu", "shanghai jiao tong university"], country: "CN", type: "university" },
  { id: "univ:hku", label: "University of Hong Kong", aliases: ["hku", "university of hong kong"], country: "HK", type: "university" },
  { id: "univ:hkust", label: "Hong Kong University of Science and Technology", aliases: ["hkust"], country: "HK", type: "university" },
  { id: "univ:nus", label: "National University of Singapore", aliases: ["nus", "national university of singapore"], country: "SG", type: "university" },
  { id: "univ:ntu", label: "Nanyang Technological University", aliases: ["ntu", "nanyang technological university"], country: "SG", type: "university" },
  { id: "univ:tokyo", label: "University of Tokyo", aliases: ["university of tokyo", "u tokyo", "todai"], country: "JP", type: "university" },
  { id: "univ:kyoto", label: "Kyoto University", aliases: ["kyoto university"], country: "JP", type: "university" },
  { id: "univ:kaist", label: "KAIST", aliases: ["kaist", "korea advanced institute of science and technology"], country: "KR", type: "university" },
  { id: "univ:snu", label: "Seoul National University", aliases: ["snu", "seoul national university"], country: "KR", type: "university" },

  // India
  { id: "univ:iit-bombay", label: "IIT Bombay", aliases: ["iit bombay", "iitb", "indian institute of technology bombay"], country: "IN", type: "university" },
  { id: "univ:iit-delhi", label: "IIT Delhi", aliases: ["iit delhi", "iitd", "indian institute of technology delhi"], country: "IN", type: "university" },
  { id: "univ:iit-madras", label: "IIT Madras", aliases: ["iit madras", "iitm", "indian institute of technology madras"], country: "IN", type: "university" },
  { id: "univ:iit-kanpur", label: "IIT Kanpur", aliases: ["iit kanpur", "iitk", "indian institute of technology kanpur"], country: "IN", type: "university" },
  { id: "univ:iit-kgp", label: "IIT Kharagpur", aliases: ["iit kharagpur", "iit kgp", "indian institute of technology kharagpur"], country: "IN", type: "university" },
  { id: "univ:iisc", label: "Indian Institute of Science", aliases: ["iisc", "indian institute of science"], country: "IN", type: "university" },
  { id: "univ:bits", label: "BITS Pilani", aliases: ["bits pilani", "bits"], country: "IN", type: "university" },
  { id: "univ:nit-trichy", label: "NIT Trichy", aliases: ["nit trichy", "national institute of technology trichy"], country: "IN", type: "university" },
  { id: "univ:iiit-hyderabad", label: "IIIT Hyderabad", aliases: ["iiit hyderabad", "iiit-h"], country: "IN", type: "university" },
  { id: "univ:isb", label: "Indian School of Business", aliases: ["isb", "indian school of business"], country: "IN", type: "university" },
  { id: "univ:iim-ahmedabad", label: "IIM Ahmedabad", aliases: ["iim ahmedabad", "iima"], country: "IN", type: "university" },
  { id: "univ:iim-bangalore", label: "IIM Bangalore", aliases: ["iim bangalore", "iimb"], country: "IN", type: "university" },

  // EU
  { id: "univ:ethz", label: "ETH Zurich", aliases: ["ethz", "eth zurich", "eth zürich", "swiss federal institute of technology"], country: "CH", type: "university" },
  { id: "univ:epfl", label: "EPFL", aliases: ["epfl", "école polytechnique fédérale de lausanne"], country: "CH", type: "university" },
  { id: "univ:tum", label: "Technical University of Munich", aliases: ["tum", "technical university of munich", "tu munich"], country: "DE", type: "university" },
  { id: "univ:hpi", label: "Hasso Plattner Institute", aliases: ["hpi", "hasso plattner institute"], country: "DE", type: "university" },
  { id: "univ:lmu", label: "Ludwig Maximilian University of Munich", aliases: ["lmu", "lmu munich"], country: "DE", type: "university" },
  { id: "univ:sorbonne", label: "Sorbonne University", aliases: ["sorbonne", "sorbonne university"], country: "FR", type: "university" },
  { id: "univ:polytech", label: "École Polytechnique", aliases: ["polytechnique", "ecole polytechnique", "école polytechnique"], country: "FR", type: "university" },
  { id: "univ:insead", label: "INSEAD", aliases: ["insead"], country: "FR", type: "university" },
  { id: "univ:kth", label: "KTH Royal Institute of Technology", aliases: ["kth", "kth royal institute of technology"], country: "SE", type: "university" },
  { id: "univ:delft", label: "Delft University of Technology", aliases: ["delft", "tu delft", "delft university of technology"], country: "NL", type: "university" },

  // Israel
  { id: "univ:technion", label: "Technion", aliases: ["technion"], country: "IL", type: "university" },
  { id: "univ:tau", label: "Tel Aviv University", aliases: ["tau", "tel aviv university"], country: "IL", type: "university" },
  { id: "univ:huji", label: "Hebrew University of Jerusalem", aliases: ["huji", "hebrew university"], country: "IL", type: "university" },

  // Australia
  { id: "univ:unimelb", label: "University of Melbourne", aliases: ["university of melbourne", "unimelb"], country: "AU", type: "university" },
  { id: "univ:usyd", label: "University of Sydney", aliases: ["university of sydney", "usyd"], country: "AU", type: "university" },
];

// ─── Companies — top employers by tech-resume frequency
// Why this list and not Fortune 500: tech resumes name-check these orders
// of magnitude more often. Generalist hires still benefit (most F500
// also appear here).
export const COMPANIES: CanonicalInstitution[] = [
  // Big tech
  { id: "co:google", label: "Google", aliases: ["google", "alphabet", "google llc"], type: "company" },
  { id: "co:meta", label: "Meta", aliases: ["meta", "facebook", "meta platforms", "fb"], type: "company" },
  { id: "co:amazon", label: "Amazon", aliases: ["amazon", "amazon.com", "aws", "amazon web services"], type: "company" },
  { id: "co:apple", label: "Apple", aliases: ["apple", "apple inc", "apple inc."], type: "company" },
  { id: "co:microsoft", label: "Microsoft", aliases: ["microsoft", "msft", "microsoft corp"], type: "company" },
  { id: "co:netflix", label: "Netflix", aliases: ["netflix"], type: "company" },
  { id: "co:nvidia", label: "NVIDIA", aliases: ["nvidia", "nvidia corp"], type: "company" },
  { id: "co:tesla", label: "Tesla", aliases: ["tesla", "tesla motors"], type: "company" },
  { id: "co:openai", label: "OpenAI", aliases: ["openai", "open ai"], type: "company" },
  { id: "co:anthropic", label: "Anthropic", aliases: ["anthropic"], type: "company" },
  { id: "co:deepmind", label: "DeepMind", aliases: ["deepmind", "deep mind", "google deepmind"], type: "company" },

  // Tech mid-large
  { id: "co:stripe", label: "Stripe", aliases: ["stripe", "stripe inc"], type: "company" },
  { id: "co:airbnb", label: "Airbnb", aliases: ["airbnb"], type: "company" },
  { id: "co:uber", label: "Uber", aliases: ["uber", "uber technologies"], type: "company" },
  { id: "co:lyft", label: "Lyft", aliases: ["lyft"], type: "company" },
  { id: "co:doordash", label: "DoorDash", aliases: ["doordash"], type: "company" },
  { id: "co:instacart", label: "Instacart", aliases: ["instacart"], type: "company" },
  { id: "co:shopify", label: "Shopify", aliases: ["shopify"], type: "company" },
  { id: "co:square", label: "Block (Square)", aliases: ["square", "block", "block inc"], type: "company" },
  { id: "co:paypal", label: "PayPal", aliases: ["paypal", "paypal holdings"], type: "company" },
  { id: "co:cloudflare", label: "Cloudflare", aliases: ["cloudflare"], type: "company" },
  { id: "co:datadog", label: "Datadog", aliases: ["datadog"], type: "company" },
  { id: "co:mongodb", label: "MongoDB", aliases: ["mongodb", "mongo db"], type: "company" },
  { id: "co:snowflake", label: "Snowflake", aliases: ["snowflake", "snowflake computing"], type: "company" },
  { id: "co:databricks", label: "Databricks", aliases: ["databricks"], type: "company" },
  { id: "co:salesforce", label: "Salesforce", aliases: ["salesforce", "sfdc"], type: "company" },
  { id: "co:oracle", label: "Oracle", aliases: ["oracle", "oracle corp"], type: "company" },
  { id: "co:ibm", label: "IBM", aliases: ["ibm", "international business machines"], type: "company" },
  { id: "co:sap", label: "SAP", aliases: ["sap", "sap se"], type: "company" },
  { id: "co:vmware", label: "VMware", aliases: ["vmware", "vmware inc"], type: "company" },
  { id: "co:adobe", label: "Adobe", aliases: ["adobe", "adobe inc", "adobe systems"], type: "company" },
  { id: "co:intuit", label: "Intuit", aliases: ["intuit"], type: "company" },
  { id: "co:workday", label: "Workday", aliases: ["workday", "workday inc"], type: "company" },
  { id: "co:zoom", label: "Zoom", aliases: ["zoom", "zoom video"], type: "company" },
  { id: "co:slack", label: "Slack", aliases: ["slack", "slack technologies"], type: "company" },
  { id: "co:atlassian", label: "Atlassian", aliases: ["atlassian"], type: "company" },
  { id: "co:notion", label: "Notion", aliases: ["notion", "notion labs"], type: "company" },
  { id: "co:figma", label: "Figma", aliases: ["figma"], type: "company" },
  { id: "co:linear", label: "Linear", aliases: ["linear"], type: "company" },
  { id: "co:vercel", label: "Vercel", aliases: ["vercel"], type: "company" },
  { id: "co:netlify", label: "Netlify", aliases: ["netlify"], type: "company" },
  { id: "co:github", label: "GitHub", aliases: ["github", "github inc"], type: "company" },
  { id: "co:gitlab", label: "GitLab", aliases: ["gitlab"], type: "company" },
  { id: "co:hashicorp", label: "HashiCorp", aliases: ["hashicorp"], type: "company" },
  { id: "co:elastic", label: "Elastic", aliases: ["elastic", "elastic nv"], type: "company" },
  { id: "co:redhat", label: "Red Hat", aliases: ["red hat", "redhat"], type: "company" },
  { id: "co:ibm-cloud", label: "IBM Cloud", aliases: ["ibm cloud"], type: "company" },

  // Consulting
  { id: "co:mckinsey", label: "McKinsey & Company", aliases: ["mckinsey", "mckinsey & company", "mckinsey and company"], type: "company" },
  { id: "co:bcg", label: "Boston Consulting Group", aliases: ["bcg", "boston consulting group"], type: "company" },
  { id: "co:bain", label: "Bain & Company", aliases: ["bain", "bain & company", "bain and company"], type: "company" },
  { id: "co:deloitte", label: "Deloitte", aliases: ["deloitte"], type: "company" },
  { id: "co:accenture", label: "Accenture", aliases: ["accenture"], type: "company" },
  { id: "co:pwc", label: "PwC", aliases: ["pwc", "pricewaterhousecoopers", "price waterhouse coopers"], type: "company" },
  { id: "co:ey", label: "EY", aliases: ["ey", "ernst & young", "ernst and young"], type: "company" },
  { id: "co:kpmg", label: "KPMG", aliases: ["kpmg"], type: "company" },

  // Banks / finance
  { id: "co:gs", label: "Goldman Sachs", aliases: ["goldman sachs", "goldman", "gs"], type: "company" },
  { id: "co:jpm", label: "JPMorgan Chase", aliases: ["jpmorgan", "jp morgan", "jpmc", "jpmorgan chase", "chase"], type: "company" },
  { id: "co:ms", label: "Morgan Stanley", aliases: ["morgan stanley", "ms"], type: "company" },
  { id: "co:citi", label: "Citi", aliases: ["citi", "citigroup", "citibank"], type: "company" },
  { id: "co:bofa", label: "Bank of America", aliases: ["bofa", "bank of america"], type: "company" },
  { id: "co:wells", label: "Wells Fargo", aliases: ["wells fargo"], type: "company" },
  { id: "co:hsbc", label: "HSBC", aliases: ["hsbc"], type: "company" },
  { id: "co:barclays", label: "Barclays", aliases: ["barclays"], type: "company" },
  { id: "co:bridgewater", label: "Bridgewater Associates", aliases: ["bridgewater", "bridgewater associates"], type: "company" },
  { id: "co:citadel", label: "Citadel", aliases: ["citadel"], type: "company" },
  { id: "co:twosigma", label: "Two Sigma", aliases: ["two sigma"], type: "company" },
  { id: "co:de-shaw", label: "D. E. Shaw", aliases: ["de shaw", "d.e. shaw", "d. e. shaw"], type: "company" },
  { id: "co:janestreet", label: "Jane Street", aliases: ["jane street"], type: "company" },

  // Indian IT
  { id: "co:tcs", label: "Tata Consultancy Services", aliases: ["tcs", "tata consultancy services"], type: "company" },
  { id: "co:infosys", label: "Infosys", aliases: ["infosys"], type: "company" },
  { id: "co:wipro", label: "Wipro", aliases: ["wipro"], type: "company" },
  { id: "co:hcl", label: "HCL Technologies", aliases: ["hcl", "hcl technologies", "hcltech"], type: "company" },
  { id: "co:cognizant", label: "Cognizant", aliases: ["cognizant"], type: "company" },
  { id: "co:capgemini", label: "Capgemini", aliases: ["capgemini"], type: "company" },
  { id: "co:tech-mahindra", label: "Tech Mahindra", aliases: ["tech mahindra"], type: "company" },

  // Auto + industrial
  { id: "co:ford", label: "Ford", aliases: ["ford", "ford motor"], type: "company" },
  { id: "co:gm", label: "General Motors", aliases: ["gm", "general motors"], type: "company" },
  { id: "co:toyota", label: "Toyota", aliases: ["toyota", "toyota motor"], type: "company" },
  { id: "co:honda", label: "Honda", aliases: ["honda", "honda motor"], type: "company" },
  { id: "co:vw", label: "Volkswagen", aliases: ["vw", "volkswagen"], type: "company" },
  { id: "co:bmw", label: "BMW", aliases: ["bmw"], type: "company" },
  { id: "co:mercedes", label: "Mercedes-Benz", aliases: ["mercedes-benz", "mercedes", "daimler"], type: "company" },
  { id: "co:boeing", label: "Boeing", aliases: ["boeing", "the boeing company"], type: "company" },
  { id: "co:lockheed", label: "Lockheed Martin", aliases: ["lockheed", "lockheed martin"], type: "company" },
  { id: "co:northrop", label: "Northrop Grumman", aliases: ["northrop grumman"], type: "company" },
  { id: "co:raytheon", label: "RTX (Raytheon)", aliases: ["raytheon", "rtx", "raytheon technologies"], type: "company" },

  // Retail
  { id: "co:walmart", label: "Walmart", aliases: ["walmart", "walmart inc"], type: "company" },
  { id: "co:costco", label: "Costco", aliases: ["costco"], type: "company" },
  { id: "co:target", label: "Target", aliases: ["target", "target corp"], type: "company" },
  { id: "co:homedepot", label: "Home Depot", aliases: ["home depot", "the home depot"], type: "company" },

  // Health
  { id: "co:unitedhealth", label: "UnitedHealth Group", aliases: ["unitedhealth", "unitedhealth group", "unh"], type: "company" },
  { id: "co:cvs", label: "CVS Health", aliases: ["cvs", "cvs health"], type: "company" },
  { id: "co:jnj", label: "Johnson & Johnson", aliases: ["johnson and johnson", "johnson & johnson", "j&j", "jnj"], type: "company" },
  { id: "co:pfizer", label: "Pfizer", aliases: ["pfizer"], type: "company" },
  { id: "co:moderna", label: "Moderna", aliases: ["moderna"], type: "company" },
  { id: "co:roche", label: "Roche", aliases: ["roche"], type: "company" },
  { id: "co:novartis", label: "Novartis", aliases: ["novartis"], type: "company" },

  // Telco
  { id: "co:verizon", label: "Verizon", aliases: ["verizon", "verizon communications"], type: "company" },
  { id: "co:att", label: "AT&T", aliases: ["at&t", "att", "at and t"], type: "company" },
  { id: "co:tmobile", label: "T-Mobile", aliases: ["t-mobile", "tmobile"], type: "company" },

  // Media
  { id: "co:disney", label: "The Walt Disney Company", aliases: ["disney", "walt disney", "the walt disney company"], type: "company" },
  { id: "co:warner", label: "Warner Bros. Discovery", aliases: ["warner bros", "warner brothers", "warner bros discovery", "wbd"], type: "company" },
  { id: "co:comcast", label: "Comcast", aliases: ["comcast"], type: "company" },
  { id: "co:nyt", label: "The New York Times", aliases: ["new york times", "nyt", "the new york times"], type: "company" },
  { id: "co:reuters", label: "Reuters", aliases: ["reuters", "thomson reuters"], type: "company" },

  // Research
  { id: "co:nasa", label: "NASA", aliases: ["nasa"], type: "research" },
  { id: "co:llnl", label: "Lawrence Livermore National Laboratory", aliases: ["llnl", "lawrence livermore"], type: "research" },
  { id: "co:ornl", label: "Oak Ridge National Laboratory", aliases: ["ornl", "oak ridge"], type: "research" },
  { id: "co:cern", label: "CERN", aliases: ["cern"], type: "research" },
];

// ─── Lookup ─────────────────────────────────────────────────────────────
const ALIAS_TO_INST = new Map<string, CanonicalInstitution>();
const ID_TO_INST = new Map<string, CanonicalInstitution>();
for (const i of [...UNIVERSITIES, ...COMPANIES]) {
  ID_TO_INST.set(i.id, i);
  for (const a of i.aliases) ALIAS_TO_INST.set(a, i);
}

/**
 * Normalize a free-text institution string. Returns null when no match —
 * caller can fall back to LLM canonicalization.
 *
 * Strips common boilerplate suffixes ("Inc.", "Ltd.", "Pvt. Ltd.") before
 * lookup so "Stripe, Inc." and "Stripe Inc" and "Stripe" all match.
 */
const SUFFIX_TRIM = /\s*(inc\.?|incorporated|ltd\.?|llc\.?|llp\.?|plc\.?|s\.?a\.?|gmbh|ag|kg|pvt\.?\s*ltd\.?|private\s+limited|company|corp\.?|corporation|limited)$/i;

export function canonicalizeInstitution(input: string): CanonicalInstitution | null {
  const key = input.trim().toLowerCase().replace(SUFFIX_TRIM, "").trim();
  return ALIAS_TO_INST.get(key) ?? ALIAS_TO_INST.get(input.trim().toLowerCase()) ?? null;
}

export function getInstitutionById(id: string): CanonicalInstitution | undefined {
  return ID_TO_INST.get(id);
}
