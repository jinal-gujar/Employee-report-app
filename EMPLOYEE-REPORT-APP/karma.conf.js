module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            './main.js',
            './fetchDataAndRenderChart.js',
            './test/index.spec.js'
        ],
        exclude: [],
        preprocessors: {
            './main.js': ['webpack', 'coverage'],
            './fetchDataAndRenderChart.js': ['webpack', 'coverage'],
            './test/**/*.spec.js': ['webpack']
        },
        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    }
                ]
            },
            resolve: {
                extensions: ['.js']
            }
        },
        reporters: ['dots', 'coverage', 'progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['ChromeHeadless'],
        singleRun: false,
        concurrency: Infinity,
        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                { type: 'html', subdir: 'html' },
                { type: 'lcov', subdir: 'lcov' },
                { type: 'text-summary' }
            ]
        },
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-coverage',
            'karma-webpack',
            'karma-jasmine-html-reporter'
        ]
    });
};
