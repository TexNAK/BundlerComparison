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
    devtool: 'source-map',
    // devtool: 'cheap-module-eval-source-map',
    devServer: {
        // hot: true,
        contentBase: './dist'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'webpack-project.bundle.js'
    },
    module: {
        rules: [
            // Run the linter
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
                        use: {
                            loader: 'babel-loader',
                            options: {
                                compact: true,
                                cacheDirectory: true,
                                // plugins: ['react-hot-loader/babel', 'transform-class-properties'],
                                // presets: ['env', 'react', 'react-hmre']
                                plugins: ['transform-class-properties'],
                                presets: ['env', 'react']
                            }
                        }
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
            // include all types of chunks
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
                // compress: false,
                // mangle: false
                // compress: {
                //     arrows: false,
                //     booleans: false,
                //     collapse_vars: false,
                //     computed_props: false,
                //     conditionals: false,
                //     dead_code: false,
                //     evaluate: false,
                //     hoist_props: false,
                //     if_return: false,
                //     inline: false,
                //     join_vars: false,
                //     loops: false,
                //     negate_iife: false,
                //     properties: false,
                //     reduce_funcs: false,
                //     switches: false,
                //     typeofs: false,
                //     unused: false
                // }
            }
        }),
        // new webpack.HotModuleReplacementPlugin()
    ]
});