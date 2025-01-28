import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ThreeDViewer = ({ pointCloudData }) => {
  const canvasRef = useRef(null);
  const [pointSize, setPointSize] = useState(0.05);
  const [colorByAltitude, setColorByAltitude] = useState(false);

  useEffect(() => {
    if (!Array.isArray(pointCloudData) || pointCloudData.length === 0) {
      console.error("No valid point cloud data for rendering.");
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const geometry = new THREE.BufferGeometry();
    const points = new Float32Array(
      pointCloudData.flatMap((point) => [point.x, point.y, point.z])
    );

    if (points.length === 0) {
      console.error("No valid points for rendering in the geometry.");
      return;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));

    const material = new THREE.PointsMaterial({
      size: pointSize,
      vertexColors: colorByAltitude,
      color: !colorByAltitude ? "white" : null,
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    const controls = new OrbitControls(camera, renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      controls.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [pointCloudData, pointSize, colorByAltitude]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      <div className="controls">
        <label>
          Point Size:
          <input
            type="range"
            min="0.01"
            max="0.1"
            step="0.01"
            value={pointSize}
            onChange={(e) => setPointSize(parseFloat(e.target.value))}
          />
        </label>
        <label>
          Color by Altitude:
          <input
            type="checkbox"
            checked={colorByAltitude}
            onChange={() => setColorByAltitude(!colorByAltitude)}
          />
        </label>
      </div>
    </div>
  );
};

export default ThreeDViewer;
