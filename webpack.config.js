const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/js/App.ts',
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js",
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devServer: {
        static: __dirname + '/dist'
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                exclude: /node_modules/,
                use: [
                    {loader: "ts-loader"}
                ]
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ],
}