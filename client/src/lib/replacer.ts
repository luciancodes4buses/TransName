interface ReplacerConfig {
  deadname: string;
  preferredName: string;
  oldPronouns: string;
  newPronouns: string;
  preserveCase: boolean;
  highlightReplacements: boolean;
  wholeWord: boolean;
  onReplace?: (nameCount: number, pronounCount: number) => void;
}

interface ReplacerObserver {
  disconnect: () => void;
}

// Helper function to replace text while preserving case pattern
function replaceWithCase(original: string, replacement: string, preserveCase: boolean): string {
  if (!preserveCase) return replacement;

  // Check if original is all uppercase
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }

  // Check if original is capitalized (first letter uppercase)
  if (original[0] === original[0].toUpperCase() && original.slice(1) === original.slice(1).toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1).toLowerCase();
  }

  // Default to replacement as-is (assume lowercase)
  return replacement;
}

// Helper function to process pronoun sets
function processPronouns(pronounString: string): {[key: string]: string} {
  const pronounMap: {[key: string]: string} = {};
  
  if (pronounString.includes('he/him')) {
    pronounMap['he'] = 'he';
    pronounMap['him'] = 'him';
    pronounMap['his'] = 'his';
    pronounMap["he's"] = "he's";
    pronounMap["himself"] = "himself";
  } else if (pronounString.includes('she/her')) {
    pronounMap['she'] = 'she';
    pronounMap['her'] = 'her';
    pronounMap['hers'] = 'hers';
    pronounMap["she's"] = "she's";
    pronounMap["herself"] = "herself";
  } else if (pronounString.includes('they/them')) {
    pronounMap['they'] = 'they';
    pronounMap['them'] = 'them';
    pronounMap['their'] = 'their';
    pronounMap["they're"] = "they're";
    pronounMap["themselves"] = "themselves";
  } else if (pronounString.includes('ze/zir')) {
    pronounMap['ze'] = 'ze';
    pronounMap['zir'] = 'zir';
    pronounMap['zirs'] = 'zirs';
    pronounMap["ze's"] = "ze's";
    pronounMap["zirself"] = "zirself";
  } else {
    // Custom pronoun handling for comma-separated formats
    const parts = pronounString.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      pronounMap[parts[0]] = parts[0]; // subject
      pronounMap[parts[1]] = parts[1]; // object
      if (parts[2]) pronounMap[parts[2]] = parts[2]; // possessive
    }
  }
  
  return pronounMap;
}

// Helper function to create a pronoun mapping from old to new
function createPronounMapping(oldPronouns: string, newPronouns: string): {[key: string]: string} {
  const oldMap = processPronouns(oldPronouns);
  const newMap = processPronouns(newPronouns);
  
  const mapping: {[key: string]: string} = {};
  
  // Map old pronouns to new pronouns based on position (subject, object, possessive)
  const oldKeys = Object.keys(oldMap);
  const newValues = Object.values(newMap);
  
  oldKeys.forEach((key, index) => {
    if (index < newValues.length) {
      mapping[key] = newValues[index];
    }
  });
  
  return mapping;
}

