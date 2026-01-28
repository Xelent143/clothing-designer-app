import { GoogleGenerativeAI, SchemaType, GenerateContentResult } from "@google/generative-ai";
import { AppStep, Gender, CATEGORIES, Concept, ProductionAssets, UserProfile, SOCCER_PRESETS, AppMode, BANNER_PRESETS, ASPECT_RATIOS, HOLIDAY_PRESETS, PUFFER_JACKET_PRESETS, BASEBALL_PRESETS, ICE_HOCKEY_PRESETS, BASKETBALL_PRESETS, WINDBREAKER_PRESETS, CHEER_PRESETS, ACTIVEWEAR_PRESETS, MMA_RASHGUARD_PRESETS, BOXING_GLOVE_PRESETS, AMERICAN_FOOTBALL_PRESETS, TRACKSUIT_PRESETS, AI_MODEL_ETHNICITY, AI_MODEL_AGE, AI_MODEL_SCENE, AI_MODEL_ACTION, TechPackData, SourcingTechPackData, CustomizationParams, SocialPlatform, TrendPrompt } from '../types';
import { Profile } from "../contexts/AuthContext";

// MODELS
const TEXT_MODEL = 'gemini-3-pro-preview';
const IMAGE_MODEL = 'gemini-3-pro-image-preview';

// Helper to get client with current key
const getClient = (providedApiKey?: string) => {
  const apiKey = providedApiKey || localStorage.getItem('gemini_api_key');
  if (!apiKey) throw new Error("API Key not found. Please set it in Settings.");
  return new GoogleGenerativeAI(apiKey);
};

export const checkApiKey = async (providedApiKey?: string): Promise<boolean> => {
  return !!(providedApiKey || localStorage.getItem('gemini_api_key'));
};

export const promptForApiKey = async (): Promise<void> => {
  // No-op, managed by UI now
};

/**
 * Extracts MIME type and raw base64 data from a Data URL
 */
const parseDataUrl = (dataUrl: string) => {
  const regex = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/;
  const matches = dataUrl.match(regex);
  if (matches) {
    return { mimeType: matches[1], data: matches[2] };
  }
  return { mimeType: 'image/png', data: dataUrl };
};

/**
 * Retry utility for handling transient 503/429 errors
 */
