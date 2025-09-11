import { useEffect, useRef } from 'react';
import Slider from "./Slider";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextureLoader } from 'three';
import { useState } from 'react';
import '../styles/ThreeD.css';
import { useNode } from '../contexts/NodeContext';
import { useImage } from '../contexts/ImageContext';
import { useFilter } from '../contexts/FilterContext';

export default function ThreeScene() {
  const { selectedNode, setSelectedNode } = useNode();
  const { monitorCanvas } = useImage();
  const { filterValues, sliderParams, setFilterValues } = useFilter();
  const mountRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const width = mountRef.current.clientHeight;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();


    const textureLoader = new TextureLoader();
    textureLoader.load('clouds.jpg', (texture) => {
      scene.background = texture;
    });


    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    let model;
    let texture;

    const loader = new GLTFLoader();
    loader.load('tv.glb', (gltf) => {
      model = gltf.scene;
      if (monitorCanvas) {

        texture = new THREE.CanvasTexture(monitorCanvas);
        // texture.repeat.set(1, 1); // scale down to 50%
        // texture.offset.set(0.5, 0.5); // center texture on UV space
        model.traverse((child) => {
          if (child.isMesh) {
            if (child.name === "TVLow") {

              child.material.map = texture;
              child.material.needsUpdate = true;
            }
          }
        });
      }
      model.rotation.y = Math.PI;
      scene.add(model);
    });

    const light = new THREE.DirectionalLight(0xFFFFFF, 2);
    light.position.set(2, 2, 2);
    scene.add(light);

    const handleMouseMove = (e) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    let targetX = 0, targetY = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      if (model) {
        const mouse = mousePosRef.current;
        const normX = (mouse.x / width * 0.8) * 2 - 1;
        const normY = (mouse.y / height * 0.8) * 2 - 1;

        targetY = Math.PI + normX * 0.8;
        targetX = normY * 0.8;

        model.rotation.y += (targetY - model.rotation.y) * 0.1;
        model.rotation.x += (targetX - model.rotation.x) * 0.1;
      }
      if (texture) {
        texture.needsUpdate = true;  // <<< important! refresh canvas texture each frame
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const width = mountRef.current.clientHeight;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [monitorCanvas]);



  return (<>
  <div className="model">
    <div ref={mountRef} style={{ width: '30vh', height: '30vh' }} />
    {
      Object.entries(sliderParams).map(([paramName, paramData]) => (
        <Slider
          key={paramName}
          label={paramName}
          min={paramData.min}
          max={paramData.max}
          step={paramData.step}
          value={filterValues[selectedNode][paramName]}  // current value from state
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
      ))
    }
    <button onClick={() => setSelectedNode(null)}>Apply</button>
    </div>
  </>);
}
