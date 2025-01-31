module.exports = {
    // Other Webpack settings
    module: {
      rules: [
        {
          test: /mapbox-gl.*\.js$/, // Match Mapbox GL JS files
          use: 'worker-loader',     // Use worker-loader to handle Web Workers
          options: {
            inline: true,           // Inline the worker code within the same bundle
          },
        },
        {
          test: /mapbox-gl.*\.css$/, // Handle CSS for Mapbox GL
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
  };
  