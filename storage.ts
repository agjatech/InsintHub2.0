import { db } from "./db";
import {
  tools,
  searchHistory,
  type Tool,
  type InsertTool,
  type SearchHistory,
  type InsertSearchHistory,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getTools(): Promise<Tool[]>;
  getToolsByCategory(category: string): Promise<Tool[]>;
  createTool(tool: InsertTool): Promise<Tool>;
  getCategories(): Promise<string[]>;
  
  // Search History
  getSearchHistory(): Promise<SearchHistory[]>;
  addSearchHistory(history: InsertSearchHistory): Promise<SearchHistory>;
  clearSearchHistory(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTools(): Promise<Tool[]> {
    return await db.select().from(tools);
  }

  async getToolsByCategory(category: string): Promise<Tool[]> {
    const allTools = await db.select().from(tools);
    return allTools.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const [newTool] = await db.insert(tools).values(insertTool).returning();
    return newTool;
  }

  async getCategories(): Promise<string[]> {
    const allTools = await db.select().from(tools);
    const categories = new Set(allTools.map(t => t.category));
    return Array.from(categories);
  }

  async getSearchHistory(): Promise<SearchHistory[]> {
    return await db.select().from(searchHistory).orderBy(desc(searchHistory.timestamp));
  }

  async addSearchHistory(history: InsertSearchHistory): Promise<SearchHistory> {
    const [newEntry] = await db.insert(searchHistory).values(history).returning();
    return newEntry;
  }

  async clearSearchHistory(): Promise<void> {
    await db.delete(searchHistory);
  }
}

export const storage = new DatabaseStorage();
