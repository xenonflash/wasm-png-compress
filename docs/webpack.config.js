const path = require('path')

module.exports = {
    entry: './lib-index.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist-lib'),
        filename: 'js/main.js',
        library: 'wasm-png-compress',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    module: {
        rules: [
            // {
            //     test: /worker\.js$/,
            //     use: {
            //         loader: 'worker-loader',
            //         options: {
            //             name: 'js/worker.[hash].js'
            //         }
            //     }
            // },
            {
                test: /\.wasm$/,
                type: 'javascript/auto',
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'wasm/[name].[hash].[ext]',
                            publicPath: '../'
                        }
                    }
                ]
            }
        ]
    }
};