const retryOperation = async <T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    let errString = "";
    try { errString = error.message || String(error); } catch (e) { errString = "Unknown"; }

    const isTransient =
      error.status === 503 ||
      error.status === 500 ||
      errString.includes('503') ||
      errString.includes('overloaded') ||
      errString.includes('Service Unavailable') ||
      errString.includes('Internal Server Error');

    if (isTransient && retries > 0) {
      console.warn(`Operation failed with ${error.status || 'error'}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
};

const generateWithFallback = async (
  ai: GoogleGenerativeAI,
  primaryModel: string,
  fallbackModel: string,
  contents: any,
  config: any
): Promise<GenerateContentResult> => {
  const callModel = async (modelName: string, cfg: any) => {
    const model = ai.getGenerativeModel({
      model: modelName,
      generationConfig: cfg
    });
    // contents is { parts: [...] } based on usage
    return await model.generateContent(contents.parts || contents);
  };

  try {
    return await retryOperation<GenerateContentResult>(() => callModel(primaryModel, config));
  } catch (error: any) {
    let errString = "";
    try { errString = error.message || String(error); } catch (e) { errString = "Unknown error"; }

    const shouldFallback =
      (error.status === 429) ||
      (error.status === 503) ||
      (error.status === 500) ||
      (error.status === 404) ||
      errString.includes('RESOURCE_EXHAUSTED') ||
      errString.includes('Quota exceeded') ||
      errString.includes('limit: 0') ||
      errString.includes('overloaded') ||
      errString.includes('Service Unavailable') ||
      errString.includes('not found');

    if (shouldFallback) {
      const fallbackConfig = { ...config };
      if (fallbackConfig.imageConfig) {
        const { imageSize, ...restImageConfig } = fallbackConfig.imageConfig;
        fallbackConfig.imageConfig = restImageConfig;
      }
      return await retryOperation<GenerateContentResult>(() => callModel(fallbackModel, fallbackConfig));
    }
    throw error;
  }
};

export const generateConceptDescriptions = async (category: string, gender: Gender, preset?: string, detail?: string, outputStyle?: 'genz' | 'minimalistic' | 'genz-us' | 'european', customPrompt?: string, inspirationImage?: string | null, branding?: Profile['branding'], apiKey?: string, customizationParams?: CustomizationParams): Promise<Omit<Concept, 'imageBase64'>[]> => {
  const ai = getClient(apiKey);
  const brandName = branding?.enabled && branding.companyName ? branding.companyName : 'AZELIFY';
  const brandInstruction = branding?.enabled ? `USE THE BRAND NAME "${brandName}" for all graphics and branding. INTEGRATE THE PROVIDED LOGO CREATIVELY.` : `Use the brand name "${brandName}" if branding is needed.`;

  let styleInstruction = '';
  if (outputStyle === 'genz-us') {
    styleInstruction = 'The design MUST be tailored for the US-based Black American Gen Z audience. Focus on stacked/baggy fits, unconventional fabrics like velour or coated denim, and unique embellishments like rhinestone patterns or puff prints.';
  } else if (outputStyle === 'european') {
    styleInstruction = 'The design MUST be tailored for a European audience. Focus on clean, tailored silhouettes, technical fabrics, and minimalist details.';
  }

  // Helper to build customization string
  let customizationInstruction = '';
  if (customizationParams && customizationParams.mode === 'custom') {
    const { colors, techniques, graphics, vibe } = customizationParams;
    customizationInstruction = `
      USER CUSTOMIZATION REQUIREMENTS (STRICTLY FOLLOW THIS LAYER):
      - Color Palette: ${colors || "Ai-Curated"}
      - Embellishment Techniques: ${techniques?.join(', ') || "None"}
      - Graphic Style: ${graphics?.join(', ') || "None"}
      - Core Vibe: ${vibe || "None"}
      
      Integrate these specific user choices into the design DNA naturally.
    `;
  }

  let prompt = '';
  let parts: any[] = [];

  const isCustomMode = customizationParams?.mode === 'custom';
  const hasInspiration = !!inspirationImage;
  const hasCustomPrompt = !!customPrompt;

  // Unified Logic: If ANY custom input exists (Image, Text, or UI Params), use the complex prompt structure
  if (isCustomMode || hasCustomPrompt || hasInspiration) {
    const promptText = `Act as a Master Fashion Designer & Creative Director.
      TASK: Create 2 distinct ${gender} ${category} concepts.
      
      ${hasInspiration ? `
      STEP 1: DECONSTRUCTION ANALYSIS
      Analyze the provided INSPIRATION IMAGE deeply to extract:
      - Product Type & Silhouette (e.g. Boxy Hoodie, Flared Track Pants, Oversized Puffer)
      - Material & Texture (e.g. Heavyweight French Terry, Nylon Crinkle, Distressed Denim, Velour)
      - Embellishment Techniques (e.g. Chenille Patches, Puff Print, Rhizome Embroidery, Acid Wash, Distressing)
      - Design Philosophy/Core Vibe (e.g. Y2K Futurist, Grunge Opulence, Utilitarian, Retro-Sport)
      
      STEP 2: RE-CREATION & DESIGN SYNTHESIS
      Using the extracted "DNA" from Step 1, design 2 NEW, ORIGINAL concepts.
      - The goal is to create a "Spiritual Successor" to the image, NOT a copy.
      - Maintain the same Vibe, Material Quality, and Complexity Level.
      - REINVENT the graphics, cutlines, and colorblocking.
      - If the image uses heavy patchwork, design a NEW patchwork layout.
      - If the image features specific text, replace it with 'CULTUREPIECE' branding or abstract shapes.
      ` : ''}
      ${hasCustomPrompt ? `User Request Overlay: "${customPrompt}". Integrate this request into the design evolution.` : ''}
      ${customizationInstruction}
      
      Output Strategy:
      - Aesthetic: High-fashion, Premium, Market-Ready.
      - Detailing: Be extremely specific about fabric weights, print techniques (e.g. "Screenprint with Puff additive"), and fit.
      
      CRITICAL: The output MUST be for ${category}. Do not hallucinate other items.
      
      Return JSON with id, title, description. Description must be a self-contained, highly detailed prompt for an image generator.
      ${brandInstruction}`;

    parts.push({ text: promptText });
    if (inspirationImage) {
      parts.push({ inlineData: parseDataUrl(inspirationImage) });
    }
  } else {
    let presetInstruction = "";
    if (category === 'Soccer Uniforms' && preset) {
      if (preset === 'Neo-Retro Revival') presetInstruction = "Style: Neo-Retro Revival. Inspiration from 1980s and 90s. Features heavy collars (Polo or V-neck with trim), bold geometric shapes, and 'busy' textures.";
      else if (preset === 'Minimalist Luxury') presetInstruction = "Style: Minimalist Luxury. Clean, solid colors with high-end detailing like metallic gold accents, monochrome badges, and 'Sail' (off-white) tones.";
      else if (preset === 'Topographic AOP') presetInstruction = "Style: Topographic & Cultural Textures. Use geographical maps, local architecture, or traditional art as a subtle 'all-over print' (AOP).";
      else if (preset === 'Gradient Fade') presetInstruction = "Style: Gradient Fade / Ombré. Transition from a primary color to a darker or neutral shade (black/white). Modern speed aesthetic.";
    } else if (category === 'Baseball Jersey' && preset) {
      // Baseball Manufacturing Standards
      const manufacturingGuidelines = "MANUFACTURING STANDARDS: Fabric must be HEAVY 2023-style polyester (NOT Vapor Premier) for shape retention. Player names must be LARGE 4-inch wide lettering. Use Tackle Twill for authentic look, Sublimation for gradients.";

      if (preset === 'Powder Blue Throwback') presetInstruction = `Style: Powder Blue Throwback. 1970s/80s retro aesthetic. Primary color: Powder Blue. MUST use classic cursive script font for team name. ${manufacturingGuidelines}`;
      else if (preset === 'City Connect / Localized Art') presetInstruction = `Style: City Connect / Localized Art. Inspired by MLB City Connect. Incorporate local landmarks, area codes, or neighborhood nicknames into the design. Bold, hyper-local branding. ${manufacturingGuidelines}`;
      else if (preset === 'The Pinstripe Classic') presetInstruction = `Style: The Pinstripe Classic. Modern update to vertical stripes. Use 'Broken Pinstripes' or pinstripes made of repeating micro-text (e.g. team slogan). ${manufacturingGuidelines}`;
      else if (preset === 'Sublimated Gradients') presetInstruction = `Style: Sublimated Gradients (Digital Look). Digital fade effect (e.g., Navy fading into Electric Blue) or camouflage patterns directly printed into fabric fibers. ${manufacturingGuidelines}`;
    } else if (category === 'Ice Hockey Uniform' && preset) {
      // Hockey Manufacturing Standards (2026)
      const manufacturingGuidelines = "MANUFACTURING STANDARDS: Shoulders must be 'Dimpled' (laser-cut ventilation/honeycomb texture). Elbows must be Double-Layer (high-denier polyester) to prevent board burn. Authentic Pro cut with fight straps.";

      if (preset === 'Deep Frost Gradient') presetInstruction = `Style: Deep Frost Gradient. Blending icy colors (Navy to Frost Blue) using high-definition sublimation. Modern travel team look. ${manufacturingGuidelines}`;
      else if (preset === 'Matte Blackout') presetInstruction = `Style: Matte Blackout. Non-reflective, matte-finish fabrics with charcoal 'phantom' striping. Aggressive, stealth look. ${manufacturingGuidelines}`;
      else if (preset === 'The Centennial Classic') presetInstruction = `Style: The Centennial Classic. Traditional wool-feel. Oversized horizontal chest stripes, felt patches, and chain-stitched logos. Vintage aesthetic. ${manufacturingGuidelines}`;
      else if (preset === 'Symmetry-Break') presetInstruction = `Style: Symmetry-Break. Asymmetrical sleeve colors or diagonal typography across the chest. Bold, City-Connect identity. ${manufacturingGuidelines}`;
    } else if (category === 'Puffer Jackets' && preset) {
      if (preset === 'Architectural Maxi') presetInstruction = "Style: Architectural Maxi (Floor-Length). High-fashion statement. Floor-sweeping duvet volume, oversized fit. Fabric: Iridescent liquid satin/nylon (DWR finish). Details: Jumbo plastic zippers, hidden magnetic flaps, interior carry straps. Large horizontal or chevron quilt baffles.";
      else if (preset === 'Boxy Crop') presetInstruction = "Style: Boxy Crop (Streetwear). Waist-skimming cropped fit, exaggerated sleeve volume, boxy shoulders. Fabric: Matte 'Peach Skin' microfiber or Faux Leather (PU). Details: Exposed metallic #10 zippers, jumbo bungee-cord toggles at hem. Minimalist quilting (2-3 wide sections).";
      else if (preset === 'Hybrid Barn') presetInstruction = "Style: Hybrid Barn Puffer (Workwear). Relaxed hip-length, traditional workwear silhouette. Corduroy or leather collar. Fabric: Waxed Canvas, 700-fill down. Details: Brass snap buttons (no zippers), large bellows cargo pockets. Diamond or 'Onion' wave-like quilting patterns.";
      else if (preset === 'Tech-Modular') presetInstruction = "Style: Tech-Modular Vest (Gilet). Tactical layering piece, modular/adjustable. Zippered side-vents. Fabric: Ripstop Grid or transparent 'see-through' nylon. Details: MOLLE-style webbing, D-rings, YKK Aquaguard zippers. Micro-square or geometric grid quilting.";
      else if (preset === 'Cinched Hourglass') presetInstruction = "Style: Cinched Hourglass (Luxury). Fitted female silhouette, built-in elasticated belt or internal drawstring. Fabric: Technical wool-blend or Cashmere-touch polyester. Details: Polished Gold/Rose-Gold hardware, funnel neck with shearling lining. Slimming vertical side-quilting.";
      else if (preset === 'Retro-Alpine Gilet') presetInstruction = "Style: Retro-Alpine Sleeveless Gilet. 1970s outdoor heritage. Contrasting western-style shoulder yokes (leather or suede). Snap button front. Fabric: Vintage-look ripstop nylon in vibrant colors (Orange, Forest Green). Details: High stand collar, authentic down-fill look.";
      else if (preset === 'Stealth Utility Vest') presetInstruction = "Style: Stealth Utility Sleeveless Puffer. Urban tactical aesthetic. Matte black finish. Fabric: High-denier water-resistant shell. Details: Internal hidden storage pockets, laser-cut ventilation holes, minimalist flat seams. Thin, dense baffles for a low-profile look.";
      else if (preset === 'Duvet Wrap Vest') presetInstruction = "Style: Duvet Wrap Sleeveless Vest. Extreme comfort and volume. High-shine glossy finish. Fit: Oversized wrap-around front with off-center closure. Details: Extreme funnel neck that covers the chin, hidden magnetic closures, extra-thick baffles for 'cloud-like' appearance.";
    } else if (category === 'Basketball Uniform' && preset) {
      const manufacturingGuidelines = "MANUFACTURING STANDARDS: Use moisture-wicking high-performance micro-mesh. Armholes and necklines must have wide ribbed trim. Hem must be side-vented for movement. Reinforced flatlock stitching.";

      if (preset === 'Vapor Knit Pro') presetInstruction = `Style: Vapor Knit Pro (Elite Performance). Ultra-modern tight fit. Body-mapped ventilation zones (laser-cut holes). Geometric sublimated side panels. Metallic heat-press numbering. ${manufacturingGuidelines}`;
      else if (preset === 'Heritage Classic') presetInstruction = `Style: Heritage Classic (Retro). Wide armholes, loose-fit jersey. Heavyweight mesh fabric. Traditional rounded neck, thick multi-stripe ribbed trim. Arch-style team name typography. ${manufacturingGuidelines}`;
      else if (preset === 'Neighborhood League') presetInstruction = `Style: Neighborhood League (Streetball). Oversized fit. Bold all-over prints (AOP) like concrete textures or graffiti. Large center chest motifs. High-contrast colorways. ${manufacturingGuidelines}`;
      else if (preset === 'Tech-Knit Identity') presetInstruction = `Style: Tech-Knit Identity (Digital). Modern jacquard-knit patterns. Digital glitch textures or 'Cyberpunk' aesthetics. Iridescent or reflective logos. ${manufacturingGuidelines}`;
      else if (preset === 'City Connect Legacy') presetInstruction = `Style: City Connect Legacy (Cultural). Focus on local city identity. Incorporate neighborhood nicknames, local icons, or special script fonts unique to a specific city culture. ${manufacturingGuidelines}`;
    } else if (category === 'Windbreaker Jackets' && preset) {
      const manufacturingGuidelines = "MANUFACTURING STANDARDS: Use lightweight, wind-resistant DWR (Durable Water Repellent) finish nylon. All seams must be heat-sealed or double-stitched for weather proofing. Include adjustable bungee toggles at hem and hood.";

      if (preset === 'Urban Techshell') presetInstruction = `Style: Urban Techshell (Modern). Matte-finish performance fabrics. Technical waterproof zippers. Modular pocket systems with laser-cut detailing. Asymmetric closures. ${manufacturingGuidelines}`;
      else if (preset === 'Retro Color-Block') presetInstruction = `Style: Retro Color-Block (90s Heritage). Vibrant contrasting panels (e.g. Teal/Purple/Neon). Crinkle nylon texture. Loose, oversized fit. Wide elasticated cuffs. ${manufacturingGuidelines}`;
      else if (preset === 'Trail Performance') presetInstruction = `Style: Trail Performance (Active). Ultra-lightweight ripstop nylon. Fully packable into its own pocket. Reflective trim/logos for visibility. Slim, athletic fit. ${manufacturingGuidelines}`;
      else if (preset === 'Minimalist Coach') presetInstruction = `Style: Minimalist Coach Jacket. Fold-down collar. Snap-button front closure (no zippers). Sleek satin-finish nylon. Welt waist pockets. Clean, professional look. ${manufacturingGuidelines}`;
      else if (preset === 'Quarter-Zip Popover') presetInstruction = `Style: Quarter-Zip Popover (Anorak). Large front kangaroo pocket with storm flap. Pullover design with neck-to-chest zipper. Bungee toggles at waist. Urban streetwear aesthetic. ${manufacturingGuidelines}`;
    } else if (category === 'Cheerleading Uniform' && preset) {
      const manufacturingGuidelines = "MANUFACTURING STANDARDS: Use premium high-performance power-stretch spandex/polyester blends. Motion-optimized cuts for tumbling. Reinforced seams. Use high-gloss trims and heat-sealed embellishments (rhinestones/glitter).";

      if (preset === 'Elite All-Star') presetInstruction = `Style: Elite All-Star (Competition). High-flash aesthetic. Intricate multi-panel construction. Extensive use of rhinestones and metallic foils. Keyhole backs or crop-top options. Bold, aggressive team branding. ${manufacturingGuidelines}`;
      else if (preset === 'Sideline Classic') presetInstruction = `Style: Sideline Classic (Traditional). Clean, collegiate look. V-neck shell top with knife-pleated skirt. Contrast wide-ribbon trim. Traditional block lettering. Focus on heritage colors. ${manufacturingGuidelines}`;
      else if (preset === 'High-Flash Performance') presetInstruction = `Style: High-Flash Performance. Mixed textures (matte vs shiny). Power-mesh inserts for ventilation. Holographic or iridescent trim details. Modern, athletic speed-lines. ${manufacturingGuidelines}`;
      else if (preset === 'Modern Minimalist') presetInstruction = `Style: Modern Minimalist. Sleek, seamless-look construction. Monochromatic or tonal color palettes. Subtle embossed branding. Tech-focused clean aesthetic. ${manufacturingGuidelines}`;
      else if (preset === 'Sublimated Motion') presetInstruction = `Style: Sublimated Motion. Vibrant all-over-printed (AOP) gradients. Dynamic swirling patterns. Lightweight, single-layer feel. Artistic and fluid visual energy. ${manufacturingGuidelines}`;
    } else if (category === 'Activewear' && preset) {
      const manufacturingGuidelines = "MANUFACTURING STANDARDS: Use moisture-wicking 4-way stretch fabrics (spandex/nylon blends). Antimicrobial finish. Flatlock seams to prevent chafing. Squat-proof opacity. Include reflective heat-transfer logos for low-light safety.";

      if (preset === 'Performance Compression') presetInstruction = `Style: Performance Compression (Elite). High-tension muscle support panels. Laser-cut ventilation in high-sweat areas. Bonded seams for a second-skin feel. Aggressive athletic blocking. ${manufacturingGuidelines}`;
      else if (preset === 'Seamless Flow') presetInstruction = `Style: Seamless Flow (Yoga/Pilates). Engineered knit with zero side-seams. Tonal textures and ribbing details. High-waisted compression bands. Soft, brushed 'peach' touch. ${manufacturingGuidelines}`;
      else if (preset === 'Urban Athleisure') presetInstruction = `Style: Urban Athleisure (Street-Ready). Relaxed but tapered fits. Incorporation of utility pockets and tech-wear aesthetics (cargo straps, buckle details). Matte-finish luxury fabrics. ${manufacturingGuidelines}`;
      else if (preset === 'High-Impact Training') presetInstruction = `Style: High-Impact Training. Reinforced panels in high-abrasion zones (knees/elbows). Extra-breathable wide-hole mesh inserts. Robust construction for heavy movement. ${manufacturingGuidelines}`;
      else if (preset === 'Discovery Trail') presetInstruction = `Style: Discovery Trail (Outdoor Active). Lightweight water-repellent (DWR) coating. Built-in UV protection. Integrated storage loops for gear. Earth-tone palettes. ${manufacturingGuidelines}`;
      else if (preset === 'Recovery Lounge') presetInstruction = `Style: Recovery Lounge. Heavyweight premium French Terry or fleece-back jersey. Oversized, slouchy silhouettes. Focus on extreme comfort and thermal regulation. ${manufacturingGuidelines}`;
    } else if (category === 'MMA Rashguards' && preset) {
      const manufacturingGuidelines = "MANUFACTURING STANDARDS: Use ultra-durable, heavyweight 4-way stretch spandex/polyester (250+ GSM). Triple-lock flatlock stitching for maximum seam strength. Anti-microbial and moisture-wicking treatment. Silicone anti-slip waistband. Sublimated graphics only (zero feel, will not peel).";

      if (preset === 'Long Sleeve Pro-Fit') presetInstruction = `Style: Long Sleeve Pro-Fit. Full arm coverage for protection against mat burn. Anatomical compression fit. Minimalist side-paneling. Reinforced neck collar. ${manufacturingGuidelines}`;
      else if (preset === 'Short Sleeve Performance') presetInstruction = `Style: Short Sleeve Performance. Tapered short sleeves. Maximum airflow and freedom of movement. Underarm mesh ventilation zones. High-mobility raglan cut. ${manufacturingGuidelines}`;
      else if (preset === 'Samurai Heritage AOP') presetInstruction = `Style: Samurai Heritage (Traditional Art). Full-body 'All-Over-Print' (AOP) featuring traditional Japanese iconography (Ukiyo-e style, Oni masks, Katana motifs). Deep, rich color saturation. ${manufacturingGuidelines}`;
      else if (preset === 'Cyber-Tech Modern') presetInstruction = `Style: Cyber-Tech Modern. Futuristic aesthetic. Digital glitch textures, neon circuit-line accents (Electric Green/Cyber Pink). Geometric 'armor' paneling visuals. ${manufacturingGuidelines}`;
      else if (preset === 'Rank-Based Minimalist') presetInstruction = `Style: Rank-Based Minimalist. Clean, professional look following Jiu-Jitsu belt hierarchy colors (White, Blue, Purple, Brown, Black). Contrasting sleeve colors or shoulder accents. ${manufacturingGuidelines}`;
      else if (preset === 'Street-Combat Style') presetInstruction = `Style: Street-Combat Style. Gritty, urban aesthetic. Distressed textures, graffiti-style typography, and bold 'underground' branding imagery. High-contrast monochromatic or dark palettes. ${manufacturingGuidelines}`;
    } else if (category === 'American Football Uniform' && preset) {
      const manufacturingGuidelines = "MANUFACTURING STANDARDS: Jersey must have reinforced 2-ply high-denier shoulders (Pro-cut). Spandex/Elastane side panels (Eagles or Cowboys style). Elasticated sleeve cuffs. Heavyweight 4-way stretch pants with internal pad pockets and a no-fly front. Double-stitched flatlock seams.";
      const accessoryConstraint = "CRITICAL CONSTRAINT: ONLY generate the Jersey (top) and Pants (bottom). DO NOT generate helmets, gloves, socks, or cleats. Focus purely on the garment construction.";

      if (preset === 'Gridiron Pro-Fit') presetInstruction = `Style: Gridiron Pro-Fit. Ultra-tapered compression fit. Contrasting color side-paneling. Matte finish logos. Clean, modern athletic aesthetic. ${manufacturingGuidelines} ${accessoryConstraint}`;
      else if (preset === 'Classic Varsity') presetInstruction = `Style: Classic Varsity. Traditional tackle-twill numbering with border contrast. Pinstripe accents on sleeves and pants. Iconic collegiate colorways. ${manufacturingGuidelines} ${accessoryConstraint}`;
      else if (preset === 'Sublimated Speed') presetInstruction = `Style: Sublimated Speed. Vibrant digital gradients fading from chest to hem. Intricate honeycomb or glitch-texture overlays. Lightweight breathable mesh areas. ${manufacturingGuidelines} ${accessoryConstraint}`;
      else if (preset === 'Retro-Bowl Classic') presetInstruction = `Style: Retro-Bowl (80s/90s). Exaggerated horizontal block numbering. Vibrant primary colors. Classic striped shoulder yokes. Loose, boxy feel. ${manufacturingGuidelines} ${accessoryConstraint}`;
      else if (preset === 'Urban Combat') presetInstruction = `Style: Urban Combat. All-black or monochromatic charcoal palettes. Matte and gloss texture contrast on panels. Stealth branding. Military-inspired design language. ${manufacturingGuidelines} ${accessoryConstraint}`;
    } else if (category === 'Boxing Gloves' && preset) {
      const manufacturingGuidelines = "MANUFACTURING STANDARDS: Use premium cowhide leather or high-grade microfiber for the shell. Padding must be multi-layered foam (including Latex and EVA) with optional Gel or Horsehair inserts. Must include reinforced wrist support (Lace-up or Hook-and-Loop) and moisture-wicking antimicrobial lining.";

      if (preset === 'Training (Multi-Purpose)') presetInstruction = `Style: Training (All-Rounder). Balanced padding distribution for bag, pad, and light sparring work. Focus on hand protection and versatility. ${manufacturingGuidelines}`;
      else if (preset === 'Heavy Bag Focus') presetInstruction = `Style: Heavy Bag Specialist. Extra-dense padding in the knuckle area to withstand repetitive heavy impact. Focus on durability and hand safety. ${manufacturingGuidelines}`;
      else if (preset === 'Sparring (16oz+)') presetInstruction = `Style: Sparring Safety. Oversized, soft padding (14-16oz+) to protect both the user and the sparring partner. Rounded 'pillow' shape. ${manufacturingGuidelines}`;
      else if (preset === 'Competition (Lace-Up)') presetInstruction = `Style: Professional Competition. Compact, streamlined design. Lace-up closure for maximum wrist stability and customized fit. Lighter padding (8-10oz) for high impact. ${manufacturingGuidelines}`;
      else if (preset === 'Mexican Style') presetInstruction = `Style: Mexican-Style Power. Compact design with long cuffs for wrist support. Traditional horsehair/foam hybrid padding for a 'punchers' feel. ${manufacturingGuidelines}`;
      else if (preset === 'Muay Thai Hybrid') presetInstruction = `Style: Muay Thai Versatile. More uniform padding distribution for blocking kicks. Flexible grip bar for clinching. Shorter, more padded cuff. ${manufacturingGuidelines}`;
    } else if (category === 'Tracksuits' && preset) {
      if (preset === 'Running Performance') presetInstruction = "Style: Running Performance Tracksuit. Slim, tapered fit for aerodynamics. Fabric: Lightweight, moisture-wicking Polyester/Spandex blend (Dri-Fit or similar). Details: Laser-cut ventilation holes, reflective 3M piping for visibility, articulated knees, zippered ankle cuffs.";
      else if (preset === 'Urban Streetwear (Heavyweight)') presetInstruction = "Style: Urban Streetwear (Heavyweight). Oversized, boxy hoodie and stacked sweatpants. Fabric: 450GSM+ Heavyweight Cotton French Terry (100% Cotton). Details: Dropped shoulders, raw-edge hems, puff-print graphics, extended drawstrings, garment-dyed wash.";
      else if (preset === 'Velour Luxury') presetInstruction = "Style: Velour Luxury Suit (Y2K Aesthetic). Plush, soft texture. Fabric: Premium Cotton/Poly Velour blend (300GSM). Details: Gold or Chrome hardware (zippers/aglets), rhinestone embellishments on back/chest, ribbed elastic waistband. Matching jacket and flared pants.";
      else if (preset === 'Windbreaker Set (Nylon)') presetInstruction = "Style: Retro Windbreaker Set. 90s Sportswear aesthetic. Fabric: Crinkle Nylon or Ripstop with DWR (Water Repellent) finish. Mesh lining. Details: Color-blocked panels (geometric), elasticated cuffs and hem, oversized fit. High-neck zip jacket.";
      else if (preset === 'Tech-Fleece Utility') presetInstruction = "Style: Tech-Fleece Utility. Modern, engineered fit. Fabric: Double-knit Cotton/Poly blend (Spacer fabric) for warmth without weight. Smooth matte finish. Details: Bonded heat-sealed black zippers, articulated darting for shape, multi-pocket utility design.";
      else if (preset === 'Retro-Sport Poly') presetInstruction = "Style: Retro-Sport Poly Tracksuit. Classic 80s/90s soccer/chav aesthetic. Fabric: 100% Polyester Tricot (Shiny finish). Details: Contrast side-taping down arms and legs, funnel neck jacket, ribbed cuffs. Slim to regular fit.";
    } else if (category === 'Leather Products' && preset) {
      if (preset === 'Cowhide Biker (Heavyweight)') {
        presetInstruction = `Style: Cowhide Biker Jacket (Heavyweight). Classic asymmetric 'Schott Perfecto' silhouette. 
        Material Details: Heavyweight 1.2-1.4mm Full-Grain Steerhide. Visible, pronounced grain texture. Rigid, durable structure.
        Hardware: Heavy gauge Nickel zippers (YKK #10), snap-down lapels, coin pocket.
        Finish: Semi-aniline or pigmented finish for durability.`;
      } else if (preset === 'Lambskin Bomber (Luxury)') {
        presetInstruction = `Style: Lambskin Bomber Jacket (Luxury). Relaxed but tailored fit (MA-1 or A-2 inspiration).
        Material Details: Premium Italian Lambskin (0.8mm gauge). Extremely soft, buttery hand feel. Fine, smooth grain with almost no texture.
        Hardware: Polished Gold or Silver zippers. Fine rib-knit cuffs and hem.
        Finish: Aniline finish (natural look) showing the leather's inherent beauty. Drapes like fabric.`;
      } else if (preset === 'Suede Trucker (Soft Nap)') {
        presetInstruction = `Style: Suede Trucker Jacket. Type III Denim Jacket silhouette reimagined in leather.
        Material Details: Split-Cowhide Suede or Goat Suede. Rich, velvet-like nap. Matte finish with depth.
        Hardware: Shank buttons (Brass or Copper). Two chest pockets with flaps.
        Finish: Water-resistant styling, but visually dry and textured.`;
      } else if (preset === 'Cafe Racer (Horsehide)') {
        presetInstruction = `Style: Cafe Racer Jacket. Minimalist warm-up silhouette with mandarin collar.
        Material Details: Horsehide Leather (Front Quarter). Extremely dense, stiff, and glossy. High sheen finish.
        Hardware: Single center zip, zippered cuffs. Minimal detailing.
        Finish: 'Tea-Core' potential (brown showing through black on edges). Rigid armor-like appearance.`;
      } else if (preset === 'Shearling Aviator (Sheepskin)') {
        presetInstruction = `Style: Shearling Aviator (B-3 Style). Oversized, voluminous winter jacket.
        Material Details: Genuine Double-Faced Sheepskin. Exterior is Nappa leather (smooth); Interior is thick, plush Merino wool fleece (visible at collar/cuffs).
        Hardware: Leather buckle throat latch, side waist adjuster belts.
        Finish: Distressed or antique finish on the leather side.`;
      } else if (preset === 'Distressed Bison (Vintage)') {
        presetInstruction = `Style: Distressed Bison Leather Jacket. Rugged, workwear aesthetic.
        Material Details: American Bison (Buffalo) leather. Deep, distinct pebble grain structure. Very strong and thick (1.5mm+).
        Finish: Heavily distressed / "Worn-in" look. Patina around seams and elbows.`;
      }
    } else if (category === 'Moto Racing Suits' && preset) {
      if (preset === 'MotoGP Pro (Kangaroo Leather)') {
        presetInstruction = `Style: MotoGP Professional Race Suit. One-piece construction.
        Material Details: 0.9mm Kangaroo Leather. Ultra-lightweight and abrasion-resistant. Perforated zones for airflow.
        Safety Tech: Electronic Airbag System integration (LED indicator context). External Titanium sliders on shoulders, elbows, and knees. Aerodynamic back hump (hydration ready).
        Fit: Aggressive Race Fit (Pre-curved limbs). Inner Kevlar reinforcement.`;
      } else if (preset === 'Track Day (Cowhide Split)') {
        presetInstruction = `Style: Track Day Leather Suit (One-Piece).
        Material Details: 1.3mm Premium Bovine (Cowhide) Leather. Robust and durable.
        Safety Tech: CE Level 2 armor at impact zones. Replaceable PU knee sliders. Aerodynamic back hump.
        Fit: Sport Fit. Accordion stretch panels at knees and lower back for flexibility.`;
      } else if (preset === 'Street Sport (2-Piece)') {
        presetInstruction = `Style: Street Sport 2-Piece Suit. Jacket and pants connect via 360-degree zipper.
        Material Details: 1.25mm Cowhide Leather with stretch textile inserts.
        Safety Tech: Internal CE armor. External shoulder sliders. Reflective inserts for night visibility.
        Fit: Relaxed Sport Fit. Comfortable for upright riding position.`;
      } else if (preset === 'Adventure Touring (Textile/Gore-Tex)') {
        presetInstruction = `Style: Adventure Touring Suit (Textile). Long-distance capability.
        Material Details: Heavy-duty Cordura 600D/1000D reinforcements. Laminated Gore-Tex membrane (Waterproof/Breathable).
        Safety Tech: D3O Impact armor (soft/flexible). Large ventilation zippers (chest/thighs).
        Fit: Touring Fit (Layering ready). Multiple cargo pockets. High-visibility aesthetic.`;
      } else if (preset === 'Vintage Cafe (Classic Leather)') {
        presetInstruction = `Style: Vintage Cafe Racer LEATHER Suit. Retro 70s aesthetic.
        Material Details: Full-grain Aniline Cowhide. Quilted padding on shoulders and knees.
        Safety Tech: Hidden modern armor. Classic metal zippers. No external sliders.
        Fit: Slim, tailored fit. Cream/Red/Black stripes.`;
      } else if (preset === 'Drag Racing (Pro Mod)') {
        presetInstruction = `Style: Pro Mod Drag Racing Suit. SFI Certified.
        Material Details: Fire-resistant Nomex or heavy leather.
        Safety Tech: None-restrictive design for cockpit. SFI 3.2A/5 rating tags visible.
        Fit: Upright driving position. Minimal bulk. Straight leg boot cut.`;
      }
    }

    prompt = `Act as a high-end streetwear designer. Create 2 distinct ${gender} ${category} concepts. ${presetInstruction ? presetInstruction : `Aesthetic: ${styleInstruction || 'Black American Streetwear'}`}. 
    ${customizationInstruction}
    
    ${['Tracksuits', 'Moto Racing Suits', 'Soccer Uniforms', 'Basketball Uniform', 'Ice Hockey Uniform', 'American Football Uniform', 'Cheerleading Uniform', 'Street Sport (2-Piece)'].includes(category) ||
        (category === 'Moto Racing Suits' && preset !== 'MotoGP Pro (Kangaroo Leather)' && preset !== 'Track Day (Cowhide Split)')
        ? "PRESENTATION LAYOUT: Professional Apparel Knolling / Flat Lay Photography. The Top (Jacket/Jersey) and Bottom (Pants/Shorts) MUST be laid out SIDE-BY-SIDE on a clean background. DO NOT OVERLAP the items. DO NOT show a human model. Show the items clearly separated so the full silhouette of both pieces is visible."
        : ""
      }

    CRITICAL: ${category === 'Baseball Jersey' ? "Fabric must be heavy polyester. Names must be large (4-inch). Do NOT use real world trademarks." : category === 'Ice Hockey Uniform' ? `Shoulders must be dimpled/textured. Elbows reinforced. Do NOT use real world trademarks. Use '${brandName}' or generic logos.` : `DO NOT generate any real-world brand logos key (e.g. Nike, Adidas, Gucci). Use generic geometric shapes or the brand name '${brandName}' if branding is needed.`}
    Return JSON with id, title, description.`;
    parts.push({ text: prompt });
  }

  try {
    const response = await generateWithFallback(
      ai,
      TEXT_MODEL,
      'gemini-pro',
      { parts },
      {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.INTEGER },
              title: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING },
            },
            propertyOrdering: ["id", "title", "description"],
          },
        },
      }
    );

    let text = response.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating concepts:", error);
    throw error;
  }
};

