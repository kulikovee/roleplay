var path = require('path');

module.exports = {
    entry: './',
    devServer: {
        contentBase: path.join(__dirname, './'),
        compress: true,
        port: 9000,
        hot: true,
    }
};