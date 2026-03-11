const DB_NAME = "gargoyles";
const STORE = "filters";
const VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Serialize a filter for storage converts processFunc to string
function serializeFilter(filter) {
  return {
    ...filter,
    id: filter.name.split("/").at(-1),
    processFunc: filter.processFunc.toString(), // fn → string
  };
}

// Reconstruct a filter from storage restores processFunc
function deserializeFilter(record) {
  let processFunc;
  try {
    // new Function('return ' + str)() safely reconstructs arrow functions
    processFunc = new Function("return " + record.processFunc)();
  } catch (e) {
    console.error(`Failed to deserialize processFunc for ${record.id}`, e);
    processFunc = () => {}; // safe fallback
  }
  return { ...record, processFunc };
}

export async function getAllFilters() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result.map(deserializeFilter));
    req.onerror = () => reject(req.error);
  });
}

export async function upsertFilter(filter) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(serializeFilter(filter));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteFilter(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// Wipe and re-seed (useful for "reset to defaults")
export async function resetToDefaults(configFilter) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.clear();
    configFilter.forEach(f => store.put(serializeFilter(f)));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}