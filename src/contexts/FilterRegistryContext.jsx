import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { configFilter } from "../utils/configFilter"; // used ONCE for seeding only
import { getAllFilters, upsertFilter, deleteFilter, resetToDefaults } from "../utils/filterDB";

const FilterRegistryContext = createContext();

export function FilterRegistryProvider({ children }) {
  const [registry, setRegistry] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      const stored = await getAllFilters();
      if (stored.length === 0) {
        // First run ever seed from bundled configFilter, then never touch it again
        await Promise.all(configFilter.map(upsertFilter));
        setRegistry(configFilter.map(f => ({
          ...f,
          id: f.name.split("/").at(-1)
        })));
      } else {
        // All subsequent loads DB is the source of truth
        setRegistry(stored);
      }
      setReady(true);
    }
    init();
  }, []);

  const saveFilter = useCallback(async (filter) => {
    await upsertFilter(filter);
    const id = filter.name.split("/").at(-1);
    setRegistry(prev => {
      const exists = prev.some(f => f.id === id);
      const record = { ...filter, id };
      return exists
        ? prev.map(f => f.id === id ? record : f)
        : [...prev, record];
    });
  }, []);

  const removeFilter = useCallback(async (id) => {
    await deleteFilter(id);
    setRegistry(prev => prev.filter(f => f.id !== id));
  }, []);

  // Hard reset wipes DB and re-seeds from bundled defaults
  const resetFilters = useCallback(async () => {
    await resetToDefaults(configFilter);
    setRegistry(configFilter.map(f => ({ ...f, id: f.name.split("/").at(-1) })));
  }, []);

  const findFilter = useCallback(
    (query) => registry.find(f => f.name === query || f.id === query),
    [registry]
  );

  return (
    <FilterRegistryContext.Provider value={{
      registry, ready,
      saveFilter, removeFilter,
      findFilter, resetFilters
    }}>
      {children}
    </FilterRegistryContext.Provider>
  );
}

export function useFilterRegistry() {
  return useContext(FilterRegistryContext);
}