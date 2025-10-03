export class GPUBackend {    
    constructor(p5) {
        this.p5 = p5;
        this.baseVert = `
            attribute vec3 aPosition;
            attribute vec2 aTexCoord;
            varying vec2 vTexCoord;
            void main() {
                vTexCoord = aTexCoord;
                gl_Position = vec4(aPosition, 1.0);
            }
        `;
        // persistent buffer and shader cache
        this.buffer = p5.createGraphics(p5.width, p5.height, p5.WEBGL);
        this.shaders = {};
        this.singleShader = {};
        this.name = "GPU";
    }

    // make sure buffer matches canvas size
    ensureBufferSize(width, height) {
        if (this.buffer.width !== width || this.buffer.height !== height) {
            this.buffer.remove(); // free old context
            this.buffer = this.p5.createGraphics(width, height, this.p5.WEBGL);
        }
    }

    // Compile and cache shaders for each filter
    loadShaders(filterDefs) {
        filterDefs.forEach(({ name, shader }) => {
            if (shader && !this.shaders[name]) {
                this.shaders[name] = this.buffer.createShader(this.baseVert, shader);
            }
        });
    }

    loadSingleShader(filterDef, name) {
        if (filterDef.shader && !this.singleShader[name]) {
            this.singleShader[name] = this.buffer.createShader(this.baseVert, filterDef.shader);
        }
    }


    // Run a shader pass on the buffer
    runShaderPass(buffer, shader, params, inputTex) {
        buffer.shader(shader);

        shader.setUniform("tex", inputTex);
        shader.setUniform("resolution", [this.p5.width, this.p5.height]);

        // set uniforms from paramsMap
        Object.entries(params).forEach(([key, val]) => {
        shader.setUniform(key, val);
        });

        // draw fullscreen quad into buffer
        
        
        buffer.noStroke();
        buffer.fill(255);

        buffer.beginShape(this.p5.TRIANGLE_FAN);
        buffer.vertex(-1, -1, 0, 1);
        buffer.vertex( 1, -1, 1, 1);
        buffer.vertex( 1,  1, 1, 0);
        buffer.vertex(-1,  1, 0, 0);
        buffer.endShape();
    }

    // Apply multiple filters in sequence
    runPipeline(img, filters, paramsMap) {
        if (!filters || filters.length === 0) return img;

        this.ensureBufferSize(this.p5.width, this.p5.height);
        this.loadShaders(filters);

        let currentTex = img;
        filters.forEach(({ name }) => {
            const params = paramsMap?.[name] || {};
            const compiled = this.shaders[name];   // ✅ compiled p5.Shader
            this.runShaderPass(this.buffer, compiled, params, currentTex);
            currentTex = this.buffer;
        });

        // return result as a p5.Image
        this.buffer.loadPixels();
        const out = this.p5.createImage(this.buffer.width, this.buffer.height);
        out.loadPixels();
        out.pixels.set(this.buffer.pixels);
        out.updatePixels();
        return out;
    }

    // Apply a single filter
    runFilter(img, filter, name, paramsMap) {
        console.log(filter);
        if (!filter) return img;

        this.ensureBufferSize(this.p5.width, this.p5.height);
        this.loadSingleShader(filter, name);

        // grab compiled shader from cache
        const compiled = this.singleShader[name];
        if (!compiled) return img; // shader hasn't been loaded via loadShaders yet

        const params = paramsMap?.[name] || {};

        let currentTex = img;
        this.runShaderPass(this.buffer, compiled, params, currentTex);
        currentTex = this.buffer;

        // return as p5.Image
        this.buffer.loadPixels();
        const out = this.p5.createImage(this.buffer.width, this.buffer.height);
        out.loadPixels();
        out.pixels.set(this.buffer.pixels);
        out.updatePixels();
        return out;
    }
}