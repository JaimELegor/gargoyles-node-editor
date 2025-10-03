import { useEffect, useRef } from 'react';
import Slider from "./Slider";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextureLoader } from 'three';
import { useNode } from '../contexts/NodeContext';
import { useImage } from '../contexts/ImageContext';
import { useFilter } from '../contexts/FilterContext';
import '../styles/ThreeD.css';

export default function ThreeScene() {
  const { selectedNode, setSelectedNode } = useNode();
  const { monitorCanvas } = useImage();
  const { filterValues, sliderParams, setFilterValues } = useFilter();
  const mountRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientHeight;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Texture
    const textureLoader = new TextureLoader();
    textureLoader.load('clouds.jpg', (texture) => {
      scene.background = texture;
    });

    // Camera
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.z = 1;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Model & Texture
    let model;
    let texture;
    const loader = new GLTFLoader();
    loader.load('tv.glb', (gltf) => {
      model = gltf.scene;

      if (monitorCanvas) {
        texture = new THREE.CanvasTexture(monitorCanvas);
        model.traverse((child) => {
          if (child.isMesh && child.name === "TVLow") {
            child.material.map = texture;
            child.material.needsUpdate = true;
          }
        });
      }

      model.rotation.y = Math.PI;
      scene.add(model);
    });

    // Light
    const light = new THREE.DirectionalLight(0xFFFFFF, 2);
    light.position.set(2, 2, 2);
    scene.add(light);

    // Mouse
    const handleMouseMove = (e) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    let targetX = 0, targetY = 0;
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (model) {
        const mouse = mousePosRef.current;
        const normX = (mouse.x / width * 0.8) * 2 - 1;
        const normY = (mouse.y / height * 0.8) * 2 - 1;

        targetY = Math.PI + normX * 0.8;
        targetX = normY * 0.8;

        model.rotation.y += (targetY - model.rotation.y) * 0.1;
        model.rotation.x += (targetX - model.rotation.x) * 0.1;
      }

      if (texture) texture.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientHeight;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      // Stop animation
      cancelAnimationFrame(animationFrameId);

      // Dispose model and its resources
      if (model) {
        model.traverse((child) => {
          if (child.isMesh) {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
            child.geometry.dispose();
          }
        });
        scene.remove(model);
        model = null;
      }

      // Dispose texture
      if (texture) texture.dispose();

      // Dispose renderer and remove canvas
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [monitorCanvas]);

  return (
    <div className="model">
      <div ref={mountRef} style={{ width: '30vh', height: '30vh' }} />
      {Object.entries(sliderParams).map(([paramName, paramData]) => (
        <Slider
          key={paramName}
          label={paramName}
          min={paramData.min}
          max={paramData.max}
          step={paramData.step}
          value={filterValues[selectedNode][paramName]}
          onChange={(newValue) => {
            setFilterValues(prev => ({
              ...prev,
              [selectedNode]: {
                ...prev[selectedNode],
                [paramName]: newValue,
              },
            }));
          }}
        />
      ))}
      <button onClick={() => setSelectedNode(null)}>Apply</button>
    </div>
  );
}