export const generateConceptImage = async (conceptDesc: string, category: string, logoBase64?: string | null, branding?: Profile['branding'], apiKey?: string): Promise<string> => {
  const ai = getClient(apiKey);
  const effectiveLogo = (branding?.enabled && branding.logoBase64) ? branding.logoBase64 : logoBase64;
  const brandName = branding?.enabled && branding.companyName ? branding.companyName : '';

  let imagePrompt = `2D technical fashion flat sketch of ${category === 'Custom' ? 'fashion item' : category}. Details: ${conceptDesc}. High-end streetwear, clean lines, white background. No real brand logos.`;
  if (brandName) imagePrompt += ` Use branding for "${brandName}".`;

  const parts: any[] = [];
  if (effectiveLogo) {
    const { mimeType, data } = parseDataUrl(effectiveLogo);
    imagePrompt += `\nIntegrate the provided logo creatively on the garment.`;
    parts.push({ text: imagePrompt }, { inlineData: { mimeType, data } });
  } else {
    parts.push({ text: imagePrompt });
  }

  const response = await generateWithFallback(ai, IMAGE_MODEL, 'gemini-1.5-flash', { parts }, { imageConfig: { aspectRatio: "4:3" } });
  return response.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || "";
};

export const generateProductionAssets = async (
  baseImage: string,
  description: string,
  category: string,
  gender: Gender,
  onProgress?: (msg: string, percent: number) => void,
  branding?: Profile['branding'],
  apiKey?: string
): Promise<ProductionAssets> => {
  const ai = getClient(apiKey);
  const brandName = branding?.enabled && branding.companyName ? branding.companyName : '';
  const effectiveLogo = (branding?.enabled && branding.logoBase64) ? branding.logoBase64 : null;

  const generateVariant = async (action: string, refImage: string, aspectRatio: string = "1:1", extraContext: string = "", usePro: boolean = true): Promise<string> => {
    const { mimeType, data } = parseDataUrl(refImage);
    let fullPrompt = `Task: Create a photorealistic ${action} of the garment. Consistency: Exact same design/color/logo. No real-world brands. Design context: ${description}. ${extraContext}`;
    if (brandName) fullPrompt += ` Ensure branding for "${brandName}" is visible where appropriate.`;

    const parts: any[] = [{ text: fullPrompt }, { inlineData: { mimeType, data } }];
    if (effectiveLogo) {
      parts.push({ inlineData: parseDataUrl(effectiveLogo) });
      fullPrompt += ` Integrate the provided brand logo creatively on the ${action}.`;
    }

    const response = await generateWithFallback(ai, IMAGE_MODEL, 'gemini-1.5-flash', { parts }, { imageConfig: { aspectRatio: aspectRatio as any, imageSize: usePro ? "2K" : undefined } });
    return response.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || refImage;
  };

  // ONE BY ONE REQUESTS
  let frontAction = "Front View Flatlay";
  let backAction = "Back View Flatlay";
  let sideAction = "Side Profile";
  let closeupAction = "Texture Detail";

  if (category === 'Boxing Gloves') {
    frontAction = "Front View Studio (Pair)";
    backAction = "Back View Studio (Pair)";
    sideAction = "Right Side Perspective (Single Glove)";
    closeupAction = "Wrist Support and Padding Detail";
  }

  if (onProgress) onProgress("Rendering Front View...", 10);
  const front = await generateVariant(frontAction, baseImage, "1:1", "Photorealistic studio shot.", true);

  if (onProgress) onProgress("Rendering Back View...", 30);
  const back = await generateVariant(backAction, front, "1:1", "Show rear side.", true);

  if (onProgress) onProgress("Rendering Side Profile...", 50);
  const side = await generateVariant(sideAction, front, "1:1", "Side angle.", false);

  if (onProgress) onProgress("Rendering Texture Details...", 70);
  const closeup = await generateVariant(closeupAction, front, "1:1", "Macro zoom.", false);

  if (onProgress) onProgress("Finalizing Lifestyle Campaign...", 90);
  const lifestyle = await generateVariant("Lifestyle Campaign", front, "3:4", `Model: ${gender} Black American model in urban setting. Influencer style.`, true);

  if (onProgress) onProgress("Complete", 100);
  return { front, back, closeup, side, lifestyle };
};

