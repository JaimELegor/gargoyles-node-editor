

export const ditherFilter = {
  name: "dithr",
  params: {
    factor: {
      min: 1,
      max: 5,
      step: 1,
      value: 5,
    },
  },
  process: (img, { factor }) => {
    function index(x, y) {
      return 4 * (x + y * img.width);
    }

    function dither(errR, errG, errB, pixels, ix, portion) {
      pixels[ix] += errR * portion;
      pixels[ix + 1] += errG * portion;
      pixels[ix + 2] += errB * portion;
    }

    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const ix = index(x, y);
        const r = img.pixels[ix];
        const g = img.pixels[ix + 1];
        const b = img.pixels[ix + 2];

        const newR = Math.round((factor * r) / 255) * (255 / factor);
        const newG = Math.round((factor * g) / 255) * (255 / factor);
        const newB = Math.round((factor * b) / 255) * (255 / factor);

        img.pixels[ix] = newR;
        img.pixels[ix + 1] = newG;
        img.pixels[ix + 2] = newB;

        const errR = r - newR;
        const errG = g - newG;
        const errB = b - newB;

        dither(errR, errG, errB, img.pixels, index(x + 1, y), 7 / 16);
        dither(errR, errG, errB, img.pixels, index(x - 1, y + 1), 3 / 16);
        dither(errR, errG, errB, img.pixels, index(x, y + 1), 5 / 16);
        dither(errR, errG, errB, img.pixels, index(x + 1, y + 1), 1 / 16);
      }
    }
  },
  renderUI: ({ params, update }) => (
    <Slider
      label="Dither Size"
      value={params.factor.value}
      min={params.factor.min}
      max={params.factor.max}
      step={params.factor.step}
      onChange={(val) => update(val)}
    />
  ),
};
