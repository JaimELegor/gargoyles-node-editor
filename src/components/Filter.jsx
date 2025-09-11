import React from "react";
import Slider from "./Slider";

export class Filter {
  constructor(img, { name, icon, params, processFunc }) {
    this.img = img;
    this.name = name;
    this.icon = icon;
    this.params = params;
    this.processFunc = processFunc;
  }

  setImage(img) {
    this.img = img;
  }

  getParams() {
    const values = {};
    for (const key in this.params) {
      values[key] = this.params[key].value;
    }
    return values;
  }

  setParam(key, value) {
    if (this.params[key]) {
      this.params[key].value = value;
    }
  }

  renderUI(callback) {
    return Object.entries(this.params).map(([key, config]) => (
      <Slider
        key={key}
        label={key}
        value={config.value}
        min={config.min}
        max={config.max}
        step={config.step}
        onChange={(val) => callback(key, val)}
      />
    ));
  }

  index(x, y) {
    const i = 4 * (x + y * this.img.width);
    const r = this.img.pixels[i];
    const g = this.img.pixels[i + 1];
    const b = this.img.pixels[i + 2];
    const a = this.img.pixels[i + 3];
    return [r, g, b, a];
  }

  update(x, y, r, g, b, a) {
    const i = 4 * (x + y * this.img.width);
    this.img.pixels[i] = r;
    this.img.pixels[i + 1] = g;
    this.img.pixels[i + 2] = b;
    this.img.pixels[i + 3] = a;

  }

  applyToImage(values) {

  }

}




