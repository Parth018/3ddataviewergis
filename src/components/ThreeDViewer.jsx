import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";

const ThreeDViewer = ({
  pointCloudData,
  pointSize,
  colorByAltitude,
  setPointSize,
  setColorByAltitude,
}) => {
  const canvasRef = useRef(null);
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

    // Handle different file formats
    const handleFile = async () => {
      if (file.name.endsWith(".pcd")) {
        const loader = new PCDLoader();
        loader.load(URL.createObjectURL(file), (pointCloud) => {
          pointCloud.material.size = pointSize;
          pointCloud.material.needsUpdate = true;
          // Color by altitude logic for PCD
          if (colorByAltitude) {
            const positions = pointCloud.geometry.attributes.position.array;
            const colors = new Float32Array(positions.length);

            let minZ = Infinity,
              maxZ = -Infinity;
            for (let i = 2; i < positions.length; i += 3) {
              const z = positions[i];
              minZ = Math.min(minZ, z);
              maxZ = Math.max(maxZ, z);
            }

            for (let i = 2, j = 0; i < positions.length; i += 3, j += 3) {
              const z = positions[i];
              const normalizedZ = (z - minZ) / (maxZ - minZ);
              const color = new THREE.Color().setHSL(
                normalizedZ * 0.7,
                1.0,
                0.5
              );
              colors[j] = color.r;
              colors[j + 1] = color.g;
              colors[j + 2] = color.b;
            }

            pointCloud.geometry.setAttribute(
              "color",
              new THREE.BufferAttribute(colors, 3)
            );
            pointCloud.material.vertexColors = true; // Set vertexColors as true
          }

          scene.add(pointCloud);
        });
      } else if (file.name.endsWith(".ply")) {
        const loader = new PLYLoader();
        loader.load(URL.createObjectURL(file), (geometry) => {
          const material = new THREE.PointsMaterial({
            size: pointSize,
            vertexColors: colorByAltitude ? true : false, // Conditional for vertex colors
            color: !colorByAltitude ? "white" : null,
          });
          // Color by altitude logic for PLY
          if (colorByAltitude) {
            const positions = geometry.attributes.position.array;
            const colors = new Float32Array(positions.length);

            let minZ = Infinity,
              maxZ = -Infinity;
            for (let i = 2; i < positions.length; i += 3) {
              const z = positions[i];
              minZ = Math.min(minZ, z);
              maxZ = Math.max(maxZ, z);
            }

            for (let i = 2, j = 0; i < positions.length; i += 3, j += 3) {
              const z = positions[i];
              const normalizedZ = (z - minZ) / (maxZ - minZ);
              const color = new THREE.Color().setHSL(
                normalizedZ * 0.7,
                1.0,
                0.5
              );
              colors[j] = color.r;
              colors[j + 1] = color.g;
              colors[j + 2] = color.b;
            }

            geometry.setAttribute(
              "color",
              new THREE.BufferAttribute(colors, 3)
            );
          }
          const points = new THREE.Points(geometry, material);
          scene.add(points);
        });
      } else if (file.name.endsWith(".xyz")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array(vertices.flat());
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
          );
          // Color by altitude logic for XYZ
          if (colorByAltitude) {
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

            geometry.setAttribute(
              "color",
              new THREE.BufferAttribute(colors, 3)
            );
          }

          const material = new THREE.PointsMaterial({
            size: pointSize,
            vertexColors: colorByAltitude ? true : false, // Conditional for vertex colors
            color: !colorByAltitude ? "white" : null,
          });
          const points = new THREE.Points(geometry, material);
          scene.add(points);
        };
        reader.readAsText(file);
      }
    };
    handleFile();
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
    </div>
  );
};

export default ThreeDViewer;
