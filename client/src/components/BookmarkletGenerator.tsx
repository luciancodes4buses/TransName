import React, { useState, useEffect } from "react";
import { useTransName } from "@/hooks/use-transname";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Minified replacer implementation for bookmarklet
const getBookmarkletCode = (settings: any): string => {
  // Create a simplified version of our replacer code for the bookmarklet
  const bookmarkletCode = `
    (function() {
      // Config from settings
      const config = {
        deadname: "${settings.deadname}",
        preferredName: "${settings.preferredName}",
        oldPronouns: "${settings.oldPronouns === "custom" ? settings.customOldPronouns || "" : settings.oldPronouns}",
        newPronouns: "${settings.newPronouns === "custom" ? settings.customNewPronouns || "" : settings.newPronouns}",
        preserveCase: ${settings.preserveCase},
        highlightReplacements: ${settings.highlightReplacements},
        wholeWord: ${settings.wholeWord}
      };

      // Storage for stats
      const stats = { nameReplacements: 0, pronounReplacements: 0 };
      
      // Helper function to replace text while preserving case
      function replaceWithCase(original, replacement, preserveCase) {
        if (!preserveCase) return replacement;
        if (original === original.toUpperCase()) {
          return replacement.toUpperCase();
        }
        if (original[0] === original[0].toUpperCase() && original.slice(1) === original.slice(1).toLowerCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1).toLowerCase();
        }
        return replacement;
      }
      
      // Process pronouns
      function processPronouns(pronounString) {
        const pronounMap = {};
        if (pronounString.includes('he/him')) {
          pronounMap['he'] = 'he'; pronounMap['him'] = 'him'; pronounMap['his'] = 'his';
          pronounMap["he's"] = "he's"; pronounMap["himself"] = "himself";
        } else if (pronounString.includes('she/her')) {
          pronounMap['she'] = 'she'; pronounMap['her'] = 'her'; pronounMap['hers'] = 'hers';
          pronounMap["she's"] = "she's"; pronounMap["herself"] = "herself";
        } else if (pronounString.includes('they/them')) {
          pronounMap['they'] = 'they'; pronounMap['them'] = 'them'; pronounMap['their'] = 'their';
          pronounMap["they're"] = "they're"; pronounMap["themselves"] = "themselves";
        } else if (pronounString.includes('ze/zir')) {
          pronounMap['ze'] = 'ze'; pronounMap['zir'] = 'zir'; pronounMap['zirs'] = 'zirs';
          pronounMap["ze's"] = "ze's"; pronounMap["zirself"] = "zirself";
        } else {
          const parts = pronounString.split(',').map(p => p.trim());
          if (parts.length >= 2) {
            pronounMap[parts[0]] = parts[0];
            pronounMap[parts[1]] = parts[1];
            if (parts[2]) pronounMap[parts[2]] = parts[2];
          }
        }
        return pronounMap;
      }
      
      // Create pronoun mapping
      function createPronounMapping(oldPronouns, newPronouns) {
        const oldMap = processPronouns(oldPronouns);
        const newMap = processPronouns(newPronouns);
        const mapping = {};
        const oldKeys = Object.keys(oldMap);
        const newValues = Object.values(newMap);
        oldKeys.forEach((key, index) => {
          if (index < newValues.length) {
            mapping[key] = newValues[index];
          }
        });
        return mapping;
      }
      
      // Highlight elements that have been replaced
      function highlightElement(element, doHighlight) {
        if (!doHighlight || element.nodeType !== Node.ELEMENT_NODE) return;
        const el = element;
        el.classList.add('transname-highlight');
        if (!document.getElementById('transname-style')) {
          const style = document.createElement('style');
          style.id = 'transname-style';
          style.textContent = 
            '@keyframes transname-highlight-fade {' +
            '0% { background-color: rgba(138, 43, 226, 0.3); }' +
            '100% { background-color: transparent; }' +
            '}' +
            '.transname-highlight {' +
            'animation: transname-highlight-fade 2s ease-out forwards;' +
            '}';
          document.head.appendChild(style);
        }
        setTimeout(() => {
          el.classList.remove('transname-highlight');
        }, 2000);
      }
      
      // Process text node to replace deadnames and pronouns
      function processTextNode(textNode, config) {
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
        const wordBoundary = config.wholeWord ? '\\\\b' : '';
        
        // Replace deadname with preferred name
        deadNameVariations.forEach(name => {
          if (!name) return;
          
          const regex = new RegExp(wordBoundary + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + wordBoundary, 'gi');
          
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
            
            const pronounRegex = new RegExp(wordBoundary + oldPronoun.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + wordBoundary, 'gi');
            
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
            highlightElement(textNode.parentElement, config.highlightReplacements);
          }
        }
        
        return [nameCount, pronounCount];
      }
      
      // Process element and its children recursively
      function processNode(node, config) {
        let nameCount = 0;
        let pronounCount = 0;
        
        // Process text nodes
        if (node.nodeType === Node.TEXT_NODE) {
          const [names, pronouns] = processTextNode(node, config);
          nameCount += names;
          pronounCount += pronouns;
        } 
        // Skip script, style, and form input elements
        else if (
          node.nodeType === Node.ELEMENT_NODE && 
          !['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT'].includes(node.tagName)
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
      
      // Function to scan for iframes
      function scanForIframes(config, observer) {
        try {
          const iframes = document.querySelectorAll('iframe');
          iframes.forEach(iframe => {
            try {
              if (iframe.contentDocument && iframe.contentDocument.body) {
                // Process iframe content
                const [iframeNames, iframePronouns] = processNode(iframe.contentDocument.body, config);
                
                // Update stats
                stats.nameReplacements += iframeNames;
                stats.pronounReplacements += iframePronouns;
                
                // Observe iframe content for changes if possible
                if (observer && iframe.contentDocument) {
                  observer.observe(iframe.contentDocument.body, {
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
      
      // Create floating status indicator
      function createStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'transname-status';
        indicator.style.cssText = 'position:fixed;bottom:10px;right:10px;background:rgba(255,255,255,0.9);color:#333;padding:8px 12px;border-radius:4px;font-size:12px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:flex;align-items:center;font-family:system-ui,-apple-system,sans-serif;opacity:0;transition:opacity 0.3s ease;';
        
        const circleDiv = document.createElement('div');
        circleDiv.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#55CDFC;margin-right:8px;';
        indicator.appendChild(circleDiv);
        
        const textDiv = document.createElement('div');
        textDiv.textContent = 'TransName Active';
        indicator.appendChild(textDiv);
        
        document.body.appendChild(indicator);
        
        // Show briefly then fade
        setTimeout(() => {
          indicator.style.opacity = '1';
          setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
              indicator.style.display = 'none';
            }, 300);
          }, 3000);
        }, 100);
        
        // Show again when hovering near the corner
        const cornerTrigger = document.createElement('div');
        cornerTrigger.style.cssText = 'position:fixed;bottom:0;right:0;width:50px;height:50px;z-index:9998;';
        cornerTrigger.addEventListener('mouseenter', () => {
          if (stats.nameReplacements > 0 || stats.pronounReplacements > 0) {
            textDiv.textContent = 'TransName: ' + stats.nameReplacements + ' name + ' + stats.pronounReplacements + ' pronoun replacements';
          } else {
            textDiv.textContent = 'TransName Active';
          }
          indicator.style.display = 'flex';
          indicator.style.opacity = '1';
        });
        cornerTrigger.addEventListener('mouseleave', () => {
          setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
              indicator.style.display = 'none';
            }, 300);
          }, 1000);
        });
        document.body.appendChild(cornerTrigger);
      }
      
      // Main process function
      function processPage() {
        // Process the existing DOM first
        const [initialNameCount, initialPronounCount] = processNode(document.body, config);
        stats.nameReplacements += initialNameCount;
        stats.pronounReplacements += initialPronounCount;
        
        // Create mutation observer to watch for DOM changes
        const observer = new MutationObserver(mutations => {
          let nameCount = 0;
          let pronounCount = 0;
          
          for (const mutation of mutations) {
            // Skip if mutation is in our own injected styles
            if (mutation.target.nodeType === Node.ELEMENT_NODE && 
                mutation.target.id === 'transname-style') continue;
            
            // Process added nodes
            if (mutation.type === 'childList') {
              for (const node of Array.from(mutation.addedNodes)) {
                const [names, pronouns] = processNode(node, config);
                nameCount += names;
                pronounCount += pronouns;
                
                // Check if this is an iframe being added
                if (node.nodeName === 'IFRAME') {
                  // Wait for iframe to load
                  node.addEventListener('load', () => {
                    scanForIframes(config, observer);
                  });
                }
              }
            }
            // Process changed text
            else if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
              const [names, pronouns] = processTextNode(mutation.target, config);
              nameCount += names;
              pronounCount += pronouns;
            }
          }
          
          // Update stats
          stats.nameReplacements += nameCount;
          stats.pronounReplacements += pronounCount;
        });
        
        // Start observing
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });
        
        // Scan for iframes
        scanForIframes(config, observer);
        
        // Create status indicator
        createStatusIndicator();
        
        // Periodically rescan the page
        setInterval(() => {
          // Re-process the entire DOM to catch anything that might have been missed
          const [names, pronouns] = processNode(document.body, config);
          stats.nameReplacements += names;
          stats.pronounReplacements += pronouns;
          
          // Scan for new iframes
          scanForIframes(config, observer);
        }, 2000);
      }
      
      // Start the process
      processPage();
      console.log("TransName activated with settings:", config);
    })();
  `;
  
  // Compress the code for bookmarklet
  const compressed = bookmarkletCode
    .replace(/\s{2,}/g, ' ')
    .replace(/\n/g, '')
    .replace(/\/\/.+?(?=\n|\r|$)/g, ''); // Remove comments
  
  // Create the bookmarklet code with javascript: protocol
  return `javascript:${encodeURIComponent(compressed)}`;
};

