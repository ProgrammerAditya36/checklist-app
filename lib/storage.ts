// Simple in-memory storage for temporary checklists
// In production, you might want to use Redis or similar
const storage = new Map<string, any>();

export const temporaryStorage = {
  set: (key: string, value: any, ttlMs: number) => {
    const expiresAt = Date.now() + ttlMs;
    storage.set(key, { value, expiresAt });

    // Auto-cleanup
    setTimeout(() => {
      storage.delete(key);
    }, ttlMs);
  },

  get: (key: string) => {
    const item = storage.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      storage.delete(key);
      return null;
    }

    return item.value;
  },

  delete: (key: string) => {
    storage.delete(key);
  },
};