export const generateGhostMannequin = async (frontImageB64: string, backImageB64: string | null, onProgress?: (msg: string, percent: number) => void, apiKey?: string): Promise<{ front: string; back: string | null }> => {
  const ai = getClient(apiKey);
  const frontInfo = parseDataUrl(frontImageB64);
  const frontPrompt = `Task: Transform photo into professional "ghost mannequin" e-commerce asset. Light gray background. Hyper-realistic 2K.`;
  const frontResponse = await generateWithFallback(ai, IMAGE_MODEL, IMAGE_MODEL, { parts: [{ text: frontPrompt }, { inlineData: frontInfo }] }, { imageConfig: { aspectRatio: "3:4", imageSize: "2K" } });
  const generatedFront = frontResponse.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || "";

  let generatedBack: string | null = null;
  if (backImageB64) {
    const backInfo = parseDataUrl(backImageB64);
    const backPrompt = `Create the BACK VIEW ghost mannequin image consistent with the generated front view.`;
    const backResponse = await generateWithFallback(ai, IMAGE_MODEL, IMAGE_MODEL, { parts: [{ text: backPrompt }, { inlineData: backInfo }, { inlineData: { mimeType: 'image/png', data: generatedFront } }] }, { imageConfig: { aspectRatio: "3:4", imageSize: "2K" } });
    generatedBack = backResponse.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || null;
  }
  return { front: generatedFront, back: generatedBack };
};

