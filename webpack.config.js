const path = require('path');


const isDevelopment = process.env.NODE_ENV === 'development'

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

    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
};