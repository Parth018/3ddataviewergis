import React, { useState, useEffect } from "react";
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
  const [pointSize, setPointSize] = useState(1); // State for point size
  const [colorByAltitude, setColorByAltitude] = useState(false); // State for color by altitude
  const [activeTab, setActiveTab] = useState("3D"); // Default active tab is '3D'
  const [loading, setLoading] = useState(true); // State to track loading status
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to track sidebar visibility

  const togglePointSize = () => setPointSize(pointSize === 1 ? 2 : 1); // Toggle point size
  const toggleColorByAltitude = () => setColorByAltitude(!colorByAltitude); // Toggle color by altitude
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen); // Toggle sidebar open/close

  // Simulating data load
  useEffect(() => {
    setTimeout(() => {
      setLoading(false); // Simulate loading completion
    }, 1700); // 2 seconds delay for loading
  }, []);

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
                    Point Cloud Data: {pointCloudData ? "Loaded" : "Not Loaded"}
                  </p>
                  <p>GeoJSON Data: {geoJsonData ? "Loaded" : "Not Loaded"}</p>
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

            {/* Only show buttons when 3D Viewer is active */}
            {activeTab === "3D" && (
              <div className="log-panel">
                <div className="toggle-buttons">
                  <button className="toggle-btn" onClick={togglePointSize}>
                    Toggle Point Size
                  </button>
                  <button
                    className="toggle-btn"
                    onClick={toggleColorByAltitude}
                  >
                    Toggle Color by Altitude
                  </button>
                </div>
              </div>
            )}

            <div className="viewer-content">
              {activeTab === "3D" && pointCloudData && (
                // <ThreeDViewer
                //   pointCloudData={pointCloudData || []}
                //   pointSize={pointSize}
                //   colorByAltitude={colorByAltitude}
                //   setPointSize={setPointSize}
                //   setColorByAltitude={setColorByAltitude}
                // />
                <ThreeDViewer
                  pointCloudData={pointCloudData || []}
                  pointSize={pointSize}
                  colorByAltitude={colorByAltitude}
                  setPointSize={setPointSize}
                  setColorByAltitude={setColorByAltitude}
                />
              )}
              {activeTab === "GIS" && (
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
