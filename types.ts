
export enum AppStep {
  CATEGORY_SELECT = 'CATEGORY_SELECT',
  CONCEPT_GENERATION = 'CONCEPT_GENERATION',
  CONCEPT_SELECTION = 'CONCEPT_SELECTION',
  PRODUCTION_VIEW = 'PRODUCTION_VIEW',
  GHOST_MANNEQUIN_VIEW = 'GHOST_MANNEQUIN_VIEW',
  BANNER_UPLOAD = 'banner_upload',
  BANNER_RESULTS = 'BANNER_RESULTS',
  PHOTOSHOOT_UPLOAD = 'photoshoot_upload',
  PHOTOSHOOT_AI_CONFIG = 'photoshoot_ai_config',
  PHOTOSHOOT_RESULTS = 'photoshoot_results',
  PRESET_SELECTION = 'preset_selection',
  MASTER_UPLOAD = 'master_upload',
  MASTER_RESULTS = 'master_results',
  REBRAND_UPLOAD = 'rebrand_upload',
  REBRAND_RESULTS = 'rebrand_results',
  TECHPACK_SOU_UPLOAD = 'techpack_sou_upload',
  TECHPACK_SOU_RESULTS = 'techpack_sou_results',
  SOCIAL_STUDIO_INPUT = 'social_studio_input',
  SOCIAL_STUDIO_RESULTS = 'social_studio_results',
  TREND_PROMPT_SELECTION = 'TREND_PROMPT_SELECTION',
  MASTER_GRID_PREVIEW = 'MASTER_GRID_PREVIEW',
  MARKET_SELECTION = 'MARKET_SELECTION',
}

export type MarketRegion = 'USA' | 'Europe' | 'Asia' | 'Australia';

export interface CustomizationParams {
  mode: 'autopilot' | 'custom';
  colors?: string;
  techniques?: string[];
  graphics?: string[];
  vibe?: string;
}

export const EMBELLISHMENT_TECHNIQUES = [
  "Screen Printing", "Puff Print", "Embroidery", "Chenille Patches", "Rhinestones", "Distressing", "Acid Wash", "Sublimation", "Applique"
];

export const GRAPHIC_STYLES = [
  "Minimalist Logo", "Large Center Graphic", "All-Over Print (AOP)", "Sleeve Hits", "Back Statement Piece", "Vintage Crackle"
];


export type AppMode = 'designer' | 'ghost' | 'banner' | 'photoshoot' | 'master' | 'rebranding' | 'techpack_generator' | 'social_studio';

export type SocialPlatform = 'Instagram' | 'LinkedIn' | 'TikTok' | 'Pinterest' | 'Facebook';

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  'Instagram', 'LinkedIn', 'TikTok', 'Pinterest', 'Facebook'
];

export interface BOMItem {
  component: string;
  specification: string;
  unitConsumption: string;
  totalConsumption: string; // For the requested quantity
}

export interface TechPackData {
  productInfo: {
    name: string;
    category: string;
    fitResult: string;
    embellishments: string;
  };
  specs: {
    mainFabric: string;
    weightGsm: number;
    estimatedUnitWeightKg: number;
    dimensionalWeightKg: number; // Keep for legacy or validation
    packaging: {
      lengthCm: number;
      widthCm: number;
      heightCm: number;
    };
  };
  bom: BOMItem[];
  sizeChart: Record<string, Record<string, string>>;
}

export interface SourcingTechPackData {
  productInfo: {
    styleName: string;
    date: string;
    projectId: string;
    category: string;
    totalQuantity: number;
    description?: string;
  };
  measurements: {
    pointsOfMeasure: string;
    sizes: Record<string, string>;
  }[];
  bom: {
    item: string;
    description: string;
    colorCode: string;
    supplier: string;
    consumption: string;
  }[];
  embellishments: {
    type: string;
    technique: string;
    placement: string;
    size: string;
    color: string;
  }[];
  constructionNotes: string[];
  customizationRequests: string;
  qcChecklist: string[];
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  credits: number;
  role: UserRole;
  createdAt: number;
  branding?: {
    companyName?: string;
    logoBase64?: string;
    enabled: boolean;
  };
  api_keys?: {
    gemini?: string;
    instagram_token?: string;
    instagram_user_id?: string;
  };
}

export interface Concept {
  id: number;
  title: string;
  description: string;
  imageBase64: string;
}

export interface TrendPrompt {
  id: number;
  title: string;
  description: string;
}

export interface ProductionAssets {
  front: string;
  back: string;
  closeup: string;
  side: string;
  lifestyle: string;
}

export const CATEGORIES = [
  "Trousers", "Shorts", "Tracksuits", "T-Shirts",
  "Denim Jackets", "Puffer Jackets", "Hunting Jackets", "Crop Tops",
  "Leggings", "Hoodies", "Soccer Uniforms", "American Football Uniform",
  "Baseball Jersey", "Ice Hockey Uniform", "Ski Jackets", "Basketball Uniform", "Windbreaker Jackets", "Cheerleading Uniform", "Activewear", "MMA Rashguards", "Boxing Gloves", "Leather Products", "Moto Racing Suits"
];

export const MOTO_RACING_PRESETS = [
  "MotoGP Pro (Kangaroo Leather)", "Track Day (Cowhide Split)", "Street Sport (2-Piece)", "Adventure Touring (Textile/Gore-Tex)", "Vintage Cafe (Classic Leather)", "Drag Racing (Pro Mod)"
];



