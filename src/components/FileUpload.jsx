import React, { useState } from "react";
import { parsePointCloudData } from "../utils/parsePointCloud";
import { calculatePointCloudMetadata } from "../utils/calculateMetadata";

const FileUpload = ({ setPointCloudData, setGeoJsonData }) => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [metadata, setMetadata] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setErrorMessage("");
    setFile(selectedFile);

    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = () => {
      const fileData = reader.result;

      console.log("File Data: ", fileData); // Log file data for debugging

      if (fileExtension === "pcd" || fileExtension === "xyz") {
        try {
          const pointCloudData = parsePointCloudData(fileData);
          const metadata = calculatePointCloudMetadata(pointCloudData);
          setMetadata(metadata);
          setPointCloudData({ pointCloudData, metadata });
        } catch (err) {
          setErrorMessage("Error parsing point cloud data");
        }
      } else if (fileExtension === "json") {
        try {
          console.log("Parsing GeoJSON..."); // Log for GeoJSON data
          const geoJsonData = JSON.parse(fileData);
          //console.log("Parsed GeoJSON Data: ", geoJsonData); // Log parsed data for debugging
          setGeoJsonData(geoJsonData);
        } catch (err) {
          console.error("GeoJSON Parsing Error: ", err); // Log error to see what's failing
          setErrorMessage("Error parsing GeoJSON data");
        }
      } else {
        setErrorMessage(
          "Unsupported file type. Please upload .pcd, .xyz, or .geojson."
        );
      }
    };

    reader.readAsText(selectedFile);
  };

  return (
    <div className="file-upload">
      <input type="file" onChange={handleFileChange} />
      {file && !errorMessage && (
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
