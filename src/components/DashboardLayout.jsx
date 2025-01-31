import React, { useState, useEffect, useRef } from "react";
import FileUpload from "./FileUpload";
import ThreeDViewer from "./ThreeDViewer";
import GISViewer from "./GISViewer";
import "./DashboardStyle.css";

function LoadingAnimation() {
  return (
    <div className="loading-animation">
      <div className="loading-square"></div>
    </div>
  );
}

function DashboardLayout() {
  const [pointCloudData, setPointCloudData] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [pointSize, setPointSize] = useState(0.05); // State for point size
  const [colorByAltitude, setColorByAltitude] = useState(false); // State for color by altitude
  const [activeTab, setActiveTab] = useState(""); // Default active tab is '3D'
  const [loading, setLoading] = useState(true); // State to track loading status
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to track sidebar visibility
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen); // Toggle sidebar open/close
  const timeoutRef = useRef(null); // Use useRef to store the timeout ID
  const [minAltitude, setMinAltitude] = useState(-Infinity); // Minimum Altitude
  const [maxAltitude, setMaxAltitude] = useState(Infinity); // Maximum Altitude

  // Simulating data load
  useEffect(() => {
    setTimeout(() => {
      setLoading(false); // Simulate loading completion
    }, 1700); // 2 seconds delay for loading

    if (geoJsonData && !pointCloudData) {
      setActiveTab("GIS"); // Switch to GIS tab if geoJsonData exists and no pointCloudData
    } else if (!geoJsonData && pointCloudData) {
      setActiveTab("3D"); // Switch to 3D tab if pointCloudData exists and no geoJsonData
    } else if (geoJsonData && pointCloudData) {
      // If both data are available, set active tab based on which one was uploaded last
      // if (geoJsonData && !pointCloudData) {
      //   setActiveTab("GIS"); // Prioritize geoJsonData if uploaded last
      // } else {
      //   setActiveTab("3D"); // Or, prioritize 3D if pointCloudData is uploaded last
      // }
    }
  }, [geoJsonData, pointCloudData, activeTab]);

  return (
    <div className="dashboard-layout">
      {loading ? (
        <LoadingAnimation />
      ) : (
        <>
          {/* Sidebar Button (always visible at the top) */}
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? "Done" : "Upload Data"}
          </button>

          {/* Sidebar Panel (File upload and metadata) */}
          {sidebarOpen && (
            <div className="file-upload-panel">
              <div className="file-upload-content">
                <FileUpload
                  setPointCloudData={setPointCloudData}
                  setGeoJsonData={setGeoJsonData}
                  onFileUpload={setPointCloudData}
                />
                <div className="metadata">
                  {/* Display metadata if needed */}
                  <p>
                    Point Cloud Data:{" "}
                    {pointCloudData ? <b>Loaded</b> : <b>Not Loaded</b>}
                  </p>
                  <p>
                    GeoJSON Data:{" "}
                    {geoJsonData ? <b>Loaded</b> : <b>Not Loaded</b>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Center Panel: Tabs and Viewers */}
          <div className="center-panel">
            <div className="tabs">
              <button
                className={activeTab === "3D" ? "active" : ""}
                onClick={() => setActiveTab("3D")}
                disabled={!pointCloudData} // Disable button if no pointCloudData
              >
                3D Viewer
              </button>
              <button
                className={activeTab === "GIS" ? "active" : ""}
                onClick={() => setActiveTab("GIS")}
                disabled={!geoJsonData} // Disable button if no geoJsonData
              >
                GIS Viewer
              </button>
            </div>

            {/* Only show buttons when 3D Viewer is active */}
            {activeTab === "3D" && pointCloudData && (
              <div className="log-panel">
                <div className="toggle-buttons">
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
                  <label>
                    Min Altitude:
                    <input
                      type="number"
                      value={minAltitude}
                      onChange={(e) =>
                        setMinAltitude(parseFloat(e.target.value).toFixed(6))
                      }
                      step="0.000001" // Controls the precision of the number input
                    />
                  </label>
                  <label>
                    Max Altitude:
                    <input
                      type="number"
                      value={maxAltitude}
                      onChange={(e) =>
                        setMaxAltitude(parseFloat(e.target.value).toFixed(6))
                      }
                      step="0.000001" // Controls the precision of the number input
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="viewer-content">
              {!pointCloudData && !geoJsonData && (
                <p className="Welcome-text">
                  Welcome to the 3D/GIS Viewer! Upload your data to get started.
                </p>
              )}

              {activeTab === "3D" && pointCloudData && (
                <div className="d-data">
                  <ThreeDViewer
                    pointCloudData={pointCloudData || []}
                    pointSize={pointSize}
                    colorByAltitude={colorByAltitude}
                    setPointSize={setPointSize}
                    setColorByAltitude={setColorByAltitude}
                    minAltitude={minAltitude}
                    maxAltitude={maxAltitude}
                  />
                </div>
              )}
              {activeTab === "GIS" && geoJsonData && (
                <GISViewer
                  geoJsonData={geoJsonData}
                  isSidebarOpen={sidebarOpen}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardLayout;