export const generateBanners = async (productImageB64: string, preset: string, aspectRatio: string, holiday?: string, deal?: string, branding?: Profile['branding'], apiKey?: string): Promise<string[]> => {
  const ai = getClient(apiKey);
  const prodInfo = parseDataUrl(productImageB64);
  const brandName = branding?.enabled && branding.companyName ? branding.companyName : '';
  const effectiveLogo = (branding?.enabled && branding.logoBase64) ? branding.logoBase64 : null;

  const mainPrompt = `Creative Director Task: Professional social media banner for streetwear. Preset: ${preset}. Holiday: ${holiday}. Deal: ${deal}. 2K quality. ${brandName ? `Brand: ${brandName}` : ""}`;

  const generate = async () => {
    const parts: any[] = [{ text: mainPrompt }, { inlineData: prodInfo }];
    if (effectiveLogo) {
      parts.push({ inlineData: parseDataUrl(effectiveLogo) });
    }
    const res = await generateWithFallback(ai, IMAGE_MODEL, IMAGE_MODEL, { parts }, { imageConfig: { aspectRatio: (aspectRatio === "4:5" || aspectRatio === "2:3" ? "3:4" : aspectRatio) as any, imageSize: "2K" } });
    return res.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || "";
  };

  // ONE BY ONE REQUESTS
  const banner1 = await generate();
  const banner2 = await generate();
  return [banner1, banner2];
};

