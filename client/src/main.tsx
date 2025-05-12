import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { replacer } from "./lib/replacer";

// Create a custom element to append to the body
const appRoot = document.createElement('div');
appRoot.id = 'transname-root';
appRoot.style.position = 'fixed';
appRoot.style.zIndex = '9999999'; // Ensure it's above everything
document.body.appendChild(appRoot);

// Add the extension to any browser tab
if (window.location.pathname !== "/") {
  // Load settings from local storage when running on external sites
  const savedSettings = localStorage.getItem("transname-settings");
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    if (settings.isActive && settings.deadname && settings.preferredName) {
      // Activate the replacer immediately
      replacer.observe({
        deadname: settings.deadname,
        preferredName: settings.preferredName,
        oldPronouns: settings.oldPronouns === "custom" ? settings.customOldPronouns || "" : settings.oldPronouns,
        newPronouns: settings.newPronouns === "custom" ? settings.customNewPronouns || "" : settings.newPronouns,
        preserveCase: settings.preserveCase,
        highlightReplacements: settings.highlightReplacements,
        wholeWord: settings.wholeWord,
        onReplace: (nameCount, pronounCount) => {
          // Update stats in localStorage
          const savedStats = localStorage.getItem("transname-stats");
          const stats = savedStats ? JSON.parse(savedStats) : { nameReplacements: 0, pronounReplacements: 0 };
          
          stats.nameReplacements += nameCount;
          stats.pronounReplacements += pronounCount;
          
          localStorage.setItem("transname-stats", JSON.stringify(stats));
        }
      });
    }
  }
}

createRoot(appRoot).render(<App />);
