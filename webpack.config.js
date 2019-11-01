var path = require('path');

module.exports = {
    entry: './public/main.js',
    devServer: {
        contentBase: path.join(__dirname, './'),
        compress: true,
        port: 9000,
        hot: true,
    }
};