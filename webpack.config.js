const path = require('path');

module.exports = {
    entry: './web/app.js',
    output: {
        filename: 'former2-bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
    target: 'web',
    resolve: {
        fallback: {
            // Node.js modules not available in browser
            'fs': false,
            'path': false,
            'vm': false,
            'process': false,
        }
    },
    // AWS SDK v2 is loaded separately via <script> tag — don't bundle it
    externals: {
        'aws-sdk': 'AWS',
    },
    optimization: {
        // Keep readable for debugging during development
        minimize: true,
    },
    performance: {
        // Bundle will be large due to 139 services + mappings
        maxAssetSize: 5 * 1024 * 1024,
        maxEntrypointSize: 5 * 1024 * 1024,
    },
};