export const regenerateProductionAsset = async (
  baseImage: string,
  conceptDesc: string,
  assetType: string,
  customPrompt: string,
  category: string,
  logoBase64?: string | null,
  branding?: Profile['branding'],
  apiKey?: string
): Promise<string> => {
  const ai = getClient(apiKey);
  const { mimeType, data } = parseDataUrl(baseImage);
  const brandName = branding?.enabled && branding.companyName ? branding.companyName : '';
  const effectiveLogo = (branding?.enabled && branding.logoBase64) ? branding.logoBase64 : logoBase64;

  // Construct a prompt that combines original design with new requests
  let fullPrompt = `Creative Direction Task: Revise the provided ${assetType} product photograph.
  Original Design Context: ${conceptDesc}
  Revision Request: "${customPrompt}"
  Category: ${category}.
  ${brandName ? `Brand: ${brandName}` : ""}
  
  Maintain the overall quality, lighting, and core architecture of the garment. Consistency is critical.
  High resolution, photorealistic, 4k, studio quality, white background (unless context implies otherwise).
  CRITICAL: NO real world brands.`;

  const parts: any[] = [
    { text: fullPrompt },
    { inlineData: { mimeType, data } }
  ];
  if (effectiveLogo) {
    parts.push({ inlineData: parseDataUrl(effectiveLogo) });
    fullPrompt += ` Ensure the provided brand logo is correctly integrated.`;
  }

  const response = await generateWithFallback(ai, IMAGE_MODEL, 'gemini-1.5-flash', { parts }, { imageConfig: { aspectRatio: "1:1" } });
  return response.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || "";
};

export const generateImageRevision = async (baseImage: string, prompt: string, apiKey?: string, referenceImageBase64?: string | null): Promise<string> => {
  const ai = getClient(apiKey);
  const { mimeType, data } = parseDataUrl(baseImage);
  let fullPrompt = `Creative Direction Task: Revise the provided product image based on this specific request: "${prompt}".
  Maintain the overall quality and lighting. Consistency with the original garment is key unless otherwise specified.
  CRITICAL: NO real world brand logos. High resolution, professional studio quality.`;

  const parts: any[] = [
    { text: fullPrompt },
    { inlineData: { mimeType, data } }
  ];

  if (referenceImageBase64) {
    const ref = parseDataUrl(referenceImageBase64);
    parts.push({ inlineData: { data: ref.data, mimeType: ref.mimeType } });
    parts[0].text += `\n\nIMPORTANT: Use the second attached image as a visual reference (e.g., logo, pattern, or style guide) for the modification.`;
  }

  const response = await generateWithFallback(ai, IMAGE_MODEL, 'gemini-1.5-flash', { parts }, {
    imageConfig: { aspectRatio: "1:1", imageSize: "2K" }
  });

  return response.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || "";
};

/**
 * AI-powered garment editing (inpainting with mask)
 * @param baseImage The original garment image (base64)
 * @param maskImage The black/white mask image indicating edit area (base64)
 * @param prompt The edit instructions
 * @param apiKey Optional API key override
 */
export const editGarmentWithAI = async (baseImage: string, maskImage: string, prompt: string, apiKey?: string): Promise<string> => {
  const ai = getClient(apiKey);
  const { mimeType: baseMime, data: baseData } = parseDataUrl(baseImage);
  const { mimeType: maskMime, data: maskData } = parseDataUrl(maskImage);

  const fullPrompt = `Task: Perform an inpainting edit on the provided image using the associated mask.
  Edit Request: "${prompt}"
  The mask indicates where the changes should occur. Maintain stylistic continuity with the rest of the garment.
  CRITICAL: Professional fashion studio quality. High resolution output. No real-world brand logos.`;

  const response = await generateWithFallback(ai, IMAGE_MODEL, 'gemini-1.5-flash', {
    parts: [
      { text: fullPrompt },
      { inlineData: { mimeType: baseMime, data: baseData } },
      { inlineData: { mimeType: maskMime, data: maskData } }
    ]
  }, {
    imageConfig: { aspectRatio: "1:1", imageSize: "2K" }
  });

  return response.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || "";
};

export const generateModelPhotoshoot = async (
  productImageB64: string,
  modelType: 'ai' | 'real',
  modelImageB64?: string | null,
  aiConfig?: any,
  view: string = "Front View",
  previousResults?: Record<string, string>,
  branding?: Profile['branding'],
  apiKey?: string
): Promise<string> => {
  const ai = getClient(apiKey);
  const prodInfo = parseDataUrl(productImageB64);
  const brandName = branding?.enabled && branding.companyName ? branding.companyName : '';
  const effectiveLogo = (branding?.enabled && branding.logoBase64) ? branding.logoBase64 : null;
  const parts: any[] = [];

  if (modelType === 'real' && modelImageB64) {
    const modelInfo = parseDataUrl(modelImageB64);
    let referencePrompt = "";

    // Inject Previous Results as Context
    if (previousResults) {
      Object.entries(previousResults).forEach(([v, img]) => {
        if (img) {
          parts.push({ inlineData: parseDataUrl(img) });
          referencePrompt += ` REFERENCE VIEW INCLUDED: ${v}.`;
        }
      });
    }

    const prompt = `TASK: Virtual try-on. View: ${view}.
    PRIMARY GOAL: Render the garment from the [Product Image] onto the model.
    REFERENCE GOAL: Use [Reference Views] to ensure the model, background, and lighting are identical to the previous generations.
    
    CRITICAL RULES:
    1. The garment MUST remain the same. If the product is a Jersey, the Back View must be that same Jersey. Do NOT switch to a Hoodie, Jacket, or different outfit.
    2. Infer the design of the ${view} based on the [Product Image]. Maintain matching fabric, color, and style.
    3. Keep the model's pose and camera angle appropriate for a ${view}.
    4. ${brandName ? `Ensure the brand "${brandName}" is clearly visible and consistent with the product.` : "Maintain all branding from the product image."}
    
    ${referencePrompt}
    
    Output the requested angle (${view}). Perfect fit, drape, and lighting. 2K resolution.`;
    parts.push({ text: prompt }, { inlineData: prodInfo }, { inlineData: modelInfo });
    if (effectiveLogo) parts.push({ inlineData: parseDataUrl(effectiveLogo) });
  } else {
    const prompt = `TASK: Lifestyle photoshoot. ${aiConfig.gender} ${aiConfig.ethnicity} model (${aiConfig.age}) in ${aiConfig.scene} environment. Action: ${aiConfig.action}. Model must wear the exact garment from the product image. ${brandName ? `Highlight the "${brandName}" branding.` : ""} 2K resolution.`;
    parts.push({ text: prompt }, { inlineData: prodInfo });
    if (effectiveLogo) parts.push({ inlineData: parseDataUrl(effectiveLogo) });
  }

  const response = await generateWithFallback(ai, IMAGE_MODEL, 'gemini-1.5-flash', { parts }, { imageConfig: { aspectRatio: "3:4", imageSize: "2K" } });
  return response.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || "";
};

