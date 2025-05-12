import React, { useState, useEffect } from "react";
import { useTransName } from "@/hooks/use-transname";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import StatsBadge from "@/components/StatsBadge";
import { X, User, Info, SquareSplitHorizontal, Heart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function TransNameApp() {
  const { settings, setSettings, stats, clearSettings, totalReplacements } = useTransName();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomOldPronouns, setShowCustomOldPronouns] = useState(settings.oldPronouns === "custom");
  const [showCustomNewPronouns, setShowCustomNewPronouns] = useState(settings.newPronouns === "custom");
  
  // Update custom pronouns visibility when settings change
  useEffect(() => {
    setShowCustomOldPronouns(settings.oldPronouns === "custom");
    setShowCustomNewPronouns(settings.newPronouns === "custom");
  }, [settings.oldPronouns, settings.newPronouns]);

  const toggleOpen = () => setIsOpen(!isOpen);
  
  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings({ ...settings, ...newSettings });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
  };
  
  const handleClearClick = () => {
    clearSettings();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Floating toggle button */}
      <Button
        onClick={toggleOpen}
        variant="default"
        size="icon"
        className="w-14 h-14 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-all duration-300"
        aria-label="Toggle TransName tool"
      >
        <User className="h-6 w-6" />
      </Button>
      
      {/* Stats badge (visible when app is closed but active) */}
      <StatsBadge 
        count={totalReplacements} 
        isVisible={!isOpen && settings.isActive && totalReplacements > 0} 
      />
      
      {/* App panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="mt-4 w-80"
          >
            <Card className="shadow-lg border-none overflow-hidden">
              <CardHeader className="p-4 pb-3 bg-gradient-to-r from-[#55CDFC] via-[#F7A8B8] to-[#55CDFC] text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <SquareSplitHorizontal className="h-5 w-5 mr-2" />
                    <CardTitle className="text-lg font-semibold">TransName</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleOpen}
                    className="h-8 w-8 text-white hover:text-white/80 hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-3">
                {/* Active toggle */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <div className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full mr-2 ${
                        settings.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {settings.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <Switch 
                    checked={settings.isActive}
                    onCheckedChange={(checked) => updateSettings({ isActive: checked })}
                  />
                </div>
                
                {/* Scrollable area for settings */}
                <ScrollArea className="h-[60vh] pr-2">
                  {/* Settings Form */}
                  <form onSubmit={handleSubmit}>
                    {/* Deadname */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="deadname" className="text-sm font-medium">
                          Original Name
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-neutral-500" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px] text-xs">
                              Enter the name you want to replace. You can add multiple variations separated by commas.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="deadname"
                        placeholder="Enter original name(s)"
                        value={settings.deadname}
                        onChange={(e) => updateSettings({ deadname: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    
                    {/* Preferred Name */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="preferredName" className="text-sm font-medium">
                          Preferred Name
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-neutral-500" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px] text-xs">
                              Enter your preferred name that will replace the original name.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="preferredName"
                        placeholder="Enter your preferred name"
                        value={settings.preferredName}
                        onChange={(e) => updateSettings({ preferredName: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    
                    {/* Pronouns */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-sm font-medium">
                          Pronouns
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-neutral-500" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px] text-xs">
                              Select your preferred pronouns. The system will replace incorrect pronouns with your chosen ones.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Old pronouns */}
                        <div>
                          <Label htmlFor="oldPronouns" className="block text-xs text-neutral-500 mb-1">
                            Original
                          </Label>
                          <Select
                            value={settings.oldPronouns}
                            onValueChange={(value) => updateSettings({ oldPronouns: value })}
                          >
                            <SelectTrigger className="w-full text-sm">
                              <SelectValue placeholder="Select pronouns" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="min-w-[8rem] z-[9999]">
                              <SelectItem value="he/him">he/him</SelectItem>
                              <SelectItem value="she/her">she/her</SelectItem>
                              <SelectItem value="they/them">they/them</SelectItem>
                              <SelectItem value="ze/zir">ze/zir</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* New pronouns */}
                        <div>
                          <Label htmlFor="newPronouns" className="block text-xs text-neutral-500 mb-1">
                            Preferred
                          </Label>
                          <Select
                            value={settings.newPronouns}
                            onValueChange={(value) => updateSettings({ newPronouns: value })}
                          >
                            <SelectTrigger className="w-full text-sm">
                              <SelectValue placeholder="Select pronouns" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="min-w-[8rem] z-[9999]">
                              <SelectItem value="he/him">he/him</SelectItem>
                              <SelectItem value="she/her">she/her</SelectItem>
                              <SelectItem value="they/them">they/them</SelectItem>
                              <SelectItem value="ze/zir">ze/zir</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Custom pronouns inputs */}
                      {(showCustomOldPronouns || showCustomNewPronouns) && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {showCustomOldPronouns && (
                            <Input
                              placeholder="Custom original pronouns"
                              value={settings.customOldPronouns || ""}
                              onChange={(e) => updateSettings({ customOldPronouns: e.target.value })}
                              className="text-sm"
                            />
                          )}
                          {showCustomNewPronouns && (
                            <Input
                              placeholder="Custom preferred pronouns"
                              value={settings.customNewPronouns || ""}
                              onChange={(e) => updateSettings({ customNewPronouns: e.target.value })}
                              className="text-sm"
                            />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Settings */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Settings</h3>
                      <div className="space-y-2">
                        {/* Preserve case */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm">Preserve capitalization</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-neutral-500 ml-1" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[200px] text-xs">
                                  Match the capitalization pattern of the original text.
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Switch
                            checked={settings.preserveCase}
                            onCheckedChange={(checked) => updateSettings({ preserveCase: checked })}
                          />
                        </div>
                        
                        {/* Highlight replacements */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm">Highlight replacements</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-neutral-500 ml-1" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[200px] text-xs">
                                  Briefly highlight text when it gets replaced.
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Switch
                            checked={settings.highlightReplacements}
                            onCheckedChange={(checked) => updateSettings({ highlightReplacements: checked })}
                          />
                        </div>
                        
                        {/* Whole word */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm">Whole word matches only</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-neutral-500 ml-1" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[200px] text-xs">
                                  Only replace complete words, not parts of words.
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Switch
                            checked={settings.wholeWord}
                            onCheckedChange={(checked) => updateSettings({ wholeWord: checked })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex justify-between gap-3 mt-5">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-secondary text-secondary hover:bg-secondary/10"
                        onClick={handleClearClick}
                      >
                        Clear
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-[#55CDFC] via-[#F7A8B8] to-[#55CDFC] text-white hover:opacity-90 transition-opacity"
                      >
                        Save & Apply
                      </Button>
                    </div>
                    
                    {/* Statistics */}
                    <div className="mt-5 pt-3 border-t">
                      <h3 className="text-sm font-medium mb-2">Statistics</h3>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-neutral-100 rounded-md p-2">
                          <p className="text-xs text-neutral-600">Name Replacements</p>
                          <p className="text-lg font-semibold text-primary">{stats.nameReplacements}</p>
                        </div>
                        <div className="bg-neutral-100 rounded-md p-2">
                          <p className="text-xs text-neutral-600">Pronoun Replacements</p>
                          <p className="text-lg font-semibold text-primary">{stats.pronounReplacements}</p>
                        </div>
                      </div>
                    </div>
                  </form>
                </ScrollArea>
              </CardContent>
              
              <CardFooter className="bg-neutral-100 p-3 text-xs text-center text-neutral-600">
                <p className="w-full">
                  TransName runs entirely in your browser. Your data never leaves your device.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TransNameApp;