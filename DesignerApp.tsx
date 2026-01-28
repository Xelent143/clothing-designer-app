
import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { AppStep, Gender, CATEGORIES, Concept, ProductionAssets, UserProfile, SOCCER_PRESETS, AppMode, BANNER_PRESETS, ASPECT_RATIOS, HOLIDAY_PRESETS, PUFFER_JACKET_PRESETS, BASEBALL_PRESETS, ICE_HOCKEY_PRESETS, BASKETBALL_PRESETS, WINDBREAKER_PRESETS, CHEER_PRESETS, ACTIVEWEAR_PRESETS, MMA_RASHGUARD_PRESETS, BOXING_GLOVE_PRESETS, AMERICAN_FOOTBALL_PRESETS, LEATHER_PRESETS, TRACKSUIT_PRESETS, MOTO_RACING_PRESETS, AI_MODEL_ETHNICITY, AI_MODEL_AGE, AI_MODEL_SCENE, AI_MODEL_ACTION, TechPackData, CustomizationParams, EMBELLISHMENT_TECHNIQUES, GRAPHIC_STYLES } from './types';
import { Button } from './components/Button';
import { LoadingScreen } from './components/LoadingScreen';
import { TechPack } from './components/TechPack';
import { AdminPanel } from './components/AdminPanel';

import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
// import { CategoryCarousel } from './components/CategoryCarousel';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { TechPackGenerator } from './components/TechPackGenerator';
import { ChangelogModal } from './components/ChangelogModal';
import { SocialMediaStudio } from './components/SocialMediaStudio';
import { CURRENT_APP_VERSION } from './types';
import {
  generateConceptDescriptions,
  generateConceptImage,
  generateProductionAssets,
  generateGhostMannequin,
  generateBanners,
  generateModelPhotoshoot,
  regenerateProductionAsset,
  checkApiKey,
  promptForApiKey,
  generateTechPack,
  generateImageRevision,
  generateHelpAssistantResponse
} from './services/geminiService';
import { exportTechPackPDF } from './services/pdfService';
import { incrementGenerations } from './services/profileService';
import { uploadToImgBB, generateUniqueFilename } from './services/imgbbService';


