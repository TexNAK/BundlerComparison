const path = require('path');
const webpack = require('webpack');

const outputPath = path.join(process.cwd(), 'dist');

module.exports = {
    context: process.cwd(),
    entry: {
        ReactStuff:[
            'react',
            'react-dom',
            '@material-ui/core',
            '@material-ui/icons',
            'victory',
            'prop-types'
        ]
    },

    output: {
        filename: '[name].dll.js',
        path: outputPath,
        library: '[name]',
    },

    plugins: [
        new webpack.DllPlugin({
            name: '[name]',
            path: path.join(outputPath, '[name].json')
        })
    ]
};