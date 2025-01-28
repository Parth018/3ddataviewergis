import React, { useState } from "react";
import { parsePointCloudData } from "../utils/parsePointCloud";
import { calculatePointCloudMetadata } from "../utils/calculateMetadata";

const FileUpload = ({ setPointCloudData, setGeoJsonData, onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // New state for processing indication
  const [fileInfo, setFileInfo] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setErrorMessage("");
    setFile(selectedFile);
    setIsProcessing(true); // Start processing

    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (event) => {
      const fileData = event.target.result;
      const content = reader.result;

      if (
        fileExtension === "pcd" ||
        fileExtension === "xyz" ||
        fileExtension === "ply"
      ) {
        try {
          // if (fileExtension === "ply") {
          //   // If it's a PLY file, pass the ArrayBuffer to the processPlyFile function
          //   const arrayBuffer = fileData; // ArrayBuffer from readAsArrayBuffer
          //   processPlyFile(arrayBuffer);
          // } else {
          //   // For other file types, process as text
          //   const pointCloudData = parsePointCloudData(fileData);
          //   const metadata = calculatePointCloudMetadata(pointCloudData);
          //   setMetadata(metadata);
          //   setPointCloudData({ pointCloudData, metadata });
          // }
          const lines = content.split("\n");
          const points = lines.length;
          const vertices = [];

          lines.forEach((line) => {
            const [x, y, z] = line.trim().split(" ").map(Number);
            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
              vertices.push([x, y, z]);
            }
          });

          const boundingBox = {
            minX: Math.min(...vertices.map((v) => v[0])),
            maxX: Math.max(...vertices.map((v) => v[0])),
            minY: Math.min(...vertices.map((v) => v[1])),
            maxY: Math.max(...vertices.map((v) => v[1])),
            minZ: Math.min(...vertices.map((v) => v[2])),
            maxZ: Math.max(...vertices.map((v) => v[2])),
          };
          const fileMetadata = {
            name: selectedFile.name,
            size: (selectedFile.size / 1024).toFixed(2) + " KB",
            points,
            boundingBox,
          };

          setFileInfo(fileMetadata);
          onFileUpload({ file: selectedFile, vertices });
        } catch (err) {
          setErrorMessage("Error parsing point cloud data");
        }
      } else if (fileExtension === "json") {
        try {
          const geoJsonData = JSON.parse(fileData);
          setGeoJsonData(geoJsonData);
        } catch (err) {
          setErrorMessage("Error parsing GeoJSON data");
        }
      } else {
        setErrorMessage(
          "Unsupported file type. Please upload .pcd, .xyz, .ply, or .geojson."
        );
      }
      setIsProcessing(false); // End processing
    };

    reader.readAsText(selectedFile);
  };

  return (
    <div className="file-upload">
      <label htmlFor="file-upload" className="custom-file-upload">
        📂 Choose File
      </label>
      <input id="file-upload" type="file" onChange={handleFileChange} />
      {/* {isProcessing && <p>Processing file...</p>} 
      {file && !errorMessage && !isProcessing && (
        <div className="file-info">
          <p>Filename: {file.name}</p>
          <p>File Size: {(file.size / 1024).toFixed(2)} KB</p>
          {metadata && (
            <>
              <p>Number of Points: {metadata.numberOfPoints}</p>
              <p>
                Bounding Box: X({metadata.boundingBox.minX} -{" "}
                {metadata.boundingBox.maxX}), Y({metadata.boundingBox.minY} -{" "}
                {metadata.boundingBox.maxY}), Z({metadata.boundingBox.minZ} -{" "}
                {metadata.boundingBox.maxZ})
              </p>
            </>
          )}
        </div>
      )} */}
      {fileInfo && (
        <div className="file-info">
          <p>Filename: {fileInfo.name}</p>
          <p>File Size: {fileInfo.size}</p>
          <p>Number of Points: {fileInfo.points}</p>
          <p>
            Bounding Box:
            <ul>
              <li>
                X: {fileInfo.boundingBox.minX} to {fileInfo.boundingBox.maxX}
              </li>
              <li>
                Y: {fileInfo.boundingBox.minY} to {fileInfo.boundingBox.maxY}
              </li>
              <li>
                Z: {fileInfo.boundingBox.minZ} to {fileInfo.boundingBox.maxZ}
              </li>
            </ul>
          </p>
        </div>
      )}
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default FileUpload;
