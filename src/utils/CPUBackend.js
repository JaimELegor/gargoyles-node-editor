export class CPUBackend {
  constructor(){
    this.name = "CPU";
  }
  runPipeline(img, filters, paramsMap) {
    if (!filters || filters.length === 0) return img;

    let working = img.get();
    working.loadPixels();

    filters.forEach(({ name, func }) => {
      const params = Object.values(paramsMap?.[name] || {});
      this.process(working, func, params);
    });

    working.updatePixels();
    return working;
  }

  runFilter(img, filter, name, paramsMap) {
    if (!filter) return img;

    let working = img.get();
    working.loadPixels();

    const params = Object.values(paramsMap?.[name] || {});
    this.process(working, filter.processFunc, params);

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