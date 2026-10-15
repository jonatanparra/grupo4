/* =========================================================
   Configuración de Karma + Jasmine para los componentes React.
   - Webpack + Babel compilan el JSX de los archivos *.spec.js(x).
   - babel-plugin-istanbul instrumenta el código para el reporte de cobertura.
   - Se ejecuta en Chrome Headless (o Edge si Chrome no está instalado).
   ========================================================= */
const fs = require("fs");
const path = require("path");

// Karma usa CHROME_BIN para ubicar el navegador. Si no está definido,
// probamos rutas comunes de Chrome y, como alternativa, Edge (también es Chromium).
if (!process.env.CHROME_BIN) {
  const candidatos = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  ];
  const encontrado = candidatos.find((ruta) => fs.existsSync(ruta));
  if (encontrado) process.env.CHROME_BIN = encontrado;
}

module.exports = function (config) {
  config.set({
    frameworks: ["jasmine", "webpack"],

    files: [
      { pattern: "src/test/setup.js", watched: false },
      { pattern: "src/**/*.spec.js", watched: false },
      { pattern: "src/**/*.spec.jsx", watched: false },
      // Imágenes y videos de la carpeta public (se sirven, pero no se cargan como scripts)
      { pattern: "public/**/*", included: false, served: true, watched: false },
    ],

    proxies: { "/img/": "/base/public/img/", "/video/": "/base/public/video/" },

    preprocessors: {
      "src/test/setup.js": ["webpack"],
      "src/**/*.spec.js": ["webpack"],
      "src/**/*.spec.jsx": ["webpack"],
    },

    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      resolve: { extensions: [".js", ".jsx"] },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            // package.json usa "type": "module"; permite importar sin extensión (igual que Vite).
            resolve: { fullySpecified: false },
            use: {
              loader: "babel-loader",
              options: {
                presets: [
                  ["@babel/preset-env", { targets: { chrome: "100" } }],
                  ["@babel/preset-react", { runtime: "automatic" }],
                ],
                // Instrumenta solo el código de la aplicación (no los tests) para medir cobertura.
                plugins: [["istanbul", { exclude: ["**/*.spec.js", "**/*.spec.jsx", "src/test/**"] }]],
              },
            },
          },
        ],
      },
    },

    reporters: ["spec", "kjhtml", "coverage"],

    coverageReporter: {
      dir: path.join(__dirname, "coverage"),
      reporters: [{ type: "html", subdir: "html" }, { type: "json-summary", subdir: "." }, { type: "text-summary" }, { type: "text", subdir: ".", file: "cobertura.txt" }],
    },

    specReporter: { suppressSkipped: true, showSpecTiming: false },

    browsers: ["ChromeHeadless"],
    singleRun: false,
    browserNoActivityTimeout: 60000,
  });
};
