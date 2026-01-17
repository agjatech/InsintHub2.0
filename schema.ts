import { pgTable, text, serial, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'Username', 'Email', 'Domain', 'IP'
  description: text("description"),
  method: text("method").notNull(), // 'api' | 'web'
  url: text("url").notNull(),
  isActive: boolean("is_active").default(true),
  // Optional headers or config for the tool (e.g. auth tokens placeholders)
  config: jsonb("config"), 
});

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  query: text("query").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// === BASE SCHEMAS ===
export const insertToolSchema = createInsertSchema(tools).omit({ id: true });
export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({ id: true, timestamp: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;

export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;

// Request types
export const executeRequestSchema = z.object({
  category: z.string(),
  query: z.string(),
});
export type ExecuteRequest = z.infer<typeof executeRequestSchema>;

// Result types
export type ToolResult = {
  toolName: string;
  status: 'success' | 'error' | 'unsupported';
  data?: any;
  error?: string;
  method: 'api' | 'web';
  executionTime?: number;
};

// Response is a map of tool name to result
export type ExecutionResponse = Record<string, ToolResult>;

export type CategoryResponse = string[];
export type ToolsResponse = Tool[];
