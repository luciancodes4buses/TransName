import React from "react";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-neutral-800">TransName Tool</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">About TransName</h2>
        <p className="mb-4">
          TransName is a browser-based tool that helps transgender users see their preferred name and pronouns
          instead of deadnames across websites. It works entirely in your browser, so your data never leaves your device.
        </p>
        <p className="mb-4">
          Use the floating button in the bottom-right corner to open the tool and configure your settings.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Enter your deadname (the name you want to replace) and your preferred name</li>
          <li>Select your original pronouns and preferred pronouns</li>
          <li>Adjust settings like case preservation and highlighting if needed</li>
          <li>Click "Save & Apply" to start seeing your preferred name across websites</li>
        </ol>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Replace deadname with preferred name across web pages</li>
          <li>Replace incorrect pronouns with preferred pronouns</li>
          <li>Preserve capitalization when making replacements</li>
          <li>Highlight replaced text to see where changes were made</li>
          <li>Track statistics on name and pronoun replacements</li>
          <li>No download required - works entirely in your browser</li>
          <li>Your data stays private and is stored only on your device</li>
        </ul>
      </div>
    </div>
  );
}
