export class FilterManager {
  constructor() {
    this.original = null;       // the loaded original image
    this.mainFiltered = null;   // image with full filter chain
    this.singleFiltered = null; // image with one selected filter

    // cache: { key -> p5.Image }
    this.cache = new Map();
  }

  setOriginal(img) {
    this.original = img;
    this.cache.clear(); // reset cache if original changes
  }

  makeKeyForPipeline(filters, paramsMap) {
    return JSON.stringify({
      type: "pipeline",
      filters: filters.map(f => f.name),
      params: paramsMap
    });
  }

  makeKeyForSingle(filterName, paramsMap) {
    return JSON.stringify({
      type: "single",
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

    const result = this.runPipeline(this.original, filters, paramsMap);
    this.cache.set(key, result);
    this.mainFiltered = this.cloneImage(result);
    return this.mainFiltered;
  }

  applySingle(filter, name, paramsMap) {
    if (!this.original) return null;

    const key = this.makeKeyForSingle(name, paramsMap);
    if (this.cache.has(key)) {
      this.singleFiltered = this.cloneImage(this.cache.get(key));
      return this.singleFiltered;
    }

    const result = this.runFilter(this.original, filter, name, paramsMap);
    this.cache.set(key, result);
    this.singleFiltered = this.cloneImage(result);
    return this.singleFiltered;
  }

  // ---------- internals ----------
  runPipeline(img, filters, paramsMap) {
    let working = img.get();
    working.loadPixels();
    filters.forEach(({ name, func }) => {
      this.process(working, func, Object.values(paramsMap?.[name] || {}));
    });
    working.updatePixels();
    return working;
  }

  runFilter(img, func, name, paramsMap) {
    let working = img.get();
    working.loadPixels();
    this.process(working, func, Object.values(paramsMap?.[name] || {}));
    working.updatePixels();
    return working;
  }

  process(img, func, params) {
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const i = 4 * (x + y * img.width);
        const r = img.pixels[i];
        const g = img.pixels[i + 1];
        const b = img.pixels[i + 2];
        const a = img.pixels[i + 3];
        func(img, r, g, b, a, x, y, ...params);
      }
    }
  }
}

export const filterManager = new FilterManager();
