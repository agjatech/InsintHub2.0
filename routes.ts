import { z } from 'zod';
import { insertToolSchema, tools, executeRequestSchema, type ToolResult, searchHistory } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  tools: {
    list: {
      method: 'GET' as const,
      path: '/api/tools',
      responses: {
        200: z.array(z.custom<typeof tools.$inferSelect>()),
      },
    },
    categories: {
      method: 'GET' as const,
      path: '/api/categories',
      responses: {
        200: z.array(z.string()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tools',
      input: insertToolSchema,
      responses: {
        201: z.custom<typeof tools.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  osint: {
    execute: {
      method: 'POST' as const,
      path: '/api/osint/execute',
      input: executeRequestSchema,
      responses: {
        200: z.record(z.custom<ToolResult>()),
        400: errorSchemas.validation,
      },
    },
    history: {
      list: {
        method: 'GET' as const,
        path: '/api/osint/history',
        responses: {
          200: z.array(z.custom<typeof searchHistory.$inferSelect>()),
        },
      },
      clear: {
        method: 'DELETE' as const,
        path: '/api/osint/history',
        responses: {
          204: z.void(),
        },
      },
    },
  },
};

// ============================================
// URL HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type ExecuteInput = z.infer<typeof api.osint.execute.input>;
export type ExecutionResponse = z.infer<typeof api.osint.execute.responses[200]>;
export type ValidationError = z.infer<typeof errorSchemas.validation>;
export type SearchHistoryResponse = z.infer<typeof api.osint.history.list.responses[200]>;
