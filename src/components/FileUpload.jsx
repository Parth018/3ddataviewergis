import React, { useState } from "react";

const FileUpload = ({ setPointCloudData, setGeoJsonData, onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
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
          const lines = content.split("\n");
          const points = lines.length;
          //console.log(points);
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
        setErrorMessage("Unsupported file type.");
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
      <input
        id="file-upload"
        accept=".ply,.pcd,.xyz,.json"
        type="file"
        onChange={handleFileChange}
      />
      <p style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
        Supported file types: <b>.ply, .pcd, .xyz, .geojson</b>
      </p>
      {isProcessing && <p>Processing file...</p>} {/* Show loading indicator */}
      {file && !errorMessage && !isProcessing && (
        <div className="file-info">
          <p>Filename: {file.name}</p>
          <p>File Size: {(file.size / 1024).toFixed(2)} KB</p>
          {fileInfo && (
            <>
              <p className="point-cloud-matrix">Point Cloud Matrix: </p>
              <p>Number of Points: {fileInfo.points}</p>
              <p className="bounding-box">
                Bounding Box:
                <ul>
                  <li>
                    X: {fileInfo.boundingBox.minX} to{" "}
                    {fileInfo.boundingBox.maxX}
                  </li>
                  <li>
                    Y: {fileInfo.boundingBox.minY} to{" "}
                    {fileInfo.boundingBox.maxY}
                  </li>
                  <li>
                    Z: {fileInfo.boundingBox.minZ} to{" "}
                    {fileInfo.boundingBox.maxZ}
                  </li>
                </ul>
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
