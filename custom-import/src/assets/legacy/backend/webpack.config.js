const webpack                 = require( 'webpack' );
const path                    = require( 'path' );
const CleanWebpackPlugin      = require( 'clean-webpack-plugin' );
const MiniCssExtractPlugin    = require( 'mini-css-extract-plugin' );
const OptimizeCssAssetsPlugin = require( 'optimize-css-assets-webpack-plugin' );

module.exports = ( env, options ) => {
	let fileWatcher = true;
	let _mode       = `${ options.mode }`;

	// Check if we have to check the files
	if ( _mode == 'production' ){
		fileWatcher = false;
	}

	return {
		watch: fileWatcher,
		devtool: 'source-map',
		entry: {
			main: './src/index.js'
		},
		output: {
			path: path.resolve( __dirname, 'dist' ),
			filename: 'bundle.min.js',
		},
		externals: {
			jquery: 'jQuery'
		},
		resolve: {
			alias: {
				fonts: path.resolve( __dirname, './src/fonts' ),
			},
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: [ '@babel/preset-env' ]
						}
					}
				},
				{
					test: /\.(css|s[ac]ss)$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader
						},
						{
							loader: 'css-loader',
							options: {
								importLoaders: 2,
								sourceMap: true
							}
						},      
						{
							loader: 'postcss-loader',
							options: {
								plugins: function(){
									return [
										require( 'cssnano' )({
											preset: 'default',
										})
									];
								},
								sourceMap: true
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true
							}
						}
					]
				},
				{
					test: /\.(woff|woff2|eot|ttf|svg)$/,
					include: [
						path.join( __dirname, './src/fonts/' ),
					],
					loader: 'url-loader',
					options: {
						limit: 10,
						name: 'fonts/[name].[ext]',
						esModule: false,
					},
				},
				{
					test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
					include: [
						path.join( __dirname, './src/img/' ),
					],
					loader: 'url-loader',
					options: {
						limit: 10, // Convert images < 10kb to base64 strings
						name: 'img/[name].[ext]',
						esModule: false,
					},
				},
			]
		},
		plugins: [
			new CleanWebpackPlugin([
				'./dist/*.*',
				'./dist/fonts/*',
				'./dist/img/*',
			]),
			new MiniCssExtractPlugin({
				filename: 'bundle.min.css'
			}),
			new webpack.ProvidePlugin({
				$:      'jquery',
				jQuery: 'jquery'
			}),
		]
	}
}