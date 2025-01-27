export function parsePointCloudData(fileData) {
  const lines = fileData.split("\n");
  const pointData = [];
  let headerParsed = false;
  let pointStartIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("DATA")) {
      pointStartIndex = i + 1; // Data starts after the "DATA" line
      headerParsed = true;
      break;
    }
  }

  if (!headerParsed) {
    throw new Error("Invalid PCD file format");
  }

  for (let i = pointStartIndex; i < lines.length; i++) {
    const values = lines[i].split(" ");
    if (values.length >= 3) {
      const x = parseFloat(values[0]);
      const y = parseFloat(values[1]);
      const z = parseFloat(values[2]);
      pointData.push({ x, y, z });
    }
  }

  return pointData;
}
