import { GPUBackend } from "./GPUBackend";
import { CPUBackend } from "./CPUBackend";

const gpuBackends = new Map();
const cpuBackends = new Map();

export function getGPUBackend(p5, sketchId) {
  if (!gpuBackends.has(sketchId)) {
    gpuBackends.set(sketchId, new GPUBackend(p5));
  }
  return gpuBackends.get(sketchId);
}

export function getCPUBackend(sketchId) {
  if (!cpuBackends.has(sketchId)) {
    cpuBackends.set(sketchId, new CPUBackend());
  }
  return cpuBackends.get(sketchId);
}

// optional cleanup if a sketch unmounts forever
export function disposeBackends(sketchId) {
  gpuBackends.get(sketchId)?.buffer?.remove();
  gpuBackends.delete(sketchId);
  cpuBackends.delete(sketchId);
}