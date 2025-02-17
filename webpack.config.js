import path from "path";

export default {
  entry: "./src/index.ts",
  output: {
    path: path.resolve("dist"),
    filename: "index.ts",
    library: "ManagedGLB",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  experiments: {
    outputModule: true,
  },
  externals: {
    react: "react",
    "react-dom": "react-dom",
    "@react-three/drei": "@react-three/drei",
  },
};
