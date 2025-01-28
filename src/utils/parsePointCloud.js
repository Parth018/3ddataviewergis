export function parsePointCloudData(fileData) {
  if (!(fileData instanceof ArrayBuffer)) {
    throw new TypeError("Input must be an ArrayBuffer");
  }

  const dataView = new DataView(fileData);
  let offset = 0;

  // Parse header
  const header = parseHeader(dataView);
  if (!header || !header.numVertices) {
    console.error("Invalid header or no vertices found.");
    throw new Error("Invalid or corrupted PLY file.");
  }
  offset = header.endOffset;

  // Parse point data
  const pointData = [];
  for (let i = 0; i < header.numVertices; i++) {
    const x = dataView.getFloat32(offset, true);
    const y = dataView.getFloat32(offset + 4, true);
    const z = dataView.getFloat32(offset + 8, true);

    if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
      pointData.push({ x, y, z });
    } else {
      console.warn(
        `Skipping invalid point at index ${i}: x=${x}, y=${y}, z=${z}`
      );
    }
    offset += 12; // Move to next vertex
  }

  // Ensure there are enough valid points
  if (pointData.length < 10) {
    console.error("Insufficient valid points for rendering.");
    throw new Error("Not enough valid points in the point cloud.");
  }

  return pointData;
}

function parseHeader(dataView) {
  let offset = 0;
  let header = "";

  // Step 1: Read until we find the end of the header
  while (true) {
    const char = String.fromCharCode(dataView.getUint8(offset));
    header += char;
    offset++;

    if (header.includes("end_header")) {
      break;
    }
  }

  // Step 2: Extract important details from the header
  const lines = header.split("\n");
  let numVertices = 0;

  // Search for the line with 'element vertex'
  for (const line of lines) {
    if (line.startsWith("element vertex")) {
      numVertices = parseInt(line.split(" ")[2]);
    }
  }

  console.log("Header parsed. Number of vertices:", numVertices);
  return { numVertices, endOffset: offset };
}
