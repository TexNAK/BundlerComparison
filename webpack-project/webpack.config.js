const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin({
    outputFormat: 'human'
});

const outputPath = path.join(process.cwd(), 'dist');

module.exports = smp.wrap({
    mode: 'development',
    entry: './src/index.jsx',
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        hot: true,
        contentBase: './dist'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'webpack-project.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                enforce: 'pre',
                use: [
                    {
                        options: {
                            eslintPath: require.resolve('eslint'),
                        },
                        loader: require.resolve('eslint-loader'),
                    },
                ],
                include: path.resolve(__dirname, 'src'),
            },
            {
                oneOf: [
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 10000,
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                    {
                        test: /\.css$/,
                        use: [
                            'style-loader',
                            { loader: 'css-loader', options: { importLoaders: 1 } },
                            'postcss-loader'
                        ]
                    },
                    {
                        test: /\.(js|jsx)$/,
                        exclude: /(node_modules|bower_components)/,
                        use: [{
                            loader: 'babel-loader',
                            options: {
                                compact: true,
                                cacheDirectory: true,
                                plugins: ['react-hot-loader/babel', 'transform-class-properties'],
                                presets: ['env', 'react', 'react-hmre']
                            }
                        }]
                    },
                    {
                        loader: require.resolve('file-loader'),
                        exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
                        options: {
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                ]
            }
        ]
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    plugins: [
        new webpack.DllReferencePlugin({
            context: process.cwd(),
            manifest: require(path.join(outputPath, 'ReactStuff.json'))
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: 'src/index.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: false,
                mangle: false
            }
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
});