import { useState, useEffect } from "react";
import { replacer } from "@/lib/replacer";

interface TransNameSettings {
  deadname: string;
  preferredName: string;
  oldPronouns: string;
  newPronouns: string;
  customOldPronouns?: string;
  customNewPronouns?: string;
  preserveCase: boolean;
  highlightReplacements: boolean;
  wholeWord: boolean;
  isActive: boolean;
}

interface TransNameStats {
  nameReplacements: number;
  pronounReplacements: number;
}

// Default settings
const defaultSettings: TransNameSettings = {
  deadname: "",
  preferredName: "",
  oldPronouns: "he/him",
  newPronouns: "she/her",
  preserveCase: true,
  highlightReplacements: true,
  wholeWord: true,
  isActive: true,
};

export function useTransName() {
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState<TransNameSettings>(() => {
    const savedSettings = localStorage.getItem("transname-settings");
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Track replacement statistics
  const [stats, setStats] = useState<TransNameStats>({
    nameReplacements: 0,
    pronounReplacements: 0,
  });

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem("transname-settings", JSON.stringify(settings));
  }, [settings]);

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem("transname-stats");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // Update localStorage when stats change
  useEffect(() => {
    localStorage.setItem("transname-stats", JSON.stringify(stats));
  }, [stats]);

  // Enable/disable the replacer 
  useEffect(() => {
    if (settings.isActive && settings.deadname && settings.preferredName) {
      const observer = replacer.observe({
        deadname: settings.deadname,
        preferredName: settings.preferredName,
        oldPronouns: settings.oldPronouns === "custom" ? settings.customOldPronouns || "" : settings.oldPronouns,
        newPronouns: settings.newPronouns === "custom" ? settings.customNewPronouns || "" : settings.newPronouns,
        preserveCase: settings.preserveCase,
        highlightReplacements: settings.highlightReplacements,
        wholeWord: settings.wholeWord,
        onReplace: (nameCount, pronounCount) => {
          setStats(prev => ({
            nameReplacements: prev.nameReplacements + nameCount,
            pronounReplacements: prev.pronounReplacements + pronounCount
          }));
        }
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [settings]);

  // Reset stats
  const resetStats = () => {
    setStats({
      nameReplacements: 0,
      pronounReplacements: 0,
    });
  };

  // Clear all settings
  const clearSettings = () => {
    setSettings(defaultSettings);
    resetStats();
  };

  return {
    settings,
    setSettings,
    stats,
    resetStats,
    clearSettings,
    totalReplacements: stats.nameReplacements + stats.pronounReplacements,
  };
}
