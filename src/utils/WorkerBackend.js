export class WorkerBackend {
  constructor() {
    this.name = "Worker";
    this.queue = [];
    this.latestId = 0;
    this.pending = new Map();
    this.worker = new Worker(new URL('./filterWorker.js', import.meta.url), {
      type: 'module'
    });


    this.worker.onmessage = ({ data }) => {
      const { id, pixels } = data;
      const resolve = this.pending.get(id);

      if (!resolve) return;

      this.pending.delete(id);
      resolve({ pixels });
    };
  }

  runPipeline(img, filters, paramsMap) {
    const requestId = ++this.latestId;

    return new Promise((resolve) => {
      img.loadPixels();

      const buffer = new ArrayBuffer(img.pixels.length);
      const pixels = new Uint8ClampedArray(buffer);
      pixels.set(img.pixels);

      const transferableFilters = filters.map(({ name, processFunc }) => ({
        name,
        funcSource: processFunc.toString(),
      }));

      this.pending.set(requestId, ({ pixels: resultBuffer }) => {

        if (requestId !== this.latestId) {
          resolve(null);   // discard stale render
          return;
        }

        img.pixels.set(new Uint8ClampedArray(resultBuffer));
        img.updatePixels();
        resolve(img);
      });

      this.worker.postMessage(
        {
          id: requestId,   // ⭐ send id
          pixels: buffer,
          width: img.width,
          height: img.height,
          filters: transferableFilters,
          paramsMap
        },
        [buffer]
      );
    });
  }

  runFilter(img, filter, name, paramsMap) {
    return this.runPipeline(img, [{ name, processFunc: filter.processFunc }], paramsMap);
  }

  terminate() {
    this.worker.terminate();
  }
}