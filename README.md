# 3D Data Viewer with GIS Integration

## Project Overview

This web application allows users to upload and visualize 3D point cloud data along with basic GIS functionality. The app supports the following:

- 3D Point Cloud Viewer
- GIS Data Viewer using GeoJSON
- Interactive UI with filtering options and metadata display.

## Features

- Upload and display `.xyz`, `.pcd` files for point cloud visualization.
- Display GIS data from GeoJSON files on a map.
- Pan, zoom, and rotate controls for both 3D and GIS viewers.
- Point cloud colorization based on altitude (if available).

## Tech Stack

- **Frontend**: React.js
- **3D Rendering**: Three.js
- **GIS Mapping**: Mapbox GL JS
- **CSS Framework**: Tailwind CSS

## Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-repo/3d-gis-viewer.git
   cd 3d-gis-viewer
   ```

2. **Install dependencies**:

npm install

3. **Run the development server**:

npm start

4. Open your browser and navigate to http://localhost:3000 to start using the app.

File Formats

Point Cloud Data: .xyz, .pcd
GIS Data: .geojson

Optional Enhancements
Time-series animation for GIS data
Altitude-based filtering for point cloud data

---

### **Final Steps**

1. **Install Dependencies**:  
   Make sure you install the necessary libraries (React, Three.js, Mapbox GL JS, Tailwind CSS, etc.) by running:

```bash
npm install react three mapbox-gl tailwindcss

```

2. **Setting up Mapbox Access Token**:

Make sure to replace YOUR_MAPBOX_ACCESS_TOKEN in GISViewer.jsx with your own Mapbox access token.

Next Steps

1. Test the Implementation:
   Test the file upload and visualizations with sample data (e.g., Stanford Bunny .pcd file and sample .geojson).

2. Further Improvements:
   Implement additional features like time-series animation, filtering options for 3D data based on altitude, or any UI enhancements that improve the user experience.
