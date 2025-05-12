import { users, type User, type InsertUser, transnameSettings, type TransnameSettings, type InsertTransnameSettings } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTransnameSettings(userId: number): Promise<TransnameSettings | undefined>;
  createTransnameSettings(settings: InsertTransnameSettings): Promise<TransnameSettings>;
  updateTransnameSettings(id: number, settings: Partial<TransnameSettings>): Promise<TransnameSettings | undefined>;
  updateReplacementCounts(id: number, nameReplacements: number, pronounReplacements: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private settings: Map<number, TransnameSettings>;
  currentUserId: number;
  currentSettingsId: number;

  constructor() {
    this.users = new Map();
    this.settings = new Map();
    this.currentUserId = 1;
    this.currentSettingsId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTransnameSettings(userId: number): Promise<TransnameSettings | undefined> {
    return Array.from(this.settings.values()).find(
      (settings) => settings.userId === userId,
    );
  }

  async createTransnameSettings(settings: InsertTransnameSettings): Promise<TransnameSettings> {
    const id = this.currentSettingsId++;
    const transnameSettingsEntry: TransnameSettings = { 
      ...settings, 
      id,
      nameReplacements: 0,
      pronounReplacements: 0
    };
    this.settings.set(id, transnameSettingsEntry);
    return transnameSettingsEntry;
  }

  async updateTransnameSettings(id: number, updatedSettings: Partial<TransnameSettings>): Promise<TransnameSettings | undefined> {
    const settings = this.settings.get(id);
    if (!settings) return undefined;
    
    const updated = { ...settings, ...updatedSettings };
    this.settings.set(id, updated);
    return updated;
  }

  async updateReplacementCounts(id: number, nameReplacements: number, pronounReplacements: number): Promise<void> {
    const settings = this.settings.get(id);
    if (!settings) return;
    
    const updated = { 
      ...settings, 
      nameReplacements: settings.nameReplacements + nameReplacements,
      pronounReplacements: settings.pronounReplacements + pronounReplacements 
    };
    this.settings.set(id, updated);
  }
}

export const storage = new MemStorage();
