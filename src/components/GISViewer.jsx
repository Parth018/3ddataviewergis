import React, { useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function GISViewer({ geoJsonData, isSidebarOpen }) {
  const mapContainerRef = useRef();
  const [popupContent, setPopupContent] = useState(null);
  const popupRef = useRef(null); // Track popup instance
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight); // Update the height on resize
    };

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-80.51, 43.46], // Default center if geoJsonData is not provided
      zoom: 4, // Default zoom level
    });

    if (geoJsonData) {
      map.on("load", () => {
        map.addSource("geojson-data", {
          type: "geojson",
          data: geoJsonData,
        });

        map.addLayer({
          id: "points",
          type: "circle",
          source: "geojson-data",
          paint: {
            "circle-radius": 6,
            "circle-color": "#007cbf",
          },
        });

        map.on("click", "points", (e) => {
          const properties = e.features[0].properties;
          const geometry = e.features[0].geometry;
          let lngLat;

          // If geometry is a point, use e.lngLat directly
          if (geometry.type === "Point") {
            //lngLat = geometry.coordinates;
            const [lng, lat] = geometry.coordinates;
            lngLat = { lng, lat }; // Convert array to object
          } else if (geometry.type === "LineString") {
            // Compute the midpoint of the LineString
            const totalPoints = geometry.coordinates.length;
            const sum = geometry.coordinates.reduce(
              (acc, [lng, lat]) => {
                acc.lng += lng;
                acc.lat += lat;
                return acc;
              },
              { lng: 0, lat: 0 }
            );

            lngLat = { lng: sum.lng / totalPoints, lat: sum.lat / totalPoints }; // Midpoint
          } else if (
            geometry.type === "Polygon" ||
            geometry.type === "MultiPolygon"
          ) {
            // For polygons and multipolygons, calculate the centroid of the geometry
            const coordinates =
              geometry.type === "Polygon"
                ? geometry.coordinates
                : geometry.coordinates[0];
            const centroid = coordinates[0].reduce(
              (acc, [lng, lat]) => {
                acc.lng += lng;
                acc.lat += lat;
                return acc;
              },
              { lng: 0, lat: 0 }
            );
            const length = coordinates[0].length;
            lngLat = { lng: centroid.lng / length, lat: centroid.lat / length };
          } else {
            console.error("Unsupported geometry type:", geometry.type);
            return;
          }

          if (lngLat && Array.isArray([lngLat.lng, lngLat.lat])) {
            const newPopupContent = ` 
              <strong>Coordinates:</strong> [lng:${lngLat.lng.toFixed(
                4
              )}, lat:${lngLat.lat.toFixed(4)}] <br/>
              <strong>Description:</strong> ${
                properties.admin ? properties.state : "N/A"
              } <br/>
              ${
                properties.description
                  ? `<strong>Admin:</strong> ${properties.description}`
                  : ""
              } <br/>
              ${
                properties.tags
                  ? `<strong>Tags:</strong> ${properties.tags}`
                  : `<strong>Geometry Type:</strong> ${geometry.type}`
              }
            `;

            // Close any existing popup
            if (popupRef.current) {
              popupRef.current.remove();
            }

            // Create and track new popup
            const popup = new mapboxgl.Popup({ closeOnClick: true })
              .setLngLat(lngLat)
              .setHTML(newPopupContent)
              .addTo(map);

            popupRef.current = popup; // Save popup instance

            popup.on("close", () => {
              setPopupContent(null);
              setIsPopupOpen(false); // Update state on popup close
            });

            setPopupContent(newPopupContent);
            setIsPopupOpen(true); // Update state on popup open

            // Smooth transition when centering the map to the clicked point
            map.flyTo({
              center: lngLat,
              essential: true, // Ensures the animation happens even if the user has disabled animation in the map settings
              //zoom: 4, // Optional: You can change this to control the zoom level when the map centers
            });
          } else {
            console.error("Invalid coordinates format:", lngLat);
          }
        });

        map.on("mouseenter", "points", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "points", () => {
          map.getCanvas().style.cursor = "";
        });

        // Calculate bounds for the geoJson data
        const bounds = new mapboxgl.LngLatBounds();
        geoJsonData.features.forEach((feature) => {
          if (feature.geometry && feature.geometry.coordinates) {
            if (feature.geometry.type === "Point") {
              bounds.extend(feature.geometry.coordinates);
            } else if (
              feature.geometry.type === "Polygon" ||
              feature.geometry.type === "MultiPolygon"
            ) {
              feature.geometry.coordinates.forEach((coordinateSet) => {
                coordinateSet.forEach((coords) => {
                  bounds.extend(coords);
                });
              });
            }
          }
        });

        // Use fitBounds to fit the map to the bounding box of the data
        if (bounds.isEmpty()) {
          map.setCenter([-80.51, 43.46]); // If no bounds, set default center
        } else {
          map.fitBounds(bounds, { padding: 50 });
        }
      });
    }
    window.addEventListener("resize", handleResize);
    // Trigger resize to adjust map layout when sidebar is toggled
    if (!isSidebarOpen) {
      window.dispatchEvent(new Event("resize"));
    }
    return () => {
      map.remove();
      window.removeEventListener("resize", handleResize);
      if (popupRef.current) popupRef.current.remove(); // Cleanup popup
    };
  }, [geoJsonData, isSidebarOpen]);

  return (
    <div
      id="map"
      style={{ height: `${windowHeight}px` }} // Dynamically adjust height
      ref={mapContainerRef}
      className="h-full w-full"
      aria-hidden={isPopupOpen ? "true" : "false"} // Hide map when popup is open
    >
      {popupContent && (
        <div
          className="popup-metadata"
          tabIndex="0"
          role="dialog"
          aria-live="assertive"
          aria-label="Marker Details"
        >
          <h4>Marker Details:</h4>
          <div dangerouslySetInnerHTML={{ __html: popupContent }} />
        </div>
      )}
    </div>
  );
}

export default GISViewer;
