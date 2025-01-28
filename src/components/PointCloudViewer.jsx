import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const PointCloudViewer = ({ data }) => {
  const mountRef = useRef(null);
  const [pointSize, setPointSize] = useState(0.05);

  useEffect(() => {
    if (!data) return;

    const { vertices } = data;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const controls = new OrbitControls(camera, renderer.domElement);

    // Create point cloud
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(vertices.flat());
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Color mapping by altitude (Z-axis)
    const colors = new Float32Array(vertices.length * 3);
    const zValues = vertices.map((v) => v[2]);
    const minZ = Math.min(...zValues);
    const maxZ = Math.max(...zValues);

    vertices.forEach(([x, y, z], index) => {
      const normalizedZ = (z - minZ) / (maxZ - minZ);
      const color = new THREE.Color().setHSL(normalizedZ, 1, 0.5);
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    });

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: pointSize,
      vertexColors: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [data, pointSize]);

  return (
    <div>
      <div ref={mountRef} style={{ width: "100%", height: "500px" }} />
      <div className="controls">
        <label>
          Point Size:
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={pointSize}
            onChange={(e) => setPointSize(parseFloat(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
};

export default PointCloudViewer;
