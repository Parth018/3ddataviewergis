import React, { useState } from "react";
import FileUpload from "./FileUpload";
import ThreeDViewer from "./ThreeDViewer";
import GISViewer from "./GISViewer";
import "./DashboardStyle.css";
function DashboardLayout() {
  const [pointCloudData, setPointCloudData] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [pointSize, setPointSize] = useState(1); // State for point size
  const [colorByAltitude, setColorByAltitude] = useState(false); // State for color by altitude
  const [activeTab, setActiveTab] = useState("3D"); // Default active tab is '3D'

  const togglePointSize = () => setPointSize(pointSize === 1 ? 2 : 1); // Toggle point size
  const toggleColorByAltitude = () => setColorByAltitude(!colorByAltitude); // Toggle color by altitude

  return (
    <div className="dashboard-layout">
      {/* Left Panel: File Upload */}
      <div className="file-upload-panel">
        <FileUpload
          setPointCloudData={setPointCloudData}
          setGeoJsonData={setGeoJsonData}
        />
        <div className="metadata">
          {/* Display metadata if needed */}
          <p>Point Cloud Data: {pointCloudData ? "Loaded" : "Not Loaded"}</p>
          <p>GeoJSON Data: {geoJsonData ? "Loaded" : "Not Loaded"}</p>
        </div>
      </div>

      {/* Center Panel: Tabs and Viewers */}
      <div className="viewer-panel">
        <div className="tabs">
          <button
            className={activeTab === "3D" ? "active" : ""}
            onClick={() => setActiveTab("3D")}
          >
            3D Viewer
          </button>
          <button
            className={activeTab === "GIS" ? "active" : ""}
            onClick={() => setActiveTab("GIS")}
          >
            GIS Viewer
          </button>
        </div>

        <div className="viewer-content">
          {activeTab === "3D" && (
            <ThreeDViewer
              pointCloudData={pointCloudData || []}
              pointSize={pointSize}
              colorByAltitude={colorByAltitude}
              setPointSize={setPointSize}
              setColorByAltitude={setColorByAltitude}
            />
          )}
          {activeTab === "GIS" && <GISViewer geoJsonData={geoJsonData} />}
        </div>
      </div>

      {/* Bottom Panel: Control Panel */}
      <div className="log-panel">
        <button onClick={togglePointSize}>Toggle Point Size</button>
        <button onClick={toggleColorByAltitude}>
          Toggle Color by Altitude
        </button>
      </div>
    </div>
  );
}

export default DashboardLayout;
