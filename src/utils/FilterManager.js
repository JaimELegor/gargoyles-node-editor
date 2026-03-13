import { CPUBackend } from "./CPUBackend";

export class FilterManager {
  constructor() {
    this.original = null;
    this.mainFiltered = null;
    this.singleFiltered = null;
    this.appliedFlag = "";
    this.cache = new Map();
    this.backend = new CPUBackend();
    this.renderVersion = 0;
  }

  setOriginal(img) {
    this.original = img;
    this.cache.clear();
  }

  setBackend(backend) {
    this.backend = backend;
    this.cache.clear();
  }

  getAppliedFlag() { return this.appliedFlag; }

  makeKeyForPipeline(filters, paramsMap) {
    return JSON.stringify({ type: "pipeline", backend: this.backend.name,
      filters: filters.map(f => f.name), params: paramsMap });
  }

  makeKeyForSingle(filterName, paramsMap) {
    return JSON.stringify({ type: "single", backend: this.backend.name,
      filter: filterName, params: paramsMap?.[filterName] || {} });
  }

  cloneImage(img) {
    let clone = img.get();
    clone.loadPixels();
    return clone;
  }

  
  snapshotPixels(img) {
    img.loadPixels();
    return new Uint8ClampedArray(img.pixels);
  }


  fromSnapshot(snapshot) {
    const fresh = this.cloneImage(this.original);
    fresh.loadPixels();
    fresh.pixels.set(snapshot);
    fresh.updatePixels();
    return fresh;
  }

  async applyAll(filters, paramsMap, { force = false } = {}) {
    if (!this.original) return null;
    this.renderVersion++;               // ⭐ new render started
    const version = this.renderVersion;
    const key = this.makeKeyForPipeline(filters, paramsMap);

    if (!filters || filters.length === 0) {
      this.mainFiltered = this.cloneImage(this.original);
      return this.mainFiltered;
    }

    if (!force && this.cache.has(key)) {
      this.mainFiltered = this.fromSnapshot(this.cache.get(key));
      return this.mainFiltered;
    }

    const freshImg = this.cloneImage(this.original);
    const result = await Promise.resolve(
      this.backend.runPipeline(freshImg, filters, paramsMap)
    );
    if (version !== this.renderVersion) return this.mainFiltered;
    if (!result) return this.mainFiltered;

    this.cache.set(key, this.snapshotPixels(result));
    this.mainFiltered = this.cloneImage(result);
    this.appliedFlag = this.backend.name;
    return this.mainFiltered;
  }

  async applySingle(filter, name, paramsMap, { force = false } = {}) {
    if (!this.original) return null;
    this.renderVersion++;
    const version = this.renderVersion;
    const key = this.makeKeyForSingle(name, paramsMap);

    if (!force && this.cache.has(key)) {
      this.singleFiltered = this.fromSnapshot(this.cache.get(key));
      return this.singleFiltered;
    }

    const freshImg = this.cloneImage(this.original);
    const result = await Promise.resolve(
      this.backend.runFilter(freshImg, filter, name, paramsMap)
    );

    if (version !== this.renderVersion) return this.singleFiltered;

    if (!result) return this.singleFiltered;
    this.cache.set(key, this.snapshotPixels(result));
    this.singleFiltered = this.cloneImage(result);
    this.appliedFlag = this.backend.name;
    return this.singleFiltered;
  }
}

export const filterManager = new FilterManager();