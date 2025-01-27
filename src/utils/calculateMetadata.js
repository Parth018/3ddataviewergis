// calculateMetadata.js

export function calculatePointCloudMetadata(pointCloudData) {
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  let minZ = Infinity,
    maxZ = -Infinity;

  pointCloudData.forEach((point) => {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
    if (point.z < minZ) minZ = point.z;
    if (point.z > maxZ) maxZ = point.z;
  });

  return {
    boundingBox: {
      minX,
      maxX,
      minY,
      maxY,
      minZ,
      maxZ,
    },
    numberOfPoints: pointCloudData.length,
  };
}
