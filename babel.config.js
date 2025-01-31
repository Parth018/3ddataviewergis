module.exports = {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
    ],
    ignore: [
      'node_modules/mapbox-gl', // Exclude Mapbox GL JS from Babel transpiling
    ],
  };
  