const compiledFilters = new Map();

self.onmessage = ({ data }) => {
  const { id, pixels: buffer, width, height, filters, paramsMap } = data;
  const pixels = new Uint8ClampedArray(buffer);

  const img = { pixels, width, height };

  for (const { name, funcSource } of filters) {

    const params = Object.values(paramsMap?.[name] || {});

    let func = compiledFilters.get(name);

    if (!func) {
      try {
        func = eval(`(${funcSource})`);
        compiledFilters.set(name, func);
      } catch (e) {
        console.error(`Worker: failed to parse filter "${name}":`, e);
        continue;
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = 4 * (x + y * width);
        func(img, pixels[i], pixels[i+1], pixels[i+2], pixels[i+3], x, y, ...params);
      }
    }
  }

  self.postMessage({ id, pixels: pixels.buffer }, [pixels.buffer]);
};