const BookmarkletGenerator = () => {
  const { settings } = useTransName();
  const [bookmarkletUrl, setBookmarkletUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (settings.deadname && settings.preferredName) {
      setBookmarkletUrl(getBookmarkletCode(settings));
    }
  }, [settings]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookmarkletUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <Card className="p-4 mt-6 bg-white">
      <h2 className="text-xl font-semibold mb-3 text-[#F7A8B8]">TransName Bookmarklet</h2>
      
      <p className="mb-4">
        Drag this bookmarklet to your bookmarks bar to use TransName on any website:
      </p>
      
      {settings.deadname && settings.preferredName ? (
        <div className="mb-4 flex items-center gap-2">
          <a 
            href={bookmarkletUrl}
            className="px-4 py-2 bg-gradient-to-r from-[#55CDFC] via-[#F7A8B8] to-[#55CDFC] text-white rounded-md font-medium shadow-sm"
            onClick={(e) => e.preventDefault()} // Prevent click to avoid running the bookmarklet
            draggable="true"
          >
            TransName
          </a>
          <p className="text-sm text-neutral-600">← Drag this to your bookmarks bar</p>
        </div>
      ) : (
        <p className="mb-4 text-yellow-600">
          Please set up your deadname and preferred name in the TransName settings first.
        </p>
      )}
      
      <div className="mt-4">
        <Label className="text-sm font-medium mb-1 block">Or copy this bookmarklet URL:</Label>
        <div className="flex gap-2">
          <Input
            value={bookmarkletUrl}
            readOnly
            className="text-xs text-neutral-600 font-mono"
          />
          <Button
            onClick={copyToClipboard}
            className="bg-[#55CDFC] hover:bg-[#55CDFC]/90 text-white"
            disabled={!bookmarkletUrl}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
      
      <div className="mt-6 bg-neutral-100 p-3 rounded-md">
        <h3 className="text-sm font-semibold mb-2">How to use the bookmarklet:</h3>
        <ol className="list-decimal ml-5 text-sm space-y-1 text-neutral-700">
          <li>Configure your settings in the TransName panel (click the user icon)</li>
          <li>Drag the bookmarklet to your bookmarks bar, or create a new bookmark with the copied URL</li>
          <li>Visit any website where you want to replace your deadname</li>
          <li>Click the bookmarklet in your bookmarks bar to activate TransName on that website</li>
          <li>The replacements will be applied automatically to the current page</li>
        </ol>
      </div>
    </Card>
  );
};

export default BookmarkletGenerator;