const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/Scene.js',
    devtool: 'inline-source-map',
    target: 'node',
    output: {
        filename: 'server-scene.js',
        path: path.resolve(__dirname, 'dist'),
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    devServer: {
        contentBase: path.join(__dirname, './'),
        inline: true,
        compress: false,
        port: 9001,
        hot: false,
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env', '@babel/preset-react']
                }
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ['*', '!.gitignore', '!sessions']
        }),
    ],
};