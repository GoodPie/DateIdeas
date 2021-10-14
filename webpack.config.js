const path = require('path');

module.exports = {
    entry: './src/app.js',
    mode: "development",
    devtool: 'inline-source-map',

    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },

    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
};