import React, { useState, useEffect } from "react";
import { useTransName } from "@/hooks/use-transname";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Simplified bookmarklet generator
const SimpleBookmarklet = () => {
  const { settings } = useTransName();
  const [bookmarkletUrl, setBookmarkletUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (settings.deadname && settings.preferredName) {
      // Create a simple version of the bookmarklet code
      const code = `
        (function() {
          // Basic variables from settings
          const deadname = "${settings.deadname}";
          const preferredName = "${settings.preferredName}";
          
          // Handle pronouns based on transition type or custom settings
          let oldPronouns = "";
          let newPronouns = "";
          
          if ("${settings.oldPronouns}" === "mtf") {
            oldPronouns = "he/him";
            newPronouns = "she/her";
          } 
          else if ("${settings.oldPronouns}" === "ftm") {
            oldPronouns = "she/her";
            newPronouns = "he/him";
          }
          else if ("${settings.oldPronouns}" === "nonbinary") {
            // For non-binary transitions, we'll assume they're coming from either he/him or she/her
            // based on the deadname vs preferred name
            oldPronouns = "${settings.deadname.toLowerCase() !== settings.deadname}" ? "he/him" : "she/her";
            newPronouns = "they/them";
          }
          else if ("${settings.oldPronouns}" === "custom") {
            oldPronouns = "${settings.customOldPronouns || ""}";
            newPronouns = "${settings.customNewPronouns || ""}";
          }
          
          const preserveCase = ${settings.preserveCase};
          const wholeWord = ${settings.wholeWord};
          
          // Display notification
          const status = document.createElement('div');
          status.style.position = 'fixed';
          status.style.bottom = '10px';
          status.style.right = '10px';
          status.style.backgroundColor = 'rgba(255,255,255,0.9)';
          status.style.padding = '8px 12px';
          status.style.borderRadius = '4px';
          status.style.zIndex = '9999';
          status.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
          status.textContent = 'TransName activated';
          document.body.appendChild(status);
          setTimeout(() => status.remove(), 3000);
          
          // Process all text nodes
          function walkTextNodes(node) {
            if (node.nodeType === 3) { // Text node
              // Get original text
              const original = node.nodeValue;
              
              // Replace deadname with preferred name
              let namePattern = wholeWord ? '\\\\b' + deadname + '\\\\b' : deadname;
              const nameRegex = new RegExp(namePattern, 'gi');
              let newText = original.replace(nameRegex, (match) => {
                // Preserve case if needed
                if (!preserveCase) return preferredName;
                if (match === match.toUpperCase()) return preferredName.toUpperCase();
                if (match[0] === match[0].toUpperCase()) {
                  return preferredName.charAt(0).toUpperCase() + preferredName.slice(1);
                }
                return preferredName;
              });
              
              // Replace pronouns if provided
              if (oldPronouns && newPronouns) {
                // Simple pronoun replacement for common sets
                let oldPronounList = [];
                let newPronounList = [];
                
                // Extract pronoun lists based on common sets
                if (oldPronouns.includes('he/him')) {
                  oldPronounList = ['he', 'him', 'his', "he's", 'himself'];
                } else if (oldPronouns.includes('she/her')) {
                  oldPronounList = ['she', 'her', 'hers', "she's", 'herself'];
                } else if (oldPronouns.includes('they/them')) {
                  oldPronounList = ['they', 'them', 'their', "they're", 'themselves'];
                }
                
                if (newPronouns.includes('he/him')) {
                  newPronounList = ['he', 'him', 'his', "he's", 'himself'];
                } else if (newPronouns.includes('she/her')) {
                  newPronounList = ['she', 'her', 'hers', "she's", 'herself'];
                } else if (newPronouns.includes('they/them')) {
                  newPronounList = ['they', 'them', 'their', "they're", 'themselves'];
                }
                
                // Replace each pronoun
                for (let i = 0; i < oldPronounList.length && i < newPronounList.length; i++) {
                  const oldPronoun = oldPronounList[i];
                  const newPronoun = newPronounList[i];
                  
                  if (oldPronoun && newPronoun) {
                    let pronounPattern = wholeWord ? '\\\\b' + oldPronoun + '\\\\b' : oldPronoun;
                    const pronounRegex = new RegExp(pronounPattern, 'gi');
                    
                    newText = newText.replace(pronounRegex, (match) => {
                      // Preserve case if needed
                      if (!preserveCase) return newPronoun;
                      if (match === match.toUpperCase()) return newPronoun.toUpperCase();
                      if (match[0] === match[0].toUpperCase()) {
                        return newPronoun.charAt(0).toUpperCase() + newPronoun.slice(1);
                      }
                      return newPronoun;
                    });
                  }
                }
              }
              
              // Update text if changes were made
              if (newText !== original) {
                node.nodeValue = newText;
              }
            } else if (node.nodeType === 1) { // Element node
              // Skip certain elements
              if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || 
                  node.tagName === 'TEXTAREA' || node.tagName === 'INPUT') {
                return;
              }
              
              // Process child nodes
              Array.from(node.childNodes).forEach(child => {
                walkTextNodes(child);
              });
            }
          }
          
          // Process all text in the document
          walkTextNodes(document.body);
          
          // Set up observer for dynamic content
          const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
              if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                  walkTextNodes(node);
                });
              }
            });
          });
          
          // Start observing
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          
          console.log("TransName: Replacing " + deadname + " with " + preferredName);
        })();
      `;
      
      // Compress the code by removing whitespace and comments
      const compressed = code
        .replace(/\s{2,}/g, ' ')
        .replace(/\n/g, '')
        .trim();
      
      // Create the bookmarklet URL
      setBookmarkletUrl(`javascript:${encodeURIComponent(compressed)}`);
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

export default SimpleBookmarklet;