
export function pixel(img, factor) {

  function index(x, y) {
    return 4 * (x + y * img.width);
  }

  for (let i = 0; i < Math.floor(img.width / factor); i++) {
    for (let j = 0; j < Math.floor(img.height / factor); j++) {
      for (let x = 0; x < factor; x++) {
        for (let y = 0; y < factor; y++) {
          img.pixels[index((factor * i + x), (factor * j + y))] = img.pixels[index((factor * i), (factor * j))];
          img.pixels[index((factor * i + x), (factor * j + y)) + 1] = img.pixels[index((factor * i), (factor * j)) + 1];
          img.pixels[index((factor * i + x), (factor * j + y)) + 2] = img.pixels[index((factor * i), (factor * j)) + 2];
        }
      }
    }
  }
}

