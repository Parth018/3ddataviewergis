import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Function to parse .pcd files manually
const parsePCD = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const content = e.target.result;
      const lines = content.split("\n");

      let dataStart = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("DATA")) {
          dataStart = i + 1;
          break;
        }
      }

      const points = [];
      for (let i = dataStart; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const parts = line.split(" ");
          const x = parseFloat(parts[0]);
          const y = parseFloat(parts[1]);
          const z = parseFloat(parts[2]);
          points.push({ x, y, z });
        }
      }

      resolve(points);
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const ThreeDViewer = ({
  pointCloudData,
  pointSize,
  colorByAltitude,
  setPointSize,
  setColorByAltitude,
}) => {
  const [uploadedPointCloud, setUploadedPointCloud] = useState([]);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".pcd")) {
      parsePCD(file)
        .then((points) => {
          setUploadedPointCloud(points); // Update the point cloud data
        })
        .catch((error) => {
          console.error("Error parsing PCD file:", error);
        });
    } else {
      alert("Please upload a valid .pcd file.");
    }
  }, []);

  useEffect(() => {
    // Ensure dataToRender is an array
    const dataToRender =
      Array.isArray(uploadedPointCloud) && uploadedPointCloud.length > 0
        ? uploadedPointCloud
        : Array.isArray(pointCloudData) && pointCloudData.length > 0
        ? pointCloudData
        : [];

    if (dataToRender.length === 0) return; // Exit early if no point cloud data

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.position.z = 5;

    const geometry = new THREE.BufferGeometry();
    const points = dataToRender.map(
      (point) => new THREE.Vector3(point.x, point.y, point.z)
    );
    geometry.setFromPoints(points);

    const colors = [];
    if (colorByAltitude) {
      const minAltitude = Math.min(...dataToRender.map((p) => p.z));
      const maxAltitude = Math.max(...dataToRender.map((p) => p.z));

      dataToRender.forEach((point) => {
        const colorValue =
          (point.z - minAltitude) / (maxAltitude - minAltitude);
        colors.push(new THREE.Color().setHSL(1 - colorValue, 1, 0.5));
      });
    }

    const material = new THREE.PointsMaterial({
      size: pointSize,
      vertexColors: true, // Use vertex colors
    });

    const pointCloud = new THREE.Points(geometry, material);
    if (colors.length > 0) {
      pointCloud.geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(colors.flat()), 3)
      );
    }

    scene.add(pointCloud);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [uploadedPointCloud, pointCloudData, pointSize, colorByAltitude]);

  const handleResize = () => {
    const { current: canvas } = canvasRef;
    if (canvas) {
      const { width, height } = canvas.getBoundingClientRect();
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} accept=".pcd" />
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
