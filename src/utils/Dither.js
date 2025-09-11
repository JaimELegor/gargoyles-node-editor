export function genDither(img, factor) {

  function index(x, y) {
    return 4 * (x + y * img.width);
  }

  function dither(errR, errG, errB, pixels, ix, portion) {
    pixels[ix] = (pixels[ix] + errR * portion);
    pixels[ix + 1] = (pixels[ix + 1] + errG * portion);
    pixels[ix + 2] = (pixels[ix + 2] + errB * portion);
  }


  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let ix = index(x, y);
      let r = img.pixels[ix];
      let g = img.pixels[ix + 1];
      let b = img.pixels[ix + 2];


      let newR = Math.round(factor * r / 255) * (255 / factor);
      let newG = Math.round(factor * g / 255) * (255 / factor);
      let newB = Math.round(factor * b / 255) * (255 / factor);

      img.pixels[ix] = newR;
      img.pixels[ix + 1] = newG;
      img.pixels[ix + 2] = newB;

      let errR = r - newR;
      let errG = g - newG;
      let errB = b - newB;

      dither(errR, errG, errB, img.pixels, index(x + 1, y), 7 / 16);
      dither(errR, errG, errB, img.pixels, index(x - 1, y + 1), 3 / 16);
      dither(errR, errG, errB, img.pixels, index(x, y + 1), 5 / 16);
      dither(errR, errG, errB, img.pixels, index(x + 1, y + 1), 1 / 16);

    }
  }
}
