import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ExecuteInput, type ExecutionResponse } from "@shared/routes";

// GET /api/categories
export function useCategories() {
  return useQuery({
    queryKey: [api.tools.categories.path],
    queryFn: async () => {
      const res = await fetch(api.tools.categories.path);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return api.tools.categories.responses[200].parse(await res.json());
    },
  });
}

// GET /api/tools
export function useTools() {
  return useQuery({
    queryKey: [api.tools.list.path],
    queryFn: async () => {
      const res = await fetch(api.tools.list.path);
      if (!res.ok) throw new Error("Failed to fetch tools");
      return api.tools.list.responses[200].parse(await res.json());
    },
  });
}

// POST /api/osint/execute
export function useExecuteOsint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ExecuteInput) => {
      // Validate input before sending using the shared schema
      const validated = api.osint.execute.input.parse(data);
      
      const res = await fetch(api.osint.execute.path, {
        method: api.osint.execute.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.osint.execute.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Execution failed");
      }

      return api.osint.execute.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.osint.history.list.path] });
    }
  });
}

// GET /api/osint/history
export function useSearchHistory() {
  return useQuery({
    queryKey: [api.osint.history.list.path],
    queryFn: async () => {
      const res = await fetch(api.osint.history.list.path);
      if (!res.ok) throw new Error("Failed to fetch search history");
      return api.osint.history.list.responses[200].parse(await res.json());
    },
  });
}

// DELETE /api/osint/history
export function useClearHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.osint.history.clear.path, {
        method: api.osint.history.clear.method,
      });
      if (!res.ok) throw new Error("Failed to clear search history");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.osint.history.list.path] });
    },
  });
}