export const LEATHER_PRESETS = [
  "Cowhide Biker (Heavyweight)", "Lambskin Bomber (Luxury)", "Suede Trucker (Soft Nap)", "Cafe Racer (Horsehide)", "Shearling Aviator (Sheepskin)", "Distressed Bison (Vintage)"
];

export const SOCCER_PRESETS = [
  "Neo-Retro Revival", "Minimalist Luxury", "Topographic AOP", "Gradient Fade"
];

export const PUFFER_JACKET_PRESETS = [
  "No Preset", "Architectural Maxi", "Boxy Crop", "Hybrid Barn", "Tech-Modular", "Cinched Hourglass", "Retro-Alpine Gilet", "Stealth Utility Vest", "Duvet Wrap Vest"
];

export const BASEBALL_PRESETS = [
  "Powder Blue Throwback", "City Connect / Localized Art", "The Pinstripe Classic", "Sublimated Gradients"
];

export const ICE_HOCKEY_PRESETS = [
  "Deep Frost Gradient", "Matte Blackout", "The Centennial Classic", "Symmetry-Break"
];

export const BASKETBALL_PRESETS = [
  "No Preset", "Vapor Knit Pro", "Heritage Classic", "Neighborhood League", "Tech-Knit Identity", "City Connect Legacy"
];

export const WINDBREAKER_PRESETS = [
  "No Preset", "Urban Techshell", "Retro Color-Block", "Trail Performance", "Minimalist Coach", "Quarter-Zip Popover"
];

export const CHEER_PRESETS = [
  "No Preset", "Elite All-Star", "Sideline Classic", "High-Flash Performance", "Modern Minimalist", "Sublimated Motion"
];

export const ACTIVEWEAR_PRESETS = [
  "No Preset", "Performance Compression", "Seamless Flow", "Urban Athleisure", "High-Impact Training", "Discovery Trail", "Recovery Lounge"
];

export const MMA_RASHGUARD_PRESETS = [
  "No Preset", "Long Sleeve Pro-Fit", "Short Sleeve Performance", "Samurai Heritage AOP", "Cyber-Tech Modern", "Rank-Based Minimalist", "Street-Combat Style"
];


export const BANNER_PRESETS = [
  "Minimalist Product Focus", "Urban Street Style", "Bold Typography", "Luxury Editorial", "Y2K/Retro Futuristic", "Collage/Scrapbook", "Action/Sports", "Natural/Organic"
];

export const ASPECT_RATIOS: Record<string, string> = {
  "Instagram Post (1:1)": "1:1",
  "Instagram Story (9:16)": "9:16",
  "Facebook Post (4:5)": "4:5", // Note: Will be mapped to nearest supported ratio
  "Pinterest Pin (2:3)": "2:3", // Note: Will be mapped to nearest supported ratio
};

export const HOLIDAY_PRESETS = [
  "None", "Black Friday", "Cyber Monday", "Christmas", "New Year's", "Valentine's Day", "Mother's Day", "Father's Day", "4th of July", "Halloween", "Easter", "Thanksgiving", "Labor Day", "Memorial Day", "11.11 Sale"
];

// --- Photoshoot Presets ---
export const AI_MODEL_ETHNICITY = ["Black", "White", "Asian", "Hispanic", "Middle Eastern", "Mixed"];
export const AI_MODEL_AGE = ["18-25", "25-35", "35-45"];
export const AI_MODEL_SCENE = ["Urban Cityscape", "Minimalist Studio", "Nature/Hiking", "Luxury Interior", "Beach/Coastal", "Disco/Party"];
export const AI_MODEL_ACTION = ["Standing/Posing", "Walking", "Sitting", "Dancing", "Running", "Fighting"];

export const AMERICAN_FOOTBALL_PRESETS = [
  "Gridiron Pro-Fit", "Classic Varsity", "Sublimated Speed", "Retro-Bowl Classic", "Urban Combat"
];

export const TRACKSUIT_PRESETS = [
  "Running Performance", "Urban Streetwear (Heavyweight)", "Velour Luxury", "Windbreaker Set (Nylon)", "Tech-Fleece Utility", "Retro-Sport Poly"
];

export const BOXING_GLOVE_PRESETS = [
  "No Preset", "Training (Multi-Purpose)", "Heavy Bag Focus", "Sparring (16oz+)", "Competition (Lace-Up)", "Mexican Style", "Muay Thai Hybrid"
];

export interface ChangelogItem {
  version: string;
  date: string;
  title: string;
  features: string[];
}

export const CURRENT_APP_VERSION = "2.0.4";

export const CHANGELOG_HISTORY: ChangelogItem[] = [
  {
    version: "2.0.4",
    date: "Jan 9, 2026",
    title: "Motorsport & Customization Update",
    features: [
      "New 'Moto Racing Suits' Category (MotoGP, Track Day, Touring)",
      "Professional 'Flat Lay' Layout for 2-Piece Garments",
      "Enhanced Manufacturing Specs for Tracksuits & Leather",
      "Personalized 'User Generations' Dashboard Stats",
      "Granular 'Custom Craft' Design Studio"
    ]
  },
  {
    version: "2.0.3",
    date: "Jan 5, 2026",
    title: "Performance Update",
    features: [
      "Faster Generation Speeds",
      "Improved Fabric Textures",
      "Mobile UI Optimizations"
    ]
  }
];