// --- Category Icons ---
// Updated icon components to accept className prop for styling
const TShirtIcon = ({ className }: { className?: string }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0 1.34 3.23l.54.16a2 2 0 0 0 1.6 0l.54-.16a2 2 0 0 1 1.6 0l.54.16a2 2 0 0 1 1.6 0l.54-.16a2 2 0 0 1 1.6 0l.54.16a2 2 0 0 1 1.6 0l.54.16a2 2 0 0 0 1.6 0l.54-.16a2 2 0 0 0 1.34-3.23z" /><path d="M12 13v8" /></svg>);
const TrousersIcon = ({ className }: { className?: string }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a2 2 0 0 0 2-2V8.5a2.5 2.5 0 1 0-5 0V20a2 2 0 0 0 2 2Z" /><path d="M14 20a2 2 0 0 0 2-2V8.5a2.5 2.5 0 1 0-5 0V20a2 2 0 0 0 2 2Z" /><path d="M6 2h12" /></svg>);
const ShortsIcon = ({ className }: { className?: string }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 14a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z" /><path d="M18 12h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z" /><path d="M6 2h12" /></svg>);
const HoodieIcon = ({ className }: { className?: string }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 14a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z" /><path d="M12 18v3" /><path d="m11 12-3-3a5 5 0 0 1 8-4h.5a3.5 3.5 0 0 1 3.5 3.5v.5a5 5 0 0 1-4 8z" /></svg>);
const JacketIcon = ({ className }: { className?: string }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4.24a1 1 0 0 0-.97.72L16 16h-4l-.79-3.28a1 1 0 0 0-.97-.72H6" /><path d="M6 9h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" /><path d="M8 12v-2a2 2 0 1 1 4 0v2" /><path d="M12 12v2a2 2 0 1 0 4 0v-2" /></svg>);
const LeggingsIcon = ({ className }: { className?: string }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5 8 4h8l-2.5 16.5" /><path d="M7 8h10" /></svg>);
const SoccerIcon = ({ className }: { className?: string }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v7l4-2-4 2" /><path d="m5 12 7-4 7 4" /><path d="M5 12v4l7 4 7-4v-4" /><path d="m12 12-7-4" /></svg>);
const BasketballIcon = ({ className }: { className?: string }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M4.93 4.93c5.12 5.12 9.02 5.12 14.14 0" /><path d="M4.93 19.07c5.12-5.12 9.02-5.12 14.14 0" /><path d="M12 2v20" /><path d="M2 12h20" /></svg>);
const WindbreakerIcon = ({ className }: { className?: string }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /><path d="m21 12-9-9-9 9" /></svg>);
const CheerIcon = ({ className }: { className?: string }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /><path d="M12 8v4" /><path d="M12 16h.01" /><path d="M17 12h-1" /><path d="M8 12H7" /></svg>);
const ActivewearIcon = ({ className }: { className?: string }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>);
const MMAIcon = ({ className }: { className?: string }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 12L3 12" /><path d="M12 12l5 8" /><path d="M12 12l5 -8" /></svg>);
const BoxingIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

const LeatherIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3h16l2 8-2 8H4l-2-8 2-8z" />
    <path d="M12 3v16" />
    <path d="M4 11h16" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
  </svg>
);

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  "Trousers": TrousersIcon,
  "Shorts": ShortsIcon,
  "Tracksuits": HoodieIcon,
  "T-Shirts": TShirtIcon,
  "Denim Jackets": JacketIcon,
  "Puffer Jackets": JacketIcon,
  "Hunting Jackets": JacketIcon,
  "Crop Tops": TShirtIcon,
  "Leggings": LeggingsIcon,
  "Hoodies": HoodieIcon,
  "Soccer Uniforms": SoccerIcon,
  "American Football Uniform": SoccerIcon,
  "Baseball Jersey": TShirtIcon,
  "Ice Hockey Jersey": HoodieIcon,
  "Ski Jackets": JacketIcon,
  "Basketball Uniform": BasketballIcon,
  "Windbreaker Jackets": WindbreakerIcon,
  "Cheerleading Uniform": CheerIcon,
  "Activewear": ActivewearIcon,
  "MMA Rashguards": MMAIcon,
  "Boxing Gloves": BoxingIcon,
  "Leather Products": LeatherIcon,
  "Moto Racing Suits": LeatherIcon,
};

const CATEGORY_GROUPS = [
  {
    name: "Streetwear & Outerwear",
    categories: ["Trousers", "Shorts", "Tracksuits", "T-Shirts", "Denim Jackets", "Puffer Jackets", "Hunting Jackets", "Crop Tops", "Leggings", "Hoodies", "Ski Jackets", "Windbreaker Jackets", "Activewear"]
  },
  {
    name: "Team Athletics",
    categories: ["Soccer Uniforms", "American Football Uniform", "Baseball Jersey", "Ice Hockey Uniform", "Basketball Uniform", "Cheerleading Uniform"]
  },
  {
    name: "MMA and Boxing",
    categories: ["MMA Rashguards", "Boxing Gloves"]
  },
  {
    name: "Motorsport & Racing",
    categories: ["Moto Racing Suits"]
  },
  {
    name: "Leather & Heritage",
    categories: ["Leather Products"]
  }
];

// Common icon components updated to accept className prop
const BackIcon = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;
const DownloadIcon = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>;
const UploadIcon = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>;
const AdminIcon = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;
const SettingsIcon = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;

const App: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [globalStats, setGlobalStats] = useState({ totalGenerations: 0 });
  const [appMode, setAppMode] = useState<AppMode>('designer');
  const [step, setStep] = useState<AppStep>(AppStep.CATEGORY_SELECT);
  const [selectedGender, setSelectedGender] = useState<Gender>(Gender.MALE);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [productionAssets, setProductionAssets] = useState<ProductionAssets | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>("");
  const [loadingMsgSub, setLoadingMsgSub] = useState<string>("");
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [showTechPack, setShowTechPack] = useState<boolean>(false);
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>(SOCCER_PRESETS[0]);
  const [showStyleChoiceModal, setShowStyleChoiceModal] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Changelog State
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    // Check local storage for version
    const lastSeenVersion = localStorage.getItem('cp_last_seen_version');
    if (lastSeenVersion !== CURRENT_APP_VERSION) {
      // Small delay to ensure loading screen is gone or app is settled
      setTimeout(() => setShowChangelog(true), 1500);
    }
  }, []);

  const handleCloseChangelog = () => {
    setShowChangelog(false);
    localStorage.setItem('cp_last_seen_version', CURRENT_APP_VERSION);
  };

  // Ghost State
  const [ghostFrontImage, setGhostFrontImage] = useState<string | null>(null);
  const [ghostBackImage, setGhostBackImage] = useState<string | null>(null);
  const [generatedGhostImages, setGeneratedGhostImages] = useState<{ front: string; back: string | null } | null>(null);
  const ghostFrontRef = useRef<HTMLInputElement>(null);
  const ghostBackRef = useRef<HTMLInputElement>(null);

  // Banner State
  const [bannerProductImage, setBannerProductImage] = useState<string | null>(null);
  const [selectedBannerPreset, setSelectedBannerPreset] = useState<string>(BANNER_PRESETS[0]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>(Object.values(ASPECT_RATIOS)[0]);
  const [generatedBanners, setGeneratedBanners] = useState<string[]>([]);
  const [selectedHoliday, setSelectedHoliday] = useState<string>('None');
  const [dealText, setDealText] = useState<string>('');
  const bannerProductRef = useRef<HTMLInputElement>(null);

  // Custom Prompt State
  const [customPrompt, setCustomPrompt] = useState("");
  const [assetPrompts, setAssetPrompts] = useState<Record<string, string>>({});
  const [regeneratingAssets, setRegeneratingAssets] = useState<Record<string, boolean>>({});
  // Track parameters for regeneration
  const [lastGenerationParams, setLastGenerationParams] = useState<{ category: string; style?: any; prompt?: string; preset?: string } | null>(null);
  const [customInspirationImage, setCustomInspirationImage] = useState<string | null>(null);
  const customInspirationRef = useRef<HTMLInputElement>(null);

  // New Customization State
  const [customizationParams, setCustomizationParams] = useState<CustomizationParams>({ mode: 'autopilot' });
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

  // Photoshoot State
  const [photoshootProductImage, setPhotoshootProductImage] = useState<string | null>(null);
  const [photoshootModelType, setPhotoshootModelType] = useState<'ai' | 'real' | null>(null);

  const [photoshootRealModelImage, setPhotoshootRealModelImage] = useState<string | null>(null);
  const [virtualTryOnView, setVirtualTryOnView] = useState<string>("Front View"); // New State for View
  const [photoshootAiConfig, setPhotoshootAiConfig] = useState({
    gender: Gender.MALE,
    ethnicity: AI_MODEL_ETHNICITY[0],
    age: AI_MODEL_AGE[0],
    scene: AI_MODEL_SCENE[0],
    action: AI_MODEL_ACTION[0]
  });
  const [photoshootResultImage, setPhotoshootResultImage] = useState<string | null>(null); // Legacy (for AI model)
  const [photoshootResults, setPhotoshootResults] = useState<Record<string, string>>({}); // New Multi-View State

  const photoshootProductRef = useRef<HTMLInputElement>(null);
  const photoshootRealModelRef = useRef<HTMLInputElement>(null);

  // Master State
  const [masterProductImage, setMasterProductImage] = useState<string | null>(null);
  const [masterQuantity, setMasterQuantity] = useState<number>(100);
  const [techPackResult, setTechPackResult] = useState<TechPackData | null>(null);
  // Rebranding State
  const [rebrandImage, setRebrandImage] = useState<string | null>(null);
  const [rebrandHistory, setRebrandHistory] = useState<string[]>([]);
  const [rebrandPrompt, setRebrandPrompt] = useState("");
  const [rebrandReferenceImage, setRebrandReferenceImage] = useState<string | null>(null); // New State for Reference Image
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const masterImageRef = useRef<HTMLInputElement>(null);
  const rebrandImageRef = useRef<HTMLInputElement>(null);

  // Help Assistant State
  const [helpInput, setHelpInput] = useState("");
  const [assistantReply, setAssistantReply] = useState<string | null>(null);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  const handleHelpQuery = async () => {
    if (!helpInput.trim()) return;
    setIsAssistantLoading(true);
    setAssistantReply(null); // Clear previous
    try {
      const response = await generateHelpAssistantResponse(helpInput);
      setAssistantReply(response);
    } catch (e: any) {
      setAssistantReply(`System Error: ${e.message || "Analysis modules are currently offline."}`);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  useEffect(() => {
    checkApiKey().then(setHasKey);
  }, []);

  const handleKeySelect = async () => {
    if (await checkApiKey(profile?.api_keys?.gemini)) {
      setHasKey(true);
    } else {
      await promptForApiKey();
      setHasKey(await checkApiKey(profile?.api_keys?.gemini));
    }
  };

  const handleRegenerateAsset = async (assetType: string, currentImageDesc: string) => {
    if (!assetPrompts[assetType]) return; // No custom prompt? Do nothing or verify logic
    setRegeneratingAssets(prev => ({ ...prev, [assetType]: true }));

    try {
      if (productionAssets) {
        let baseImage = "";
        if (assetType === 'Front') baseImage = productionAssets.front;
        else if (assetType === 'Back') baseImage = productionAssets.back;
        else if (assetType === 'Side') baseImage = productionAssets.side;
        else if (assetType === 'Detail') baseImage = productionAssets.closeup;
        else if (assetType === 'Lifestyle') baseImage = productionAssets.lifestyle;

        const newImage = await regenerateProductionAsset(baseImage, currentImageDesc, assetType, assetPrompts[assetType], selectedCategory, logo, profile?.branding, profile?.api_keys?.gemini);

        if (newImage) {
          let updatedAssets = { ...productionAssets };
          if (assetType === 'Front') updatedAssets.front = newImage;
          else if (assetType === 'Back') updatedAssets.back = newImage;
          else if (assetType === 'Side') updatedAssets.side = newImage;
          else if (assetType === 'Detail') updatedAssets.closeup = newImage;
          else if (assetType === 'Lifestyle') updatedAssets.lifestyle = newImage;

          setProductionAssets(updatedAssets);
          webhookService.sendImageToWebhook({
            projectName: selectedCategory,
            fileName: `${selectedCategory}_${assetType}_Regenerated`,
            label: `${assetType} View (Regenerated)`,
            image: newImage
          });

          if (profile?.id) {
            await incrementGenerations(profile.id, 1);
          }
        }
      }
    } catch (e) {
      console.error("Regeneration failed", e);
      alert("Regeneration failed. Please try again.");
    } finally {
      setRegeneratingAssets(prev => ({ ...prev, [assetType]: false }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startDesignProcess = async (category: string, style?: any, prompt?: string, preset?: string, customParams?: CustomizationParams) => {
    if (!hasKey) await handleKeySelect();
    setLastGenerationParams({ category, style, prompt, preset }); // Save for regeneration
    setLoading(true);
    setLoadingMsg(prompt ? `Analyzing Request` : `Analyzing Trends`);
    setLoadingMsgSub(prompt ? "Researching custom requirements..." : "Scraping Streetwear Data...");
    setLoadingProgress(10);
    try {
      const descriptions = await generateConceptDescriptions(category, selectedGender, preset, undefined, style, prompt, customInspirationImage, profile?.branding, profile?.api_keys?.gemini, customParams);
      setLoadingMsg("Generating Prototypes");
      setLoadingProgress(30);
      const conceptsWithImages = await Promise.all(descriptions.map(async (desc) => {
        const b64 = await generateConceptImage(desc.description, category, logo, profile?.branding, profile?.api_keys?.gemini);
        return { ...desc, imageBase64: b64 };
      }));
      setConcepts(conceptsWithImages.filter(c => c.imageBase64));

      if (profile?.id) {
        await incrementGenerations(profile.id, conceptsWithImages.filter(c => c.imageBase64).length);
      }


      setStep(AppStep.CONCEPT_SELECTION);
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleRegenerateConcepts = () => {
    if (lastGenerationParams) {
      startDesignProcess(lastGenerationParams.category, lastGenerationParams.style, lastGenerationParams.prompt, lastGenerationParams.preset);
    }
  };

  const finalizeDesign = async (concept: Concept) => {
    setSelectedConcept(concept);
    setLoading(true);
    setLoadingMsg("Production Studio");
    setLoadingProgress(0);
    try {
      const assets = await generateProductionAssets(concept.imageBase64, concept.description, selectedCategory, selectedGender, (m, p) => { setLoadingMsgSub(m); setLoadingProgress(p); }, profile?.branding, profile?.api_keys?.gemini);
      setProductionAssets(assets);

      if (profile?.id) {
        await incrementGenerations(profile.id, 5); // Default production set is 5 views
      }

      setStep(AppStep.PRODUCTION_VIEW);
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleGhostGeneration = async () => {
    if (!ghostFrontImage) return;
    setLoading(true);
    setLoadingMsg("Rendering e-commerce assets...");
    try {
      const results = await generateGhostMannequin(ghostFrontImage, ghostBackImage, (m, p) => { setLoadingMsgSub(m); setLoadingProgress(p); }, profile?.api_keys?.gemini);
      setGeneratedGhostImages(results);

      // Webhook Integration: Send Ghost Mannequin
      if (results.front) {
        webhookService.sendImageToWebhook({ projectName: "Ghost Mannequin", fileName: "Ghost_Front", label: "Ghost Mannequin Front", image: results.front });
        uploadToImgBB(results.front, generateUniqueFilename(profile?.full_name || 'user', 'ghost-front'));
      }
      if (results.back) {
        webhookService.sendImageToWebhook({ projectName: "Ghost Mannequin", fileName: "Ghost_Back", label: "Ghost Mannequin Back", image: results.back });
        uploadToImgBB(results.back, generateUniqueFilename(profile?.full_name || 'user', 'ghost-back'));
      }

      if (profile?.id) {
        const count = (results.front ? 1 : 0) + (results.back ? 1 : 0);
        await incrementGenerations(profile.id, count);
      }

      setStep(AppStep.GHOST_MANNEQUIN_VIEW);
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleBannerGeneration = async () => {
    if (!bannerProductImage) return;
    setLoading(true);
    setLoadingMsg("Designing Banners...");
    try {
      const results = await generateBanners(bannerProductImage, selectedBannerPreset, selectedAspectRatio, selectedHoliday, dealText, profile?.branding, profile?.api_keys?.gemini);
      setGeneratedBanners(results);

      // Webhook Integration: Send Banners
      results.forEach((b, idx) => {
        webhookService.sendImageToWebhook({ projectName: "Marketing Banner", fileName: `Banner_${idx + 1}`, label: "Marketing Banner", image: b });
        uploadToImgBB(b, generateUniqueFilename(profile?.full_name || 'user', `banner-${idx + 1}`));
      });

      if (profile?.id) {
        await incrementGenerations(profile.id, results.length);
      }

      setStep(AppStep.BANNER_RESULTS);
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handlePhotoshootGeneration = async (viewOverride?: string) => {
    // If viewOverride is provided, use it. Otherwise fall back to state.
    // NOTE: When using override, we ignore the state 'virtualTryOnView' to avoid race conditions.
    const activeView = typeof viewOverride === 'string' ? viewOverride : virtualTryOnView;

    if (!photoshootProductImage) return;
    setLoading(true);
    setLoadingMsg(`Generating ${activeView}...`);
    try {
      const result = await generateModelPhotoshoot(photoshootProductImage, photoshootModelType!, photoshootRealModelImage, photoshootAiConfig, activeView, photoshootResults, profile?.branding, profile?.api_keys?.gemini);

      if (photoshootModelType === 'real') {
        setPhotoshootResults(prev => ({ ...prev, [activeView]: result }));
      } else {
        setPhotoshootResultImage(result);
      }

      // Webhook Integration: Send Photoshoot
      webhookService.sendImageToWebhook({
        projectName: "Virtual Photoshoot",
        fileName: `Photoshoot_${activeView.replace(/ /g, '_')}`,
        label: `Photoshoot ${activeView}`,
        image: result
      });
      uploadToImgBB(result, generateUniqueFilename(profile?.full_name || 'user', `photoshoot-${activeView.replace(/ /g, '-')}`));

      if (profile?.id) {
        await incrementGenerations(profile.id, 1);
      }

      setStep(AppStep.PHOTOSHOOT_RESULTS);
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleMasterGeneration = async () => {
    if (!masterProductImage) return;
    setLoading(true);
    setLoadingMsg("Analyzing Garment Construction...");
    setLoadingMsgSub("Calculating fabric consumption & BOM...");
    try {
      const result = await generateTechPack(masterProductImage, masterQuantity, profile?.api_keys?.gemini);
      setTechPackResult(result);
      setStep(AppStep.MASTER_RESULTS);
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleDownloadAll = () => {
    Object.entries(photoshootResults).forEach(([view, img], idx) => {
      setTimeout(() => {
        handleDownload(null, img as string, `TryOn_${view.replace(/ /g, '_')}`);
      }, idx * 500);
    });
  };

  const handleDownload = (e: React.MouseEvent | null, base64: string, filename: string) => {
    if (e) e.stopPropagation();

    try {
      // 1. Sanitize filename (remove spaces, special chars) and ensure .png
      const sanitizedName = filename.replace(/[^a-z0-9]/gi, '_').replace(/_{2,}/g, '_');
      const finalFilename = sanitizedName.toLowerCase().endsWith('.png') ? sanitizedName : `${sanitizedName}.png`;

      // 2. Prepare Direct Data URL
      // If it already has the prefix, use it. Otherwise add the PNG prefix.
      const dataUrl = base64.startsWith('data:')
        ? base64
        : `data:image/png;base64,${base64}`;

      // 3. Create and click link with DOM attachment
      const link = document.createElement("a");
      link.style.display = 'none';
      link.href = dataUrl;
      link.download = finalFilename;

      document.body.appendChild(link);
      link.click();

      // 4. Cleanup DOM
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

    } catch (err) {
      console.error("Download failed", err);
      // Fallback: simplified check
      const link = document.createElement("a");
      link.href = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
      link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
    }
  };

  const handleRebrandGeneration = async () => {
    if (!rebrandImage || !rebrandPrompt) return;
    setLoading(true);
    setLoadingMsg("AI Rebranding");
    setLoadingMsgSub("Applying revisions...");
    setLoadingProgress(50);
    setLoadingProgress(50);
    try {
      const resultB64 = await generateImageRevision(rebrandImage, rebrandPrompt, profile?.api_keys?.gemini, rebrandReferenceImage);
      if (resultB64) {
        setRebrandImage(resultB64);
        setRebrandHistory(prev => [resultB64, ...prev]);
        setRebrandPrompt("");
        setRebrandReferenceImage(null); // Clear reference after use

        if (profile?.id) {
          await incrementGenerations(profile.id, 1);
        }

        // ImgBB Upload
        uploadToImgBB(resultB64, generateUniqueFilename(profile?.full_name || 'user', 'rebrand'));

        setStep(AppStep.REBRAND_RESULTS);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (requestedMode: AppMode = appMode) => {
    setConcepts([]); setSelectedConcept(null); setProductionAssets(null);
    setGhostFrontImage(null); setGhostBackImage(null); setGeneratedGhostImages(null);
    setBannerProductImage(null); setGeneratedBanners([]);
    setPhotoshootProductImage(null); setPhotoshootModelType(null); setPhotoshootRealModelImage(null);
    setPhotoshootResultImage(null); setPhotoshootResults({}); setVirtualTryOnView("Front View");
    setMasterProductImage(null); setTechPackResult(null);
    setRebrandImage(null); setRebrandHistory([]); setRebrandPrompt("");

    if (requestedMode === 'photoshoot') setStep(AppStep.PHOTOSHOOT_UPLOAD);
    else if (requestedMode === 'banner') setStep(AppStep.BANNER_UPLOAD);
    else if (requestedMode === 'master') setStep(AppStep.MASTER_UPLOAD);
    else if (requestedMode === 'rebranding') setStep(AppStep.REBRAND_UPLOAD);
    else if (requestedMode === 'techpack_generator') setStep(AppStep.TECHPACK_SOU_UPLOAD);
    else if (requestedMode === 'social_studio') setStep(AppStep.SOCIAL_STUDIO_INPUT);
    else if (requestedMode === 'ghost') setStep(AppStep.CATEGORY_SELECT);
    else if (step === AppStep.PRESET_SELECTION) setStep(AppStep.CATEGORY_SELECT);
    else setStep(AppStep.CATEGORY_SELECT);
  };

  const handleBack = () => {
    if (step === AppStep.PRODUCTION_VIEW) setStep(AppStep.CONCEPT_SELECTION);
    else if (step === AppStep.CONCEPT_SELECTION) setStep(AppStep.CATEGORY_SELECT);
    else if (step === AppStep.PHOTOSHOOT_AI_CONFIG) setStep(AppStep.PHOTOSHOOT_UPLOAD);
    else if (step === AppStep.BANNER_RESULTS) setStep(AppStep.BANNER_UPLOAD);
    else handleReset();
  };

  if (authLoading) return <LoadingScreen message="Initializing" subMessage="Verifying credentials..." progress={0} />;
  if (!user) return <Navigate to="/login" replace />;
  if (showChangelog) return <ChangelogModal onClose={handleCloseChangelog} />;
  if (showSettings) return <SettingsModal onClose={() => setShowSettings(false)} />;
  if (showAdminPanel) return <AdminPanel onClose={() => setShowAdminPanel(false)} />;
  if (showTechPack && selectedConcept && productionAssets) return <TechPack concept={selectedConcept} assets={productionAssets} category={selectedCategory} gender={selectedGender} onClose={() => setShowTechPack(false)} />;
  if (loading) return <LoadingScreen message={loadingMsg} subMessage={loadingMsgSub} progress={loadingProgress} />;

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-cyan-500 selection:text-white no-print flex overflow-hidden bg-circuit">
      {/* Main Navigation Sidebar */}
      <Sidebar
        currentMode={appMode}
        setMode={setAppMode}
        reset={handleReset}
        userEmail={user?.email || undefined}
        isAdmin={profile?.role === 'admin'}
        onSettings={() => setShowSettings(true)}
        onAdmin={() => setShowAdminPanel(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Secondary Curved Dock (Sub-navigation) */}
      <aside className="w-20 hidden lg:flex flex-col items-center py-12 gap-8 curved-dock z-20">
        {CATEGORIES.slice(0, 6).map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setShowStyleChoiceModal(true); }}
              className="group relative p-3 text-cyan-500/40 hover:text-cyan-400 transition-all hover:glow-cyan rounded-xl bg-white/5 border border-white/5"
            >
              <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 border border-cyan-500/20 text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 rounded">
                {cat}
              </div>
              {Icon && <Icon className="w-6 h-6" />}
            </button>
          );
        })}
      </aside>

      <div className="flex-grow flex flex-col h-screen overflow-hidden relative">
        {/* Subtle Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-50 opacity-20" />

        {/* Central Console Header */}
        <header className="min-h-24 flex flex-col xl:flex-row items-center justify-between px-4 md:px-10 z-30 py-6 gap-6 xl:gap-0">
          <div className="flex items-center justify-between w-full xl:w-auto gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-cyan-400 bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
              </button>

              <div className="flex flex-col">
                <img src="/images/logo-brand.png" alt="Ayzelify" className="h-10 md:h-12 object-contain mb-1" />
                <span className="text-[8px] md:text-[9px] font-mono tracking-[0.4em] text-cyan-500/60 uppercase">System Core v2.04</span>
                {profile?.full_name && (
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-1">Welcome, {profile.full_name}</span>
                )}
              </div>
            </div>

            {/* Mobile Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              className="xl:hidden w-10 h-10 flex items-center justify-center bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 hover:glow-cyan transition-all"
            >
              <SettingsIcon />
            </button>
          </div>

          {/* Centered Hub Console - Help Assistant */}
          <div className="flex flex-col items-center gap-2 relative w-full xl:w-auto">
            <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 px-4 md:px-8 py-3 rounded-2xl glow-cyan w-full xl:w-auto">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  value={helpInput}
                  onChange={(e) => setHelpInput(e.target.value)}
                  placeholder="ASK SYSTEM CORE..."
                  className="flex-grow md:w-64 lg:w-80 bg-transparent border-none text-cyan-100 placeholder-cyan-900 focus:outline-none font-mono text-xs tracking-wider"
                  onKeyDown={(e) => e.key === 'Enter' && handleHelpQuery()}
                />
                <button
                  onClick={handleHelpQuery}
                  disabled={!helpInput || isAssistantLoading}
                  className="bg-cyan-500 text-slate-950 px-3 md:px-6 py-2 rounded-lg font-black uppercase text-[9px] md:text-[10px] tracking-widest md:tracking-[0.2em] hover:bg-cyan-400 transition-all disabled:opacity-30 flex items-center gap-1 md:gap-2 whitespace-nowrap"
                >
                  {isAssistantLoading ? '...' : 'Ask Me'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
                </button>
              </div>
              <div className="hidden md:block w-[1px] h-8 bg-cyan-500/20 mx-2" />
              <div className="flex gap-2 w-full md:w-auto justify-center">
                {[Gender.MALE, Gender.FEMALE].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(g)}
                    className={`flex-grow md:flex-grow-0 px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${selectedGender === g ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 glow-cyan' : 'text-slate-600 border border-transparent hover:border-slate-800'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Assistant Response Tooltip/Panel */}
            {assistantReply && (
              <div className="absolute top-full mt-4 w-full md:w-[500px] bg-slate-900/95 border border-cyan-500/40 p-4 rounded-xl backdrop-blur-xl shadow-2xl animate-fade-in z-[100] glow-cyan">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.3em]">System Core Response</span>
                  <button onClick={() => setAssistantReply(null)} className="text-cyan-500 hover:text-white p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>
                </div>
                <p className="text-[11px] md:text-xs text-cyan-100/90 leading-relaxed font-mono">
                  {assistantReply}
                </p>
              </div>
            )}
          </div>

          <div className="hidden xl:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-cyan-500/40 uppercase tracking-widest">User Generations</span>
              <span className="text-xl font-mono font-black text-white glow-text leading-none">{(profile?.total_generations || 0).toLocaleString()}</span>
            </div>

            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 hover:glow-cyan transition-all"
            >
              <SettingsIcon />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto custom-scrollbar relative flex flex-col items-center justify-start p-4 md:p-8">
          {/* DESIGNER MODE - CATEGORY SELECT */}
          {appMode === 'designer' && step === AppStep.CATEGORY_SELECT && (
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center animate-slide-up pt-8 pb-24">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold brand-font uppercase tracking-tighter glow-text mb-2">
                  Collection <span className="text-cyan-400">Studio</span>
                </h2>
                <p className="text-cyan-500/40 text-[10px] uppercase tracking-[0.4em] font-black">System Category Matrix</p>
              </div>

              <div className="space-y-12 w-full">
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.name} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500/60 whitespace-nowrap">{group.name}</h3>
                      <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
                      {group.categories.map((cat) => {
                        const Icon = CATEGORY_ICONS[cat];
                        return (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              const presetCategories = ['Boxing Gloves', 'Soccer Uniforms', 'Puffer Jackets', 'Baseball Jersey', 'Ice Hockey Uniform', 'Basketball Uniform', 'Windbreaker Jackets', 'Cheerleading Uniform', 'Activewear', 'MMA Rashguards', 'American Football Uniform', 'Leather Products', 'Tracksuits', 'Moto Racing Suits'];
                              if (presetCategories.includes(cat)) {
                                setStep(AppStep.PRESET_SELECTION);
                              } else {
                                setShowStyleChoiceModal(true);
                              }
                            }}
                            className="group relative aspect-square flex flex-col items-center justify-center p-4 glass-card rounded-xl border border-cyan-500/10 hover:border-cyan-400 hover:glow-cyan transition-all duration-300 bg-slate-900/40 backdrop-blur-md"
                          >
                            <div className="mb-3 text-cyan-500 group-hover:text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                              {Icon && <Icon className="w-10 h-10" />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-100/60 group-hover:text-white text-center whitespace-normal leading-tight">
                              {cat}
                            </span>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRESET SELECTION VIEW */}
          {
            step === AppStep.PRESET_SELECTION && (
              <div className="max-w-4xl mx-auto animate-fade-in py-12">
                <h2 className="text-3xl font-bold brand-font uppercase mb-12 text-center text-white">Select {selectedCategory} Style</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(() => {
                    if (selectedCategory === 'Soccer Uniforms') return SOCCER_PRESETS;
                    if (selectedCategory === 'Puffer Jackets') return PUFFER_JACKET_PRESETS;
                    if (selectedCategory === 'Baseball Jersey') return BASEBALL_PRESETS;
                    if (selectedCategory === 'Ice Hockey Uniform') return ICE_HOCKEY_PRESETS;
                    if (selectedCategory === 'Basketball Uniform') return BASKETBALL_PRESETS;
                    if (selectedCategory === 'Windbreaker Jackets') return WINDBREAKER_PRESETS;
                    if (selectedCategory === 'Cheerleading Uniform') return CHEER_PRESETS;
                    if (selectedCategory === 'Activewear') return ACTIVEWEAR_PRESETS;
                    if (selectedCategory === 'MMA Rashguards') return MMA_RASHGUARD_PRESETS;
                    if (selectedCategory === 'American Football Uniform') return AMERICAN_FOOTBALL_PRESETS;
                    if (selectedCategory === 'Boxing Gloves') return BOXING_GLOVE_PRESETS;
                    if (selectedCategory === 'Tracksuits') return TRACKSUIT_PRESETS;
                    if (selectedCategory === 'Leather Products') return LEATHER_PRESETS;
                    if (selectedCategory === 'Moto Racing Suits') return MOTO_RACING_PRESETS;
                    return [];
                  })().map((preset) => (
                    <button
                      key={preset}
                      onClick={() => startDesignProcess(selectedCategory, undefined, undefined, preset)}
                      className="bg-neutral-900 border border-white/10 hover:border-purple-500 p-8 text-left group transition-all"
                    >
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-400 mb-2">{preset}</h3>
                      <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">
                        {selectedCategory === 'Soccer Uniforms' && preset === 'Neo-Retro Revival' && '90s Collars • Bold Geometry'}
                        {selectedCategory === 'Soccer Uniforms' && preset === 'Minimalist Luxury' && 'Clean • Gold Accents • Sail'}
                        {selectedCategory === 'Soccer Uniforms' && preset === 'Topographic AOP' && 'Map Patterns • Cultural Motifs'}
                        {selectedCategory === 'Soccer Uniforms' && preset === 'Gradient Fade' && 'Speed Aesthetics • Ombré'}
                        {selectedCategory === 'Puffer Jackets' && 'AI Curated Style'}
                        {selectedCategory === 'Baseball Jersey' && preset === 'Powder Blue Throwback' && '70s/80s Retro • Cursive Script'}
                        {selectedCategory === 'Baseball Jersey' && preset === 'City Connect / Localized Art' && 'Local Landmarks • Area Codes'}
                        {selectedCategory === 'Baseball Jersey' && preset === 'The Pinstripe Classic' && 'Broken/Micro Pinstripes'}
                        {selectedCategory === 'Baseball Jersey' && preset === 'Sublimated Gradients' && 'Digital Fade • Camo'}
                        {selectedCategory === 'Ice Hockey Uniform' && preset === 'Deep Frost Gradient' && 'Icy Colors • Sublimation'}
                        {selectedCategory === 'Ice Hockey Uniform' && preset === 'Matte Blackout' && 'Matte Fabric • Phantom Striping'}
                        {selectedCategory === 'Ice Hockey Uniform' && preset === 'The Centennial Classic' && 'Felt Patches • Chest Stripes'}
                        {selectedCategory === 'Ice Hockey Uniform' && preset === 'Symmetry-Break' && 'Diagonal Text • Asymmetric'}
                        {selectedCategory === 'Basketball Uniform' && preset === 'Vapor Knit Pro' && 'Mesh Panels • Tight Fit • Modern'}
                        {selectedCategory === 'Basketball Uniform' && preset === 'Heritage Classic' && 'Retro Colors • Wide Armholes'}
                        {selectedCategory === 'Basketball Uniform' && preset === 'Neighborhood League' && 'Streetball • Bold Patterns'}
                        {selectedCategory === 'Basketball Uniform' && preset === 'Tech-Knit Identity' && 'Digital Texture • Geometric'}
                        {selectedCategory === 'Basketball Uniform' && preset === 'City Connect Legacy' && 'Cultural Themes • Local Pride'}
                        {selectedCategory === 'Windbreaker Jackets' && preset === 'Urban Techshell' && 'Matte Fabric • Tech Zips • Modular'}
                        {selectedCategory === 'Windbreaker Jackets' && preset === 'Retro Color-Block' && '90s Heritage • Contrast Panels'}
                        {selectedCategory === 'Windbreaker Jackets' && preset === 'Trail Performance' && 'Ripstop • Packable • Reflective'}
                        {selectedCategory === 'Windbreaker Jackets' && preset === 'Minimalist Coach' && 'Snap Front • Fold Collar • Sleek'}
                        {selectedCategory === 'Windbreaker Jackets' && preset === 'Quarter-Zip Popover' && 'Anorak • Bungee Toggles'}
                        {selectedCategory === 'Cheerleading Uniform' && preset === 'Elite All-Star' && 'Rhinestones • Motion-Cut • High-Gloss'}
                        {selectedCategory === 'Cheerleading Uniform' && preset === 'Sideline Classic' && 'Traditional Shell • Pleated'}
                        {selectedCategory === 'Cheerleading Uniform' && preset === 'High-Flash Performance' && 'Metallic Trim • Power-Stretch'}
                        {selectedCategory === 'Cheerleading Uniform' && preset === 'Modern Minimalist' && 'Sleek Lines • Compression'}
                        {selectedCategory === 'Cheerleading Uniform' && preset === 'Sublimated Motion' && 'Dynamic Gradients • Lightweight'}
                        {selectedCategory === 'Activewear' && preset === 'Performance Compression' && 'Muscle Support • Laser-Cut • Pro'}
                        {selectedCategory === 'Activewear' && preset === 'Seamless Flow' && 'Yoga • Infinite Stretch • Tonal'}
                        {selectedCategory === 'Activewear' && preset === 'Urban Athleisure' && 'Street Style • Tech Fabrics • Utility'}
                        {selectedCategory === 'Activewear' && preset === 'High-Impact Training' && 'Durable • Breathable • High Motion'}
                        {selectedCategory === 'Activewear' && preset === 'Discovery Trail' && 'Outdoor Performance • Water Repellent'}
                        {selectedCategory === 'Activewear' && preset === 'Recovery Lounge' && 'Soft Texture • Relaxed Fit • Premium'}
                        {selectedCategory === 'MMA Rashguards' && preset === 'Long Sleeve Pro-Fit' && 'Full Coverage • Compression • Heavyweight'}
                        {selectedCategory === 'MMA Rashguards' && preset === 'Short Sleeve Performance' && 'Freedom of Motion • Breathable'}
                        {selectedCategory === 'MMA Rashguards' && preset === 'Samurai Heritage AOP' && 'Traditional Japanese Art • Full Print'}
                        {selectedCategory === 'MMA Rashguards' && preset === 'Cyber-Tech Modern' && 'Futuristic Glitch • Neon Accents'}
                        {selectedCategory === 'MMA Rashguards' && preset === 'Rank-Based Minimalist' && 'Jiu-Jitsu Belt Colors • Clean'}
                        {selectedCategory === 'MMA Rashguards' && preset === 'Street-Combat Style' && 'Graffiti • Urban Tactical • Edgy'}
                        {selectedCategory === 'American Football Uniform' && preset === 'Gridiron Pro-Fit' && 'Compression Panels • Reinforced Shoulders'}
                        {selectedCategory === 'American Football Uniform' && preset === 'Classic Varsity' && 'Tackle Twill • Traditional Stripes'}
                        {selectedCategory === 'American Football Uniform' && preset === 'Sublimated Speed' && 'Digital Gradients • Lightweight Mesh'}
                        {selectedCategory === 'American Football Uniform' && preset === 'Retro-Bowl Classic' && 'Vibrant Colors • Boxy 80s Fit'}
                        {selectedCategory === 'American Football Uniform' && preset === 'Urban Combat' && 'Matte Finish • Stealth Paneling'}
                        {selectedCategory === 'Boxing Gloves' && preset === 'Training (Multi-Purpose)' && 'Hand Protection • Versatile • All-Rounder'}
                        {selectedCategory === 'Boxing Gloves' && preset === 'Heavy Bag Focus' && 'Dense Padding • Impact Durability'}
                        {selectedCategory === 'Boxing Gloves' && preset === 'Sparring (16oz+)' && 'Partner Safety • 16oz Pillow Padding'}
                        {selectedCategory === 'Boxing Gloves' && preset === 'Competition (Lace-Up)' && 'Pro Streamline • Lace-Up Support'}
                        {selectedCategory === 'Boxing Gloves' && preset === 'Mexican Style' && 'Punchers Feel • Horsehair Padding'}
                        {selectedCategory === 'Boxing Gloves' && preset === 'Muay Thai Hybrid' && 'Flexible Grip • Kick-Blocking Support'}
                        {selectedCategory === 'Leather Products' && preset === 'Biker Heritage (Distressed)' && 'Vintage Finish • Asymmetric Zip • Heavy Duty'}
                        {selectedCategory === 'Leather Products' && preset === 'Urban Bomber (Matte)' && 'Sleek Canvas • Ribbed Trims • Minimalist'}
                        {selectedCategory === 'Leather Products' && preset === 'Luxury Trench (Semi-Aniline)' && 'Long Profile • Belted waist • Premium Glow'}
                        {selectedCategory === 'Leather Products' && preset === 'Artisan Gilet (Full-Grain)' && 'Vests • Heavy Stitching • Rugged'}
                        {selectedCategory === 'Leather Products' && preset === 'Minimalist Slim-Fit' && 'Clean Lines • Hidden Pockets • Soft Lambskin'}
                        {selectedCategory === 'Leather Products' && preset === 'Cyberpunk Tactical' && 'Paneling • Tech Buckles • Neon Reflectives'}
                      </p>
                      {/* Hack to pass preset: MODIFY startDesignProcess to accept preset as 4th arg or handle it here */}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center mt-12"><Button variant="outline" onClick={() => setStep(AppStep.CATEGORY_SELECT)}>Go Back</Button></div>
              </div>
            )
          }

          {/* GHOST MODE - UPLOAD */}
          {
            appMode === 'ghost' && step === AppStep.CATEGORY_SELECT && (
              <div className="max-w-4xl mx-auto animate-fade-in py-12">
                <h2 className="text-4xl font-bold brand-font uppercase mb-12 text-center">E-Commerce Ghost Studio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="flex flex-col items-center space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Front View (Required)</span>
                    <button onClick={() => ghostFrontRef.current?.click()} className="w-full aspect-[3/4] border-2 border-dashed border-white/10 hover:border-purple-500 bg-white/5 flex flex-col items-center justify-center overflow-hidden transition-all">
                      {ghostFrontImage ? <img src={ghostFrontImage} className="w-full h-full object-contain p-4" /> : <div className="text-center p-8 text-gray-500"><UploadIcon className="mx-auto mb-2" /><p className="text-xs font-bold uppercase">Upload Front</p></div>}
                    </button>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Back View (Optional)</span>
                    <button onClick={() => ghostBackRef.current?.click()} className="w-full aspect-[3/4] border-2 border-dashed border-white/10 hover:border-purple-500 bg-white/5 flex flex-col items-center justify-center overflow-hidden transition-all">
                      {ghostBackImage ? <img src={ghostBackImage} className="w-full h-full object-contain p-4" /> : <div className="text-center p-8 text-gray-500"><UploadIcon className="mx-auto mb-2" /><p className="text-xs font-bold uppercase">Upload Back</p></div>}
                    </button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button className="px-12 py-4 text-lg" onClick={handleGhostGeneration} disabled={!ghostFrontImage}>Process 2K Assets</Button>
                </div>
              </div>
            )
          }

          {/* GHOST MODE - RESULTS */}
          {
            appMode === 'ghost' && step === AppStep.GHOST_MANNEQUIN_VIEW && generatedGhostImages && (
              <div className="max-w-5xl mx-auto animate-fade-in py-12">
                <h2 className="text-3xl font-bold brand-font uppercase mb-8 border-b border-white/10 pb-4">Ghost Mannequin Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-neutral-900 border border-white/10 p-4 space-y-4">
                    <div className="aspect-[3/4] bg-white relative group">
                      <img src={`data:image/png;base64,${generatedGhostImages.front}`} className="w-full h-full object-contain" />
                      <button onClick={(e) => handleDownload(e, generatedGhostImages.front, 'Ghost_Front')} className="absolute top-4 right-4 p-3 bg-black/50 rounded-full"><DownloadIcon /></button>
                    </div>
                    <p className="text-center text-xs font-bold uppercase tracking-widest">Front View</p>
                  </div>
                  {generatedGhostImages.back && (
                    <div className="bg-neutral-900 border border-white/10 p-4 space-y-4">
                      <div className="aspect-[3/4] bg-white relative group">
                        <img src={`data:image/png;base64,${generatedGhostImages.back}`} className="w-full h-full object-contain" />
                        <button onClick={(e) => handleDownload(e, generatedGhostImages.back!, 'Ghost_Back')} className="absolute top-4 right-4 p-3 bg-black/50 rounded-full"><DownloadIcon /></button>
                      </div>
                      <p className="text-center text-xs font-bold uppercase tracking-widest">Back View</p>
                    </div>
                  )}
                </div>
                <div className="mt-12 flex justify-center gap-4">
                  <Button variant="outline" onClick={() => handleReset('ghost')}>New Item</Button>
                </div>
              </div>
            )
          }

          {/* BANNER MODE - UPLOAD */}
          {
            appMode === 'banner' && step === AppStep.BANNER_UPLOAD && (
              <div className="max-w-5xl mx-auto animate-fade-in py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h2 className="text-4xl font-bold brand-font uppercase">Banner Design Studio</h2>
                    <p className="text-gray-400 text-sm">Upload your ghost mannequin or product flatlay to generate market-ready social media assets.</p>
                    <button onClick={() => bannerProductRef.current?.click()} className="w-full aspect-square border-2 border-dashed border-white/10 hover:border-purple-500 bg-white/5 flex flex-col items-center justify-center overflow-hidden transition-all">
                      {bannerProductImage ? <img src={bannerProductImage} className="w-full h-full object-contain p-4" /> : <div className="text-center p-8 text-gray-500"><UploadIcon className="mx-auto mb-2" /><p className="text-xs font-bold uppercase">Upload Product Image</p></div>}
                    </button>
                  </div>
                  <div className="bg-neutral-900 border border-white/10 p-8 space-y-6 self-start">
                    <h3 className="text-xl font-bold brand-font uppercase text-purple-400">Campaign Config</h3>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2">Artistic Preset</label>
                      <select value={selectedBannerPreset} onChange={(e) => setSelectedBannerPreset(e.target.value)} className="w-full bg-black border border-white/20 p-3 text-sm outline-none focus:border-purple-500">
                        {BANNER_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2">Aspect Ratio</label>
                      <select value={selectedAspectRatio} onChange={(e) => setSelectedAspectRatio(e.target.value)} className="w-full bg-black border border-white/20 p-3 text-sm outline-none focus:border-purple-500">
                        {Object.entries(ASPECT_RATIOS).map(([label, val]) => <option key={val} value={val}>{label}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2">Holiday Event</label>
                        <select value={selectedHoliday} onChange={(e) => setSelectedHoliday(e.target.value)} className="w-full bg-black border border-white/20 p-3 text-sm outline-none focus:border-purple-500">
                          {HOLIDAY_PRESETS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2">Promo Code/Deal</label>
                        <input type="text" value={dealText} onChange={(e) => setDealText(e.target.value)} placeholder="e.g. 50% OFF" className="w-full bg-black border border-white/20 p-3 text-sm outline-none focus:border-purple-500" />
                      </div>
                    </div>
                    <Button fullWidth className="py-4" onClick={handleBannerGeneration} disabled={!bannerProductImage}>Design Banners</Button>
                  </div>
                </div>
              </div>
            )
          }

          {/* BANNER MODE - RESULTS */}
          {
            appMode === 'banner' && step === AppStep.BANNER_RESULTS && (
              <div className="max-w-6xl mx-auto animate-fade-in py-12">
                <h2 className="text-3xl font-bold brand-font uppercase mb-12 border-b border-white/10 pb-4">Designer Banners</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {generatedBanners.map((b, i) => (
                    <div key={i} className="group relative bg-neutral-900 border border-white/10 overflow-hidden">
                      <img src={`data:image/png;base64,${b}`} className="w-full h-auto object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button onClick={(e) => handleDownload(e, b, `Banner_${i}`)}>Download 2K</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-12 flex justify-center"><Button variant="outline" onClick={() => handleReset('banner')}>New Campaign</Button></div>
              </div>
            )
          }

          {/* PHOTOSHOOT MODE - UPLOAD */}
          {
            appMode === 'photoshoot' && step === AppStep.PHOTOSHOOT_UPLOAD && (
              <div className="animate-fade-in max-w-4xl mx-auto py-12">
                <h2 className="text-4xl font-bold brand-font uppercase mb-12 text-center">AI Lifestyle Studio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-bold uppercase mb-4 brand-font text-purple-400">1. Product Image</h3>
                    <button onClick={() => photoshootProductRef.current?.click()} className="w-full aspect-[3/4] border-2 border-dashed border-white/10 hover:border-purple-500 flex items-center justify-center bg-white/5 overflow-hidden transition-all">
                      {photoshootProductImage ? <img src={photoshootProductImage} className="w-full h-full object-contain p-4" /> : <div className="text-gray-500 text-center"><UploadIcon className="mx-auto mb-2" /><p className="text-xs font-bold uppercase">Upload Flatlay</p></div>}
                    </button>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold uppercase mb-4 brand-font text-purple-400">2. Shoot Direction</h3>
                    <Button fullWidth className="py-6" onClick={() => { setPhotoshootModelType('ai'); setStep(AppStep.PHOTOSHOOT_AI_CONFIG); }} disabled={!photoshootProductImage}>AI Model Photoshoot</Button>
                    <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div><div className="relative flex justify-center text-xs uppercase font-bold text-gray-500 bg-neutral-950 px-2">OR</div></div>
                    <Button fullWidth variant="outline" className="py-6" onClick={() => { setPhotoshootModelType('real'); photoshootRealModelRef.current?.click(); }} disabled={!photoshootProductImage}>Virtual Try-On (Human Model)</Button>
                    {photoshootRealModelImage && photoshootModelType === 'real' && (
                      <div className="mt-8 animate-fade-in flex flex-col items-center p-6 bg-white/5 border border-white/10 w-full">
                        <img src={photoshootRealModelImage} className="w-48 aspect-[3/4] object-contain mb-4 border border-white/10" />

                        {/* View Selection Dropdown */}
                        <div className="w-full mb-4">
                          <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">Select Output View</label>
                          <select
                            value={virtualTryOnView}
                            onChange={(e) => setVirtualTryOnView(e.target.value)}
                            className="w-full bg-black border border-white/20 p-3 text-sm outline-none focus:border-purple-500"
                          >
                            <option value="Front View">Front View</option>
                            <option value="Back View">Back View</option>
                            <option value="Left Side View">Left Side View</option>
                            <option value="Right Side View">Right Side View</option>
                          </select>
                        </div>

                        <Button fullWidth onClick={handlePhotoshootGeneration}>Perform Try-On</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          }

          {/* PHOTOSHOOT MODE - AI CONFIG */}
          {
            appMode === 'photoshoot' && step === AppStep.PHOTOSHOOT_AI_CONFIG && (
              <div className="max-w-4xl mx-auto animate-fade-in py-12">
                <h2 className="text-3xl font-bold brand-font uppercase mb-12 text-center">Cast Your Model & Scene</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-neutral-900 border border-white/10 p-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400">Model Specs</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Gender</label>
                        <select value={photoshootAiConfig.gender} onChange={(e) => setPhotoshootAiConfig({ ...photoshootAiConfig, gender: e.target.value as Gender })} className="w-full bg-black border border-white/20 p-2 text-sm">
                          <option value={Gender.MALE}>Male</option>
                          <option value={Gender.FEMALE}>Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Ethnicity</label>
                        <select value={photoshootAiConfig.ethnicity} onChange={(e) => setPhotoshootAiConfig({ ...photoshootAiConfig, ethnicity: e.target.value })} className="w-full bg-black border border-white/20 p-2 text-sm">
                          {AI_MODEL_ETHNICITY.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Age Range</label>
                      <select value={photoshootAiConfig.age} onChange={(e) => setPhotoshootAiConfig({ ...photoshootAiConfig, age: e.target.value })} className="w-full bg-black border border-white/20 p-2 text-sm">
                        {AI_MODEL_AGE.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400">Environment</h3>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Scene</label>
                      <select value={photoshootAiConfig.scene} onChange={(e) => setPhotoshootAiConfig({ ...photoshootAiConfig, scene: e.target.value })} className="w-full bg-black border border-white/20 p-2 text-sm">
                        {AI_MODEL_SCENE.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Pose/Action</label>
                      <select value={photoshootAiConfig.action} onChange={(e) => setPhotoshootAiConfig({ ...photoshootAiConfig, action: e.target.value })} className="w-full bg-black border border-white/20 p-2 text-sm">
                        {AI_MODEL_ACTION.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex justify-center">
                  <Button className="px-12 py-4" onClick={handlePhotoshootGeneration}>Start Photoshoot</Button>
                </div>
              </div>
            )
          }

          {/* CONCEPT SELECTION (DESIGNER) */}
          {
            step === AppStep.CONCEPT_SELECTION && (
              <div className="animate-fade-in max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold brand-font uppercase mb-8 border-b border-white/10 pb-6">Select Concept</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {concepts.map((concept) => (
                    <div key={concept.id} className="bg-neutral-900 border border-white/10 hover:border-purple-500 transition-all group overflow-hidden">
                      <div className="aspect-[4/3] bg-white p-4"><img src={`data:image/png;base64,${concept.imageBase64}`} className="w-full h-full object-contain" /></div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold brand-font uppercase mb-2 text-purple-400">{concept.title}</h3>
                        <p className="text-gray-400 text-sm mb-6 line-clamp-2">{concept.description}</p>
                        <Button fullWidth onClick={() => finalizeDesign(concept)}>Generate Assets</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" className="px-8" onClick={handleRegenerateConcepts}>Regenerate New Concepts</Button>
                </div>
              </div>
            )
          }

          {/* PRODUCTION VIEW (DESIGNER) */}
          {
            appMode === 'designer' && step === AppStep.PRODUCTION_VIEW && productionAssets && selectedConcept && (
              <div className="animate-fade-in space-y-12 pb-24">
                <div className="text-center"><h2 className="text-5xl font-bold brand-font uppercase">{selectedConcept.title}</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[{ t: "Front", i: productionAssets.front }, { t: "Back", i: productionAssets.back }, { t: "Side", i: productionAssets.side }, { t: "Detail", i: productionAssets.closeup }].map((item, idx) => (
                    <div key={idx} className="space-y-3 p-4 bg-neutral-900 border border-white/5">
                      <div className="aspect-square bg-white relative overflow-hidden group">
                        {regeneratingAssets[item.t] && (
                          <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center text-xs uppercase tracking-widest text-purple-400 animate-pulse">
                            Regenerating...
                          </div>
                        )}
                        <img src={`data:image/png;base64,${item.i}`} className="w-full h-full object-contain" />
                        <button onClick={(e) => handleDownload(e, item.i, `${selectedConcept.title}_${item.t}`)} className="absolute top-2 right-2 p-2 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"><DownloadIcon /></button>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <textarea
                          className="w-full bg-black/50 text-xs text-gray-300 p-3 border border-white/10 focus:border-purple-500 outline-none resize-none font-mono"
                          rows={3}
                          placeholder={`Refine prompt for ${item.t} view...`}
                          value={assetPrompts[item.t] || ""}
                          onChange={(e) => setAssetPrompts({ ...assetPrompts, [item.t]: e.target.value })}
                        />
                        <Button
                          className="text-xs uppercase tracking-widest py-3"
                          fullWidth
                          disabled={!assetPrompts[item.t] || regeneratingAssets[item.t]}
                          onClick={() => handleRegenerateAsset(item.t, selectedConcept.description)}
                        >
                          {regeneratingAssets[item.t] ? 'Processing...' : `Regenerate ${item.t}`}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="relative aspect-[16/9] border border-white/10 overflow-hidden group">
                  <img src={`data:image/png;base64,${productionAssets.lifestyle}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-8 left-8"><h3 className="text-4xl font-bold brand-font uppercase">Lifestyle Campaign</h3></div>
                  <button onClick={(e) => handleDownload(e, productionAssets.lifestyle, `Lifestyle`)} className="absolute top-8 right-8 p-3 bg-black/50 rounded-full"><DownloadIcon /></button>
                </div>

                {/* Lifestyle Revision Control */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-neutral-900 p-6 border border-white/10 mb-12">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Refine Lifestyle Scene</label>
                    <textarea
                      className="w-full bg-black text-xs text-gray-300 p-3 border border-white/10 focus:border-purple-500 outline-none resize-none font-mono"
                      rows={2}
                      placeholder="Describe scene changes (e.g., 'Moving to a neon city backdrop'...)"
                      value={assetPrompts['Lifestyle'] || ""}
                      onChange={(e) => setAssetPrompts({ ...assetPrompts, Lifestyle: e.target.value })}
                    />
                  </div>
                  <Button
                    className="uppercase tracking-widest py-4"
                    fullWidth
                    disabled={!assetPrompts['Lifestyle'] || regeneratingAssets['Lifestyle']}
                    onClick={() => handleRegenerateAsset('Lifestyle', selectedConcept.description)}
                  >
                    {regeneratingAssets['Lifestyle'] ? 'Processing Scene...' : 'Update Lifestyle View'}
                  </Button>
                </div>
                <div className="flex justify-center gap-4"><Button variant="outline" onClick={() => handleReset()}>New Design</Button><Button onClick={() => setShowTechPack(true)}>Export Spec Sheet</Button></div>
              </div>
            )
          }

          {/* PHOTOSHOOT RESULTS */}
          {
            appMode === 'photoshoot' && step === AppStep.PHOTOSHOOT_RESULTS && (
              <div className="max-w-6xl mx-auto py-12 animate-fade-in">
                {photoshootModelType === 'ai' && photoshootResultImage ? (
                  // Legacy View for AI Model
                  <div className="max-w-2xl mx-auto">
                    <div className="aspect-[3/4] bg-neutral-900 border border-white/10 relative group mb-8">
                      <img src={`data:image/png;base64,${photoshootResultImage}`} className="w-full h-full object-contain" />
                      <button onClick={(e) => handleDownload(e, photoshootResultImage, 'Photoshoot')} className="absolute top-4 right-4 p-3 bg-black/50 rounded-full"><DownloadIcon /></button>
                    </div>
                  </div>
                ) : (
                  // Multi-View Gallery for Real Model
                  <div>
                    <h2 className="text-3xl font-bold brand-font uppercase mb-8 text-center">Virtual Try-On Gallery</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                      {["Front View", "Back View", "Left Side View", "Right Side View"].map((view) => (
                        <div key={view} className={`aspect-[3/4] border ${photoshootResults[view] ? 'border-purple-500/50 bg-black' : 'border-white/10 bg-white/5'} relative flex flex-col items-center justify-center p-2 transition-all`}>
                          <div className="absolute top-2 left-2 text-[10px] uppercase font-bold text-gray-400 bg-black/50 px-2 rounded-full">{view}</div>
                          {photoshootResults[view] ? (
                            <>
                              <img src={`data:image/png;base64,${photoshootResults[view]}`} className="w-full h-full object-contain" />
                              <button onClick={(e) => handleDownload(e, photoshootResults[view], `TryOn_${view}`)} className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full hover:bg-purple-600 transition-colors"><DownloadIcon /></button>
                            </>
                          ) : (
                            <div className="text-center">
                              <button
                                onClick={() => handlePhotoshootGeneration(view)}
                                className="px-4 py-2 bg-white/10 hover:bg-white text-xs font-bold uppercase tracking-wider rounded-full transition-all text-white hover:text-black"
                              >
                                Generate
                              </button>
                              <p className="text-[10px] text-gray-600 mt-2">Empty Slot</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-4">
                      <Button onClick={handleDownloadAll} disabled={Object.keys(photoshootResults).length === 0}>Download All Images</Button>
                      <Button variant="outline" onClick={() => handleReset('photoshoot')}>Start New Session</Button>
                    </div>
                  </div>
                )}
              </div>
            )
          }

          {
            appMode === 'master' && step === AppStep.MASTER_UPLOAD && (
              <div className="max-w-xl mx-auto py-12 animate-fade-in text-center">
                <h2 className="text-3xl font-bold brand-font mb-2">APPAREL MASTER</h2>
                <p className="text-gray-400 mb-8">AI-Powered Techpack Generator</p>

                <div onClick={() => masterImageRef.current?.click()} className="border-2 border-dashed border-white/20 hover:border-purple-500 rounded-2xl p-12 cursor-pointer transition-all hover:bg-white/5 mb-8 group">
                  {masterProductImage ? (
                    <div className="relative aspect-square w-48 mx-auto"><img src={masterProductImage} className="w-full h-full object-contain" /></div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-gray-400 group-hover:text-white"><UploadIcon className="w-12 h-12" /><span className="uppercase font-bold tracking-widest text-xs">Upload Garment Image</span></div>
                  )}
                </div>

                <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl mb-8 text-left">
                  <label className="text-xs uppercase font-bold text-gray-500 tracking-widest block mb-2">Manufacturing Quantity</label>
                  <input type="number" value={masterQuantity} onChange={(e) => setMasterQuantity(parseInt(e.target.value) || 0)} className="w-full bg-black border border-white/10 p-3 text-white font-mono" />
                </div>

                <Button fullWidth onClick={handleMasterGeneration} disabled={!masterProductImage || loading}>{loading ? 'Analyzing Construction...' : 'Generate TechPack'}</Button>
              </div>
            )
          }
          {
            appMode === 'master' && step === AppStep.MASTER_RESULTS && techPackResult && (
              <div className="max-w-6xl mx-auto py-8 animate-fade-in">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                  <div>
                    <h2 className="text-3xl font-bold brand-font">{techPackResult.productInfo.name}</h2>
                    <p className="text-gray-400 text-sm">Techpack #MD-{Date.now().toString().slice(-6)}</p>
                  </div>
                  <Button onClick={() => exportTechPackPDF(techPackResult, masterProductImage!, masterQuantity)}><DownloadIcon className="mr-2" /> Download PDF</Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Visuals */}
                  <div className="space-y-4">
                    <div className="bg-white p-4 aspect-square mb-4"><img src={masterProductImage!} className="w-full h-full object-contain" /></div>

                    {/* Weight Specs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-900 p-4 border border-white/10 col-span-2">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-[10px] uppercase text-gray-500 font-bold">Packaging (Folded)</div>
                          <div className="text-[10px] uppercase text-purple-400 font-bold">L x W x H (cm)</div>
                        </div>
                        <div className="text-xl font-mono">{techPackResult.specs.packaging.lengthCm} x {techPackResult.specs.packaging.widthCm} x {techPackResult.specs.packaging.heightCm} cm</div>
                      </div>

                      <div className="bg-neutral-900 p-4 border border-white/10">
                        <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Unit Weight</div>
                        <div className="text-2xl font-mono">{techPackResult.specs.estimatedUnitWeightKg.toFixed(2)} <span className="text-sm text-gray-500">kg</span></div>
                      </div>

                      <div className="bg-neutral-900 p-4 border border-white/10">
                        <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Total Weight ({masterQuantity})</div>
                        <div className="text-2xl font-mono text-purple-400">{(techPackResult.specs.estimatedUnitWeightKg * masterQuantity).toFixed(1)} <span className="text-sm text-gray-500">kg</span></div>
                      </div>
                    </div>
                  </div>

                  {/* BOM Table */}
                  <div className="bg-neutral-900 border border-white/10 p-6">
                    <h3 className="text-lg font-bold brand-font mb-4 border-b border-white/5 pb-2">Bill of Materials</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-[10px] uppercase text-gray-500 font-bold border-b border-white/10">
                          <tr><th className="pb-2">Component</th><th className="pb-2">Spec</th><th className="pb-2 text-right">Unit Cons.</th><th className="pb-2 text-right">Total ({masterQuantity})</th></tr>
                        </thead>
                        <tbody className="font-mono text-gray-300">
                          {techPackResult.bom.map((item, i) => (
                            <tr key={i} className="border-b border-white/5 last:border-0">
                              <td className="py-3 pr-2">{item.component}</td>
                              <td className="py-3 pr-2 text-gray-500">{item.specification}</td>
                              <td className="py-3 text-right">{item.unitConsumption}</td>
                              <td className="py-3 text-right text-purple-400">{item.totalConsumption}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Size Chart */}
                <div className="bg-neutral-900 border border-white/10 p-6">
                  <h3 className="text-lg font-bold brand-font mb-4">Graded Size Chart (Inches)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center">
                      <thead className="bg-white/5 text-[10px] font-bold uppercase text-gray-400">
                        <tr>
                          <th className="py-3 px-4 text-left">Measurement</th>
                          {Object.keys(techPackResult.sizeChart).map(size => (
                            <th key={size} className="py-3 px-4 text-white">{size}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="font-mono text-sm text-gray-300">
                        {Object.keys(Object.values(techPackResult.sizeChart)[0] || {}).map((measureKey, idx) => (
                          <tr key={measureKey} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 text-left font-bold text-gray-500 uppercase text-xs">{measureKey}</td>
                            {Object.keys(techPackResult.sizeChart).map(size => (
                              <td key={size} className="py-3 px-4">{techPackResult.sizeChart[size][measureKey]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          }

          {
            appMode === 'rebranding' && step === AppStep.REBRAND_UPLOAD && (
              <div className="max-w-xl mx-auto py-12 animate-fade-in text-center">
                <h2 className="text-3xl font-bold brand-font mb-2 uppercase">Rebranding Studio</h2>
                <p className="text-gray-400 mb-8">Upload a product image to begin iterative AI revisions.</p>

                <div
                  onClick={() => rebrandImageRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-purple-500 rounded-2xl p-12 cursor-pointer transition-all hover:bg-white/5 mb-8 group"
                >
                  {rebrandImage ? (
                    <div className="relative aspect-square w-48 mx-auto">
                      <img src={rebrandImage} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-gray-400 group-hover:text-white">
                      <UploadIcon className="w-12 h-12" />
                      <span className="uppercase font-bold tracking-widest text-xs">Upload Image</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={rebrandImageRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setRebrandImage)}
                />

                <Button
                  fullWidth
                  onClick={() => setStep(AppStep.REBRAND_RESULTS)}
                  disabled={!rebrandImage}
                >
                  Start Rebranding
                </Button>
              </div>
            )
          }

          {
            appMode === 'rebranding' && step === AppStep.REBRAND_RESULTS && rebrandImage && (
              <div className="max-w-6xl mx-auto py-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Main Preview */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-neutral-900 border border-white/10 p-4 aspect-square relative group">
                      <img
                        src={rebrandImage.startsWith('data:') ? rebrandImage : `data:image/png;base64,${rebrandImage}`}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={(e) => handleDownload(e, rebrandImage, 'Rebranded_Result')}
                          className="p-3 bg-black/50 hover:bg-purple-600 rounded-full transition-colors"
                          title="Download"
                        >
                          <DownloadIcon />
                        </button>
                      </div>
                    </div>

                    {/* Revision Control */}
                    <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Modify this Design</h3>

                      {/* Reference Image Preview */}
                      {rebrandReferenceImage && (
                        <div className="mb-4 relative inline-block">
                          <img src={rebrandReferenceImage} className="h-16 w-16 object-cover rounded border border-purple-500" />
                          <button
                            onClick={() => setRebrandReferenceImage(null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-[10px]"
                          >✕</button>
                          <span className="text-[9px] text-purple-400 block mt-1">Ref Image Attached</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <input
                            type="text"
                            value={rebrandPrompt}
                            onChange={(e) => setRebrandPrompt(e.target.value)}
                            onPaste={(e) => {
                              const items = e.clipboardData.items;
                              for (let i = 0; i < items.length; i++) {
                                if (items[i].type.indexOf("image") !== -1) {
                                  const blob = items[i].getAsFile();
                                  const reader = new FileReader();
                                  reader.onload = (event) => setRebrandReferenceImage(event.target?.result as string);
                                  if (blob) reader.readAsDataURL(blob);
                                  e.preventDefault();
                                }
                              }
                            }}
                            placeholder="e.g., 'Add this logo' (Paste image here) or 'Change to green'..."
                            className="w-full bg-black border border-white/10 p-4 font-mono text-sm focus:border-purple-500 outline-none pr-10"
                            onKeyDown={(e) => e.key === 'Enter' && handleRebrandGeneration()}
                          />
                          <button
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            onClick={() => rebrandImageRef.current?.click()}
                            title="Upload Reference Image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                          </button>
                          <input
                            type="file"
                            ref={rebrandImageRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, setRebrandReferenceImage)}
                          />
                        </div>
                        <Button onClick={handleRebrandGeneration} disabled={!rebrandPrompt || loading}>
                          {loading ? 'Revising...' : 'Generate Edit'}
                        </Button>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2 italic">✨ AI will modify the image based on your instructions. Results are saved in history below.</p>
                    </div>
                  </div>

                  {/* History Gallery */}
                  <div className="bg-neutral-900 border border-white/10 p-6 flex flex-col">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex justify-between items-center">
                      Design History
                      {rebrandHistory.length > 0 && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                          {rebrandHistory.length} Versions
                        </span>
                      )}
                    </h3>

                    <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[600px]">
                      {rebrandHistory.length === 0 && (
                        <div className="text-center py-12 text-gray-600">
                          <p className="text-xs uppercase tracking-widest">No history yet</p>
                        </div>
                      )}
                      {rebrandHistory.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setRebrandImage(img)}
                          className={`group relative aspect-square cursor-pointer border-2 transition-all ${rebrandImage === img ? 'border-purple-500' : 'border-white/5 hover:border-white/20'}`}
                        >
                          <img
                            src={img.startsWith('data:') ? img : `data:image/png;base64,${img}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-white text-black px-2 py-1">Load</span>
                          </div>
                          <div className="absolute bottom-1 right-1 text-[8px] bg-black/60 text-gray-400 px-1">V{rebrandHistory.length - idx}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5">
                      <Button variant="outline" fullWidth onClick={() => handleReset('rebranding')}>Start Fresh</Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {/* TECH PACK GENERATOR MODE */}
          {appMode === 'techpack_generator' && (
            <TechPackGenerator onBack={() => handleReset('techpack_generator')} />
          )}

          {/* SOCIAL MEDIA STUDIO MODE */}
          {appMode === 'social_studio' && (
            <SocialMediaStudio onBack={() => handleReset('social_studio')} />
          )}

        </main>
      </div>

      {/* Hidden File Inputs */}
      <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleImageUpload(e, setLogo)} className="hidden" />
      <input type="file" accept="image/*" ref={ghostFrontRef} onChange={(e) => handleImageUpload(e, setGhostFrontImage)} className="hidden" />
      <input type="file" accept="image/*" ref={ghostBackRef} onChange={(e) => handleImageUpload(e, setGhostBackImage)} className="hidden" />
      <input type="file" accept="image/*" ref={bannerProductRef} onChange={(e) => handleImageUpload(e, setBannerProductImage)} className="hidden" />
      <input type="file" accept="image/*" ref={photoshootProductRef} onChange={(e) => handleImageUpload(e, setPhotoshootProductImage)} className="hidden" />
      <input type="file" ref={photoshootRealModelRef} onChange={(e) => handleImageUpload(e, setPhotoshootRealModelImage)} className="hidden" accept="image/*" />
      <input type="file" ref={customInspirationRef} onChange={(e) => handleImageUpload(e, setCustomInspirationImage)} className="hidden" accept="image/*" />
      <input type="file" ref={masterImageRef} onChange={(e) => handleImageUpload(e, setMasterProductImage)} className="hidden" accept="image/*" />

      {/* Style Choice Modal */}
      {showStyleChoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <div className="bg-neutral-900 border border-white/10 w-full max-w-4xl shadow-2xl rounded-2xl animate-slide-up overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-neutral-950">
              <div>
                <h2 className="text-2xl font-bold brand-font uppercase text-white tracking-widest">Design Studio <span className="text-purple-500">v2.1</span></h2>
                <p className="text-xs text-gray-500 font-mono mt-1">Configure your generation parameters</p>
              </div>
              <button onClick={() => setShowStyleChoiceModal(false)} className="text-gray-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
              <div className="flex gap-8 mb-8">
                <button
                  onClick={() => setCustomizationParams({ ...customizationParams, mode: 'autopilot' })}
                  className={`flex-1 p-6 border-2 rounded-xl text-left transition-all ${customizationParams.mode === 'autopilot' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                  <h3 className={`text-lg font-bold uppercase mb-2 ${customizationParams.mode === 'autopilot' ? 'text-white' : 'text-gray-400'}`}>AI Autopilot</h3>
                  <p className="text-xs text-gray-500">Let the System Core analyze trends and generate optimal designs for the selected category automatically.</p>
                </button>
                <button
                  onClick={() => setCustomizationParams({ ...customizationParams, mode: 'custom' })}
                  className={`flex-1 p-6 border-2 rounded-xl text-left transition-all ${customizationParams.mode === 'custom' ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                  <h3 className={`text-lg font-bold uppercase mb-2 ${customizationParams.mode === 'custom' ? 'text-white' : 'text-gray-400'}`}>Custom Craft</h3>
                  <p className="text-xs text-gray-500">Take manual control. Define specific colors, embellishment techniques, and graphic placements.</p>
                </button>
              </div>

              {customizationParams.mode === 'autopilot' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => { setShowStyleChoiceModal(false); startDesignProcess(selectedCategory, 'genz-us'); }} className="p-8 border border-white/5 hover:border-purple-500 bg-white/5 hover:bg-white/10 transition-all text-left rounded-xl group">
                    <h3 className="text-xl font-bold text-gray-300 group-hover:text-purple-400 mb-2">US STREETWEAR</h3>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Baggy Fits • Bold Details</p>
                  </button>
                  <button onClick={() => { setShowStyleChoiceModal(false); startDesignProcess(selectedCategory, 'european'); }} className="p-8 border border-white/5 hover:border-purple-500 bg-white/5 hover:bg-white/10 transition-all text-left rounded-xl group">
                    <h3 className="text-xl font-bold text-gray-300 group-hover:text-purple-400 mb-2">EURO MINIMALIST</h3>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Clean Lines • Tech Fabrics</p>
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in">

                  {/* Color Palette Section */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-cyan-400">1. Color Palette</label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="e.g. Neon Green, Matte Black, and Chrome accents..."
                        value={customizationParams.colors || ''}
                        onChange={(e) => setCustomizationParams({ ...customizationParams, colors: e.target.value })}
                        className="flex-grow bg-black border border-white/20 p-4 text-sm font-mono focus:border-cyan-500 outline-none rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Techniques Section */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-cyan-400">2. Embellishment Techniques</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {EMBELLISHMENT_TECHNIQUES.map(tech => (
                        <button
                          key={tech}
                          onClick={() => {
                            const current = customizationParams.techniques || [];
                            const updated = current.includes(tech)
                              ? current.filter(t => t !== tech)
                              : [...current, tech];
                            setCustomizationParams({ ...customizationParams, techniques: updated });
                          }}
                          className={`p-3 text-xs font-bold uppercase tracking-wide border rounded-lg transition-all ${customizationParams.techniques?.includes(tech)
                            ? 'bg-cyan-500 text-black border-cyan-500'
                            : 'bg-transparent text-gray-500 border-white/10 hover:border-cyan-500/50'
                            }`}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Graphic Style Section */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-cyan-400">3. Graphic Placement</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {GRAPHIC_STYLES.map(style => (
                        <button
                          key={style}
                          onClick={() => {
                            const current = customizationParams.graphics || [];
                            const updated = current.includes(style)
                              ? current.filter(s => s !== style)
                              : [...current, style];
                            setCustomizationParams({ ...customizationParams, graphics: updated });
                          }}
                          className={`p-3 text-xs font-bold uppercase tracking-wide border rounded-lg transition-all ${customizationParams.graphics?.includes(style)
                            ? 'bg-purple-500 text-white border-purple-500'
                            : 'bg-transparent text-gray-500 border-white/10 hover:border-purple-500/50'
                            }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vibe Section */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-cyan-400">4. Core Vibe / Finish</label>
                    <input
                      type="text"
                      placeholder="e.g. 90s Grunge, Y2K Futurist, Luxury Minimalist..."
                      value={customizationParams.vibe || ''}
                      onChange={(e) => setCustomizationParams({ ...customizationParams, vibe: e.target.value })}
                      className="w-full bg-black border border-white/20 p-4 text-sm font-mono focus:border-cyan-500 outline-none rounded-lg"
                    />
                  </div>

                  <div className="pt-8 border-t border-white/10 flex justify-end">
                    <Button
                      className="px-12 py-4 text-sm font-bold uppercase tracking-widest"
                      onClick={() => {
                        setShowStyleChoiceModal(false);
                        startDesignProcess(selectedCategory, undefined, undefined, undefined, customizationParams);
                      }}
                    >
                      Generate Custom Design
                    </Button>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