export const generateTechPack = async (imageBase64: string, quantity: number, apiKey?: string): Promise<TechPackData> => {
  const ai = getClient(apiKey);


  const promptText = `
    ACT AS A SENIOR TECHNICAL DESIGNER AND PRODUCTION MANAGER.
    Analyze the uploaded clothing image to generate a Professional Manufacturing Techpack.
    
    Target Quantity: ${quantity} units.

    Tasks:
    1. IDENTIFY: Product Name, Category, Fit (e.g., Oversized, Slim), and key Embellishments.
    2. FABRIC ANALYSIS: Estimate the Main Fabric type (e.g., Heavyweight French Terry), Composition (e.g., 100% Cotton), and Weight (GSM).
    3. CONSUMPTION & BOM (CRITICAL ACCURACY):
       - VISUAL COUNT: Count every visible button, snap, rivet, and zipper exactly. If you see 10 buttons, list 10. Do not hallucinate generic numbers.
       - MATERIAL UNITS:
         * LEATHER/SUEDE: Must be in SQUARE FEET (sq ft). Avg jacket = 45-50 sq ft.
         * FABRIC (Fleece, Poly, Cotton): Must be in METERS AND INCHES (e.g. "1.5m / 59 in").
       - MARKER CALCULATION: Assume standard 60-inch fabric width.
       - Create a Bill of Materials (BOM) listing Main Fabric, Trims, Labels.
       - For each BOM item, calculate Total Consumption for ${quantity} units.
    4. WEIGHT SPECS:
       - Estimate physical weight per piece (kg).
       - Estimate PACKAGING DIMENSIONS for a single folded unit (Length, Width, Height in CM). 
       - USE THESE BASELINES (Adjust for observed thickness):
          * T-Shirt/Top: 30x25x2 cm
          * Hoodie/Sweatshirt: 45x35x6 cm
          * Puffer Jacket (Compressed): 60x45x15 cm
          * Denim/Trousers: 35x30x4 cm
          * Shorts: 30x25x3 cm
          * Lightweight Jacket: 50x35x4 cm
          * Boxing Gloves: 40x20x15 cm (For a pair)
    5. SIZE CHART (For Apparel) or WEIGHT/SIZE (For Boxing Gloves):
       - For apparel: Provide base measurements (Chest, Length, Shoulder, Sleeve) for sizes S, M, L, XL.
       - For Boxing Gloves: Provide Hand Circumference (cm) and recommended user weight (kg) for glove sizes 10oz, 12oz, 14oz, 16oz.
       - For Leather Products: Include specialized notes like "Skiving" (thinning edges), "Edge Painting", and "Leather Needle Size (110/18 or 120/19)". 
       - Ensure grading is realistic for the identified silhouette/product.

    OUTPUT FORMAT (JSON ONLY):
    {
      "productInfo": { "name": "...", "category": "...", "fitResult": "...", "embellishments": "..." },
      "specs": { 
        "mainFabric": "...", 
        "weightGsm": 350, 
        "estimatedUnitWeightKg": 0.8, 
        "dimensionalWeightKg": 1.1,
        "packaging": { "lengthCm": 40, "widthCm": 30, "heightCm": 5 }
      },
      "bom": [
        { "component": "Main Fabric", "specification": "100% Cotton 350GSM", "unitConsumption": "1.6 yards", "totalConsumption": "..." }
      ],
      "sizeChart": {
        "S": { "Chest": "20", "Length": "26" },
        "M": { "Chest": "21", "Length": "27" },
        "L": { "Chest": "22", "Length": "28" },
        "XL": { "Chest": "23", "Length": "29" }
      }
    }
  `;

  try {
    const model = ai.getGenerativeModel({
      model: TEXT_MODEL,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const { mimeType, data } = parseDataUrl(imageBase64);

    const response = await model.generateContent([
      promptText,
      { inlineData: { mimeType, data } }
    ]);

    const jsonText = response.response.text();
    if (!jsonText) throw new Error("Empty response from AI");

    return JSON.parse(jsonText) as TechPackData;
  } catch (error) {
    console.error("Techpack Generation Failed", error);
    throw error;
  }
};

export const generateTechPackFromSourcing = async (imagesBase64: string[], totalQuantity: number, guidelines: string = "", apiKey?: string): Promise<SourcingTechPackData> => {
  const client = getClient(apiKey);

  const promptText = `
    ACT AS A SENIOR GARMENT TECHNICAL DESIGNER & SOURCING EXPERT.
    Generate a professional "Sourcing Tech Pack" by analyzing ALL uploaded assets collectively.
    
    ASSETS PROVIDED:
    - ${imagesBase64.length} images (Sketches, photos, or screenshots of conversations).
    - Custom Guidelines: ${guidelines || "No specific guidelines provided."}
    - Target Quantity: ${totalQuantity} units.

    INTELLIGENT ANALYSIS TASKS:
    1. CONSOLIDATE INFORMATION: Combine details from all images. If an image is a screenshot of a conversation (e.g., WhatsApp), extract specific requirements, fabric choices, or changes discussed.
    2. PRODUCT IDENTIFICATION: Identify the core garment (e.g., Heavyweight Oversized Hoodie).
    3. MEASUREMENT CHART: Extract/Estimate 6-8 key measurement points (e.g., Chest Width, Body Length) and provide grading for sizes S, M, L, XL, XXL.
    4. BOM (BILL OF MATERIALS): Identify ALL materials (Fabrics, Ribbing, Zippers, Drawstrings). Estimate consumption per unit.
    5. LOGO & EMBELLISHMENTS:
       - Identify ALL placements (Chest, back, sleeves, etc.).
       - Identify TECHNIQUES (Screen print, Puff print, 3D Embroidery, Chenille, etc.).
       - Extract/Estimate logo SIZES and COLORS.
    6. CONSTRUCTION NOTES: List 3-4 professional manufacturing notes (e.g., "Flatlock stitching throughout", "Reinforced kangaroo pocket").
    7. QC CHECKLIST: List 4 key quality control points based on the garment type.

    OUTPUT FORMAT (STRICT JSON):
    {
      "productInfo": { 
        "styleName": "...", 
        "date": "...", 
        "projectId": "...", 
        "category": "...", 
        "totalQuantity": ${totalQuantity},
        "description": "Brief summary of the product and identified features"
      },
      "measurements": [
        { "pointsOfMeasure": "...", "sizes": { "S": "...", "M": "...", "L": "...", "XL": "...", "XXL": "..." } }
      ],
      "bom": [
        { "item": "...", "description": "...", "colorCode": "...", "supplier": "...", "consumption": "..." }
      ],
      "embellishments": [
        { "type": "...", "technique": "...", "placement": "...", "size": "...", "color": "..." }
      ],
      "constructionNotes": ["...", "..."],
      "customizationRequests": "...",
      "qcChecklist": ["...", "..."]
    }
  `;

  try {
    const model = client.getGenerativeModel({
      model: TEXT_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    const response = await model.generateContent([
      promptText,
      ...imagesBase64.map(img => {
        const { mimeType, data } = parseDataUrl(img);
        return { inlineData: { mimeType, data } };
      })
    ]);

    const jsonText = response.response.text();
    if (!jsonText) throw new Error("Empty response from AI");
    return JSON.parse(jsonText) as SourcingTechPackData;
  } catch (error) {
    console.error("Sourcing Techpack Generation Failed", error);
    throw error;
  }
};

/**
 * Help Assistant: Provides answers about the CulturePiece Designer app.
 */
export const generateHelpAssistantResponse = async (query: string, apiKey?: string): Promise<string> => {
  const ai = getClient(apiKey);

  const systemPrompt = `
    YOU ARE THE "CULTUREPIECE SYSTEM CORE V2.04" AI ASSISTANT.
    Your mission is to help users navigate and understand the CulturePiece Designer application.
    
    ### APP KNOWLEDGE BASE:
    1. PURPOSE: Professional 2D/3D Streetwear Design & Production Suite.
    2. CORE MODES (Located in the Sidebar):
       - DESIGNER: Generate concepts, select styles (US/Euro/Team/MMA), then create high-fidelity production assets (Front, Back, Side, Detail).
       - GHOST MANNEQUIN: Upload flatlay photos to generate realistic 2K e-commerce ghost mannequin images.
       - BANNER STUDIO: Create marketing banners from product images with custom aspect ratios, holidays, and promo codes.
       - PHOTOSHOOT: AI Model try-ons (cast ethnicity, age, scene) or "Real Model" virtual try-on using user-uploaded photos.
       - APPARELS MASTER: Generate professional manufacturing Techpacks, BOM (Bill of Materials), and Size Charts. Includes logistics (weight/dimensions). Covers Apparel, MMA, and Boxing equipment.
       - REBRANDING: Iteratively edit existing product images using text prompts.
    3. UI INTERFACE:
       - Top Bar: Help Assistant (You) and Global Node Stats.
       - Sidebar: Main navigation between modes.
       - Category Matrix: A hierarchical grid (Streetwear, Team Athletics, MMA & Boxing).
    4. TECH: Powered by Gemini 2.0 Flash for logic and Google's high-fidelity image models for visuals.

    ### INSTRUCTIONS:
    - Respond as a high-tech, helpful AI core. Use a professional, slightly futuristic tone.
    - If asked about design: explain that user can start in "Designer Mode".
    - If asked about production: explain that user can start in "Apparels Master".
    - Keep responses concise but comprehensive (max 3-4 sentences).
    - If you don't know something specifically about the code, refer them to "System Support".
  `;

  try {
    const response = await generateWithFallback(
      ai,
      TEXT_MODEL,
      'gemini-pro',
      {
        parts: [
          { text: systemPrompt },
          { text: `USER QUESTION: ${query}` }
        ]
      },
      {}
    );
    return response.response.candidates?.[0]?.content?.parts?.[0]?.text || "I am currently processing mission data. Please repeat your query.";
  } catch (error) {
    console.error("Help Assistant Error", error);
    throw error;
  }
};

/**
 * Social Media Post Generator: Analyzes product image and creates platform-specific copy.
 */
export const generateSocialPost = async (
  imageBase64: string,
  platform: SocialPlatform,
  branding: string = "CulturePiece",
  apiKey?: string
): Promise<string> => {
  const ai = getClient(apiKey);
  const { mimeType, data } = parseDataUrl(imageBase64);

  let platformPrompt = "";
  if (platform === 'Instagram') {
    platformPrompt = "Style: Engaging, lifestyle-focused, use emojis. Structure: Hook -> Value -> Call to Action. Include 15-20 relevant hashtags. Focus on visual aesthetic.";
  } else if (platform === 'LinkedIn') {
    platformPrompt = "Style: Professional, industry-insight driven, minimal emojis. Structure: Professional Hook -> Business Value/Craftsmanship -> Call to Action. Include 3-5 professional hashtags. Focus on quality, business application, and innovation.";
  } else if (platform === 'TikTok') {
    platformPrompt = "Style: Viral, trendy, gen-z slang acceptable, high energy. Structure: Attention Grabber -> The 'Vibe' -> CTA. Include trending hashtags. Focus on hype and exclusivity.";
  } else if (platform === 'Pinterest') {
    platformPrompt = "Style: Descriptive, keyword-rich, inspirational. Structure: Clear Title -> Detailed Description -> CTA. Focus on aesthetics, styling tips, and mood.";
  } else if (platform === 'Facebook') {
    platformPrompt = "Style: Community-focused, conversational, shareable. Structure: Question/Hook -> Story -> Link/CTA. Focus on community and wearability.";
  }

  const prompt = `
    Act as a professional Social Media Manager for a high-end streetwear brand called '${branding}'.
    Analyze this product image.
    Write a complete social media post for ${platform}.
    
    ${platformPrompt}
    
    Output Format:
    HEADLINE: (Catchy hook)
    
    BODY: (The main caption text)
    
    HASHTAGS: (The list of hashtags)
  `;

  try {
    const response = await generateWithFallback(
      ai,
      TEXT_MODEL,
      'gemini-pro',
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data } }
        ]
      },
      {}
    );
    return response.response.text();
  } catch (error) {
    console.error("Social Post Generation Failed", error);
    throw error;
  }
};

