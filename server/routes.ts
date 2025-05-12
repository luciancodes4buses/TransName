import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransnameSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // TransName settings routes
  app.get('/api/transname-settings/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
      const settings = await storage.getTransnameSettings(userId);
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve settings' });
    }
  });

  app.post('/api/transname-settings', async (req, res) => {
    try {
      const settings = insertTransnameSettingsSchema.parse(req.body);
      const createdSettings = await storage.createTransnameSettings(settings);
      res.status(201).json(createdSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid settings data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create settings' });
    }
  });

  app.patch('/api/transname-settings/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid settings ID' });
    }

    try {
      const updatedSettings = await storage.updateTransnameSettings(id, req.body);
      if (!updatedSettings) {
        return res.status(404).json({ message: 'Settings not found' });
      }
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update settings' });
    }
  });

  app.post('/api/transname-settings/:id/replacement-counts', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid settings ID' });
    }

    const { nameReplacements, pronounReplacements } = req.body;
    
    if (typeof nameReplacements !== 'number' || typeof pronounReplacements !== 'number') {
      return res.status(400).json({ message: 'Invalid replacement counts' });
    }

    try {
      await storage.updateReplacementCounts(id, nameReplacements, pronounReplacements);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update replacement counts' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
