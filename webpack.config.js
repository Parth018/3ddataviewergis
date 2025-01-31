// webpack.config.js
module.exports = {
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!mapbox-gl)/,  // Exclude Mapbox GL JS
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  };
  