// Highlight an element to show a replacement has occurred
function highlightElement(element: Node, config: ReplacerConfig) {
  if (!config.highlightReplacements || element.nodeType !== Node.ELEMENT_NODE) return;
  
  const el = element as HTMLElement;
  el.classList.add('transname-highlight');
  
  // Add the style for highlight animation if it doesn't exist yet
  if (!document.getElementById('transname-style')) {
    const style = document.createElement('style');
    style.id = 'transname-style';
    style.textContent = `
      @keyframes transname-highlight-fade {
        0% { background-color: rgba(138, 43, 226, 0.3); }
        100% { background-color: transparent; }
      }
      .transname-highlight {
        animation: transname-highlight-fade 2s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => {
    el.classList.remove('transname-highlight');
  }, 2000);
}

// Process text node to replace deadnames and pronouns
function processTextNode(textNode: Text, config: ReplacerConfig): [number, number] {
  let nameCount = 0;
  let pronounCount = 0;
  
  if (!textNode.textContent || textNode.textContent.trim() === '') return [0, 0];
  
  let text = textNode.textContent;
  const originalText = text;
  
  // Get the deadname variations
  const deadNameVariations = config.deadname
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);
  
  // Generate whole word boundary if needed
  const wordBoundary = config.wholeWord ? '\\b' : '';
  
  // Replace deadname with preferred name
  deadNameVariations.forEach(name => {
    if (!name) return;
    
    const regex = new RegExp(`${wordBoundary}${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${wordBoundary}`, 'gi');
    
    text = text.replace(regex, match => {
      nameCount++;
      return replaceWithCase(match, config.preferredName, config.preserveCase);
    });
  });
  
  // Replace pronouns
  if (config.oldPronouns && config.newPronouns) {
    const pronounMapping = createPronounMapping(config.oldPronouns, config.newPronouns);
    
    Object.entries(pronounMapping).forEach(([oldPronoun, newPronoun]) => {
      if (!oldPronoun || !newPronoun) return;
      
      const pronounRegex = new RegExp(`${wordBoundary}${oldPronoun.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${wordBoundary}`, 'gi');
      
      text = text.replace(pronounRegex, match => {
        pronounCount++;
        return replaceWithCase(match, newPronoun, config.preserveCase);
      });
    });
  }
  
  // Only update the text content if there were replacements
  if (text !== originalText) {
    textNode.textContent = text;
    // Try to highlight parent element if there's a replacement
    if (textNode.parentElement) {
      highlightElement(textNode.parentElement, config);
    }
  }
  
  return [nameCount, pronounCount];
}

// Process element and its children recursively
function processNode(node: Node, config: ReplacerConfig): [number, number] {
  let nameCount = 0;
  let pronounCount = 0;
  
  // Process text nodes
  if (node.nodeType === Node.TEXT_NODE) {
    const [names, pronouns] = processTextNode(node as Text, config);
    nameCount += names;
    pronounCount += pronouns;
  } 
  // Skip script, style, and form input elements
  else if (
    node.nodeType === Node.ELEMENT_NODE && 
    !['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT'].includes((node as Element).tagName)
  ) {
    // Process child nodes recursively
    for (const childNode of Array.from(node.childNodes)) {
      const [childNames, childPronouns] = processNode(childNode, config);
      nameCount += childNames;
      pronounCount += childPronouns;
    }
  }
  
  return [nameCount, pronounCount];
}

class Replacer {
  private observer: MutationObserver | null = null;
  private config: ReplacerConfig | null = null;
  
  // Function to scan for iframes
  private scanForIframes(config: ReplacerConfig) {
    // Try to process iframes if they exist on the page (like email clients)
    try {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          if (iframe.contentDocument && iframe.contentDocument.body) {
            // Process iframe content
            const [iframeNames, iframePronouns] = processNode(iframe.contentDocument.body, config);
            
            // Notify of iframe replacements if there are any
            if (iframeNames > 0 || iframePronouns > 0) {
              config.onReplace?.(iframeNames, iframePronouns);
            }
            
            // Observe iframe content for changes if possible
            if (this.observer && iframe.contentDocument) {
              this.observer.observe(iframe.contentDocument.body, {
                childList: true,
                subtree: true,
                characterData: true,
              });
            }
          }
        } catch (e) {
          // Cross-origin iframe access will throw errors, we can ignore these
          console.debug("Could not access iframe content (likely cross-origin)");
        }
      });
    } catch (e) {
      console.debug("Error processing iframes:", e);
    }
  }
  
  // Start observing DOM changes
  observe(config: ReplacerConfig): ReplacerObserver {
    this.disconnect(); // Disconnect any existing observer
    this.config = config;
    
    // Skip if no config or essential fields are missing
    if (!config || !config.deadname || !config.preferredName) {
      return { disconnect: () => {} };
    }
    
    // Process the existing DOM first
    const [initialNameCount, initialPronounCount] = processNode(document.body, config);
    
    // Notify of initial replacements if there are any
    if (initialNameCount > 0 || initialPronounCount > 0) {
      config.onReplace?.(initialNameCount, initialPronounCount);
    }
    
    // Create mutation observer to watch for DOM changes
    this.observer = new MutationObserver(mutations => {
      let nameCount = 0;
      let pronounCount = 0;
      
      for (const mutation of mutations) {
        // Skip if mutation is in our own injected styles
        if (mutation.target.nodeType === Node.ELEMENT_NODE && 
            (mutation.target as Element).id === 'transname-style') continue;
        
        // Process added nodes
        if (mutation.type === 'childList') {
          for (const node of Array.from(mutation.addedNodes)) {
            const [names, pronouns] = processNode(node, config);
            nameCount += names;
            pronounCount += pronouns;
            
            // Check if this is an iframe being added
            if (node.nodeName === 'IFRAME') {
              // Wait for iframe to load
              (node as HTMLIFrameElement).addEventListener('load', () => {
                this.scanForIframes(config);
              });
            }
          }
        }
        // Process changed text
        else if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
          const [names, pronouns] = processTextNode(mutation.target as Text, config);
          nameCount += names;
          pronounCount += pronouns;
        }
      }
      
      // Notify of replacements if there are any
      if (nameCount > 0 || pronounCount > 0) {
        config.onReplace?.(nameCount, pronounCount);
      }
    });
    
    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    
    // Scan for iframes
    this.scanForIframes(config);
    
    // Periodically rescan the page (for email clients and dynamic content)
    const intervalId = setInterval(() => {
      // Re-process the entire DOM to catch anything that might have been missed
      const [names, pronouns] = processNode(document.body, config);
      if (names > 0 || pronouns > 0) {
        config.onReplace?.(names, pronouns);
      }
      
      // Scan for new iframes
      this.scanForIframes(config);
    }, 2000); // Every 2 seconds
    
    return {
      disconnect: () => {
        this.disconnect();
        clearInterval(intervalId);
      },
    };
  }
  
  // Disconnect observer
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export const replacer = new Replacer();
