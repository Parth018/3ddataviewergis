import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";

const ThreeDViewer = ({ pointCloudData }) => {
  const canvasRef = useRef(null);
  const [pointSize, setPointSize] = useState(0.05);
  const [colorByAltitude, setColorByAltitude] = useState(false);

  useEffect(() => {
    if (!pointCloudData) return;
    const { file, vertices } = pointCloudData;

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
    // const renderer = new THREE.WebGLRenderer();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // mountRef.current.appendChild(renderer.domElement);

    // Handle different file formats
    const handleFile = async () => {
      if (file.name.endsWith(".pcd")) {
        const loader = new PCDLoader();
        loader.load(URL.createObjectURL(file), (pointCloud) => {
          scene.add(pointCloud);
        });
      } else if (file.name.endsWith(".ply")) {
        const loader = new PLYLoader();
        loader.load(URL.createObjectURL(file), (geometry) => {
          const material = new THREE.PointsMaterial({
            size: pointSize,
            vertexColors: colorByAltitude,
            color: !colorByAltitude ? "white" : null,
          });
          const points = new THREE.Points(geometry, material);
          scene.add(points);
        });
      } else if (file.name.endsWith(".xyz")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // const lines = e.target.result.split("\n");
          // const vertices = [];
          // lines.forEach((line) => {
          //   const [x, y, z] = line.trim().split(" ").map(Number);
          //   if (x && y && z) vertices.push(x, y, z);
          // });

          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array(vertices.flat());
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
          );
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
            vertexColors: colorByAltitude,
            color: !colorByAltitude ? "white" : null,
          });
          const points = new THREE.Points(geometry, material);
          scene.add(points);
        };
        reader.readAsText(file);
      }
    };
    handleFile();

    // const material = new THREE.PointsMaterial({
    //   size: pointSize,
    //   vertexColors: colorByAltitude,
    //   color: !colorByAltitude ? "white" : null,
    // });

    // const pointCloud = new THREE.Points(geometry, material);
    // scene.add(pointCloud);

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
      //geometry.dispose();
      //material.dispose();
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
