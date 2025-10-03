import { CPUBackend } from "./CPUBackend";
import { GPUBackend } from "./GPUBackend";
export class FilterManager {
  constructor() {
    this.original = null;       // the loaded original image
    this.mainFiltered = null;   // image with full filter chain
    this.singleFiltered = null; // image with one selected filter
    this.appliedFlag = "";

    // cache: { key -> p5.Image }
    this.cache = new Map();
    this.backend = new CPUBackend();
  }

  setOriginal(img) {
    this.original = img;
    this.cache.clear(); // reset cache if original changes
  }

  setBackend(backend) {
    this.backend = backend;
    this.cache.clear();
  }

  getAppliedFlag(){
    return this.appliedFlag;
  }

makeKeyForPipeline(filters, paramsMap) {
    return JSON.stringify({
      type: "pipeline",
      backend: this.backend.name,       
      filters: filters.map(f => f.name),
      params: paramsMap
    });
}

makeKeyForSingle(filterName, paramsMap) {
    return JSON.stringify({
      type: "single",
      backend: this.backend.name,       
      filter: filterName,
      params: paramsMap?.[filterName] || {}
    });
}

  cloneImage(img) {
    let clone = img.get();
    clone.loadPixels();
    return clone;
  }

  // ---------- main APIs ----------
  applyAll(filters, paramsMap) {
    if (!this.original) return null;

    const key = this.makeKeyForPipeline(filters, paramsMap);
    if (this.cache.has(key)) {
      this.mainFiltered = this.cloneImage(this.cache.get(key));
      return this.mainFiltered;
    }

    const result = this.backend.runPipeline(this.original, filters, paramsMap);
    this.cache.set(key, result);
    this.mainFiltered = this.cloneImage(result);
    this.appliedFlag = this.backend.name;
    return this.mainFiltered;
  }

  applySingle(filter, name, paramsMap) {
    if (!this.original) return null;

    const key = this.makeKeyForSingle(name, paramsMap);
    if (this.cache.has(key)) {
      this.singleFiltered = this.cloneImage(this.cache.get(key));
      return this.singleFiltered;
    }

    const result = this.backend.runFilter(this.original, filter, name, paramsMap);
    this.cache.set(key, result);
    this.singleFiltered = this.cloneImage(result);
    this.appliedFlag = this.backend.name;
    return this.singleFiltered;
  } 
}

export const filterManager = new FilterManager();
