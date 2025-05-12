import React from "react";
import { User, BookmarkIcon } from "lucide-react";
import SimpleBookmarklet from "@/components/SimpleBookmarklet";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 pb-32">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-[#55CDFC] via-[#F7A8B8] to-[#55CDFC] text-transparent bg-clip-text inline-block">TransName</h1>
        <div className="h-1 w-32 mx-auto bg-gradient-to-r from-[#55CDFC] via-[#F7A8B8] to-[#55CDFC]"></div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-[#55CDFC]">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-[#F7A8B8]">
          About TransName
        </h2>
        <p className="mb-4">
          TransName is a browser-based tool that helps transgender users see their preferred name and pronouns
          instead of deadnames across websites. It works entirely in your browser, so your data never leaves your device.
        </p>
        <p className="mb-4">
          Use the floating user button in the bottom-right corner to open the tool and configure your settings.
          Then use the bookmarklet to apply name replacements on any website.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-[#F7A8B8]">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-[#55CDFC]">
          How It Works
        </h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Enter your deadname (the name you want to replace) and your preferred name</li>
          <li>Select your original pronouns and preferred pronouns</li>
          <li>Adjust settings like case preservation and highlighting if needed</li>
          <li>Save your settings, then drag the bookmarklet to your bookmarks bar</li>
          <li>Click the bookmarklet on any website to activate TransName</li>
        </ol>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-[#55CDFC]">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-[#F7A8B8]">
          Features
        </h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Replace deadname with preferred name across <span className="font-semibold text-[#55CDFC]">any website</span>, including emails and student portals</li>
          <li>Replace incorrect pronouns with preferred pronouns</li>
          <li>Preserve capitalization when making replacements</li>
          <li>Highlight replaced text to see where changes were made</li>
          <li>Track statistics on name and pronoun replacements</li>
          <li>No download required - works entirely in your browser as a bookmarklet</li>
          <li>Your data stays private and is stored only on your device</li>
        </ul>
      </div>
      
      {/* Bookmarklet Generator Component */}
      <SimpleBookmarklet />
      
      <div className="mt-8 text-center">
        <div className="inline-block p-4 bg-white rounded-lg shadow-md">
          <p className="text-sm text-neutral-700">
            Click the floating user button in the bottom-right to get started!
          </p>
        </div>
      </div>
    </div>
  );
}
