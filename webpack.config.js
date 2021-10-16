const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");


const isDevelopment = process.env.NODE_ENV !== 'production'

module.exports = {
    entry: './src/app.js',
    mode: isDevelopment ? "development" : "production",
    devtool: isDevelopment ? 'inline-source-map' : 'hidden-source-map',

    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html'
        }),
        new CopyPlugin({
            patterns: [
                {from: path.resolve(__dirname, "manifest.json"), to: ""},
                {from: path.resolve(__dirname, "src/sw.js"), to: ""},
                {from: path.resolve(__dirname, "assets"), to: "assets"}
            ]
        })
    ],

    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
};
