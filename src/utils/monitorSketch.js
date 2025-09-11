
export function monitorSketch(p5) {
  let img;
  let img2;
  let original;
  let currentSrc = null;
  let processed = false;
  let onCanvasImage;
  let filter;
  let paramsMap;
  let name;
  let monitor;

  function getFirstInnerValue(obj, topKey) {
    const inner = obj[topKey];
    if (!inner) return undefined;
    const key = Object.keys(inner)[0];
    return inner[key];
  }

  function getParamValues(name, paramsMap) {
  if (!paramsMap || !paramsMap[name]) return [];
  return Object.values(paramsMap[name]);
}

  p5.updateWithProps = (props) => {
    if (props.imgSrc && props.imgSrc !== currentSrc) {
      p5.loadImage(props.imgSrc, (loadedImage) => {
        original = loadedImage;
        img2 = original.get();
        processed = false;
        currentSrc = props.imgSrc;

        //filter = props.filter;
        //filterFlag = true;
      });
    }
    if (props.paramsMap) {
      paramsMap = props.paramsMap;
      if (original) {
        img2 = original.get();
        processed = false;
      }
    }

    if (props.filter) {
      filter = props.filter;
      if (original) {
        img2 = original.get();
        processed = false;
      }
    }


    if (props.onCanvasImage) {
      onCanvasImage = props.onCanvasImage; // store callback
    }

    if ('name' in props) name = props.name;   // selectedNode


  };



  p5.setup = () => {
    p5.createCanvas(256, 256); // 2D canvas for easier debugging
    p5.loadImage("texture_0.png", (loadedImage) => {
      monitor = loadedImage;
      img = monitor.get();
    });
  };

  p5.draw = () => {
    // p5.background(200);
    if (!img && !img2) return;
    //
    // const index = (x, y) => {
    //   const i = 4 * (x + y * img.width);
    //   const r = img.pixels[i];
    //   const g = img.pixels[i + 1];
    //   const b = img.pixels[i + 2];
    //   const a = img.pixels[i + 3];
    //   return [r, g, b, a];
    // }
    //
    //
    const index = (x, y) => {
      const i = 4 * (x + y * img2.width);
      const r = img2.pixels[i];
      const g = img2.pixels[i + 1];
      const b = img2.pixels[i + 2];
      const a = img2.pixels[i + 3];
      return [r, g, b, a];
    }

    if (filter && name && !processed) {
      img2.loadPixels();
      //filter[0].func(img, r, g, b, a, x, y, getFirstInnerValue(paramsMap, "FloydSteinberg"));

      // Option A: filters mutate img.pixels directly

      for (let y = 0; y < img2.height; y++) {
        for (let x = 0; x < img2.width; x++) {
          const [r, g, b, a] = index(x, y);
          filter(img2, r, g, b, a, x, y, ...getParamValues(name, paramsMap));
        }
      }
      // process(func, getFirstInnerValue(paramsMap, name));
      //     // Option B: filters return [r,g,b,a]
      //     // [r, g, b, a] = func(img, r, g, b, a, x, y, filterParams);
      //     // img.pixels[i] = r;
      //     // img.pixels[i+1] = g;
      //     // img.pixels[i+2] = b;
      //     // img.pixels[i+3] = a;
      //
      //     // Update current pixel from img
      //     // r = img.pixels[i];
      //     // g = img.pixels[i + 1];
      //     // b = img.pixels[i + 2];
      //     // a = img.pixels[i + 3];
      //   });
      //
      img2.updatePixels();
      processed = true;
      //
    }
    //
    p5.image(img, 0, 0, 256, 256);
    p5.image(img2, 53, 52, 62, 50);
    if (onCanvasImage && p5.canvas) {
      onCanvasImage(p5.canvas);
    }
  };
}
