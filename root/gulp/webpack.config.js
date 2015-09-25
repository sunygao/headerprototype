var path = require('path');

module.exports = {
    entry: "./app/scripts/project/main.js",
    output: {
        path: __dirname,
        filename: "../app/js/bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.html$/, loader: "handlebars-loader" }
        ]
    },
    devtool: 'eval',
    resolve: {
	    extensions: ['', '.js', '.json', '.css'],
        modulesDirectories: ["app/scripts/project", "app/scripts/project/app", "node_modules", "tpl","app/scripts/project/app/abstract/component"]
	},
    resolveLoader: {
        fallback: path.join(__dirname, 'node_modules'),
        alias: {
          'hbs': 'handlebars-loader'
        }
    },
    plugins: [],
    node: {
        fs: "empty" // avoids error messages 
    }
};