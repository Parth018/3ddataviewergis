import React, { useState } from "react";
import { parsePointCloudData } from "../utils/parsePointCloud";
import { calculatePointCloudMetadata } from "../utils/calculateMetadata";

const FileUpload = ({ setPointCloudData, setGeoJsonData }) => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // New state for processing indication

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

      if (
        fileExtension === "pcd" ||
        fileExtension === "xyz" ||
        fileExtension === "ply"
      ) {
        try {
          if (fileExtension === "ply") {
            // If it's a PLY file, pass the ArrayBuffer to the processPlyFile function
            const arrayBuffer = fileData; // ArrayBuffer from readAsArrayBuffer
            processPlyFile(arrayBuffer);
          } else {
            // For other file types, process as text
            const pointCloudData = parsePointCloudData(fileData);
            const metadata = calculatePointCloudMetadata(pointCloudData);
            setMetadata(metadata);
            setPointCloudData({ pointCloudData, metadata });
          }
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

    // Conditionally read as ArrayBuffer or Text based on file type
    if (fileExtension === "ply") {
      reader.readAsArrayBuffer(selectedFile); // For PLY files
    } else {
      reader.readAsText(selectedFile); // For other file types
    }
  };

  // New function for handling large .ply files incrementally
  const processPlyFile = (fileData) => {
    const chunkSize = 1000 * 12; // 1000 vertices, 12 bytes each
    let chunkIndex = 0;
    let pointCloudData = [];

    const processChunk = () => {
      try {
        const chunk = fileData.slice(chunkIndex, chunkIndex + chunkSize);
        chunkIndex += chunkSize;

        const chunkData = parsePointCloudData(chunk);
        pointCloudData = [...pointCloudData, ...chunkData];

        if (chunkIndex < fileData.byteLength) {
          setTimeout(processChunk, 0); // Process next chunk
        } else {
          const metadata = calculatePointCloudMetadata(pointCloudData);
          setMetadata(metadata);
          setPointCloudData({ pointCloudData, metadata });
        }
      } catch (err) {
        setErrorMessage(
          `Error processing chunk at index ${chunkIndex / chunkSize}: ${
            err.message
          }`
        );
        setIsProcessing(false); // Stop processing
      }
    };

    processChunk(); // Start processing
  };

  return (
    <div className="file-upload">
      <label htmlFor="file-upload" className="custom-file-upload">
        📂 Choose File
      </label>
      <input id="file-upload" type="file" onChange={handleFileChange} />
      {isProcessing && <p>Processing file...</p>} {/* Show loading indicator */}
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
      )}
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default FileUpload;