export const generateTrendPrompts = async (category: string, gender: string, style?: string, apiKey?: string, market: string = 'USA'): Promise<TrendPrompt[]> => {
  const ai = getClient(apiKey);

  // Randomizers to force variety
  const subCultures = ["Cyberpunk", "Vintage 90s Sport", "Gorpcore", "Neo-Luxury", "Eco-Futurism", "Post-Apocalyptic", "High-Tech Utility", "Skate Culture", "Y2K Digital", "Avant-Garde Minimal"];
  const subCulture = subCultures[Math.floor(Math.random() * subCultures.length)];

  const prompt = `Act as a Global Fashion Trend Analyst specializing in the ${market} Market.
  
  RESEARCH PHASE:
  1. Analyze current 2026 fashion trends specifically within the ${market} region for the "${category}" industry.
     (e.g., If "MMA" + "Asia": Focus on Thai/Japanese martial arts aesthetics. If "Shorts" + "USA": Focus on American basketball/street culture.)
  2. Identify key colors, cuts, and materials popular in ${market} right now.
  
  DESIGN TASK:
  Generate 5 distinct, high-fashion design concepts for ${gender} ${category} tailored for the ${market} market.
  
  STRICT CONSTRAINT: 
  - The CORE garment must be "${category}". Do NOT generate jackets, coats, or full outfits unless they are secondary styling elements. 
  - If the category is "Shorts", every concept must focus on the design of the SHORTS themselves (cut, length, fabric, details).
  
  CORE DIRECTIVE:
  - Focus on "Practical Innovation": Designs must be wearable but use "Wild" patterns, cuts, or material mixes typical of ${market} high-fashion.
  - Vibe Injection: Infuse elements of ${subCulture} into the mix to ensure unique flavor.
  - ${style ? `User Style Influence: ${style}` : 'Avoid generic basics.'}
  
  Return a JSON array of 5 objects with:
  - id: number (1-5)
  - title: string (Creative name reflecting ${market} culture)
  - description: string (Highly detailed visual prompt for an image generator. Start with "A pair of ${category}..." to ensure focus. Specify fit, fabric weights, color palettes, and specific graphic placements based on your ${market} research.).
  `;

  try {
    const response = await generateWithFallback(
      ai,
      TEXT_MODEL,
      'gemini-pro',
      { parts: [{ text: prompt }] },
      {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.INTEGER },
              title: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING }
            },
            required: ["id", "title", "description"]
          }
        }
      }
    );
    const text = response.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text) as TrendPrompt[];
  } catch (error) {
    console.error("Trend Prompts Generation Failed", error);
    throw error;
  }
};

export const generateMasterGridImage = async (trendPrompt: TrendPrompt, category: string, apiKey?: string): Promise<string> => {
  const ai = getClient(apiKey);
  const prompt = `Fashion Design Masterpiece. Item: ${category}.
  Concept: ${trendPrompt.description}.
  Title: ${trendPrompt.title}.
  
  TASK: Create a Single High-Resolution Image containing 4 Distinct Views of this exact garment in a professional Flat Lay arrangement.
  
  LAYOUT CONFIGURATION (CRITICAL):
  - Top Left: Front View
  - Top Right: Back View
  - Bottom Left: Side Profile
  - Bottom Right: Close-up Texture/Detail
  
  The background must be a clean, neutral studio background.
  All 4 views must represent the EXACT SAME physical garment. Consistency is paramount.
  Photorealistic, 4K, Commercial Fashion Photography.
  NO REAL LOGOS. Use abstract branding if needed.
  `;

  const response = await generateWithFallback(ai, IMAGE_MODEL, 'gemini-1.5-flash', { parts: [{ text: prompt }] }, { imageConfig: { aspectRatio: "1:1", imageSize: "2K" } });
  return response.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || "";
};

export const processMasterGridToAssets = async (gridImage: string, trendPrompt: TrendPrompt, category: string, apiKey?: string): Promise<ProductionAssets> => {
  const ai = getClient(apiKey);
  const { mimeType, data } = parseDataUrl(gridImage);

  const generateView = async (viewName: string) => {
    const prompt = `Hyper-Realistic Image Synthesis Task.
    Input: A master grid containing multiple views of a garment.
    Goal: Generate a standalone, PHOTOREALISTIC 2K/4K STUDIO IMAGE of the ${viewName} based on the grid reference.
     
    STRICT REQUIREMENTS:
    1. SCALE & RESOLUTION: The output must be a high-fidelity close-up of the ${viewName}, not a blurry crop. Upscale details to 2K resolution.
    2. TEXTURE & LIGHTING: Enhance fabric textures (cotton, mesh, denim, etc.) to be hyper-realistic. Use professional studio lighting (soft shadows, rim light).
    3. CONSISTENCY: Must be EXACTLY the same garment design as shown in the grid (same colors, graphics, shape).
    4. COMPOSITION: Center the ${viewName} on a clean neutral background.
     
    Design Context: ${trendPrompt.description}.`;

    const response = await generateWithFallback(
      ai,
      IMAGE_MODEL,
      IMAGE_MODEL,
      { parts: [{ text: prompt }, { inlineData: { mimeType, data } }] },
      { imageConfig: { aspectRatio: "1:1", imageSize: "2K" } }
    );
    return response.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || gridImage;
  };

  // Generate all view assets in parallel or sequence
  const [front, back, side, closeup] = await Promise.all([
    generateView("Front View"),
    generateView("Back View"),
    generateView("Side Profile"),
    generateView("Texture Detail") // Close up
  ]);

  // Lifestyle might need different aspect ratio
  const lifestylePrompt = `Lifestyle Campaign Shot.
   Model: Streetwear model wearing the garment from the provided reference.
   Context: ${trendPrompt.description}.
   Action: Walking/Posing naturally.
   Environment: Urban/Studio.
   Consistency: Must match the reference garment exactly.`;

  const lifestyleRes = await generateWithFallback(
    ai,
    IMAGE_MODEL,
    'gemini-1.5-flash',
    { parts: [{ text: lifestylePrompt }, { inlineData: { mimeType, data } }] },
    { imageConfig: { aspectRatio: "3:4" } }
  );
  const lifestyle = lifestyleRes.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || "";

  return { front, back, side, closeup, lifestyle };
};
