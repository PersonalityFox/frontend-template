let gulp = require( 'gulp' ),
	gulpLoadPlugins = require('gulp-load-plugins'),
	$ = gulpLoadPlugins(),
	del = require('del'),
	source = require( 'vinyl-source-stream' ),
	tsify = require( 'tsify' ),
	buffer = require( 'vinyl-buffer' ),
	browserify = require( 'browserify' ),
	browserSync = require("browser-sync"),
	reload = browserSync.reload,
	rimraf  = require('rimraf'),
	path = require('path'),
	through = require('through2');
/**
 * Support functions
 * @returns {*}
 */

function cleaner() {
    return through.obj(function(file, enc, cb){
        rimraf( path.resolve( (file.cwd || process.cwd()), file.path), function (err) {
            if (err) {
                this.emit('error', new $.util.PluginError('Cleanup old files', err));
            }
            this.push(file);
            cb();
        }.bind(this));
    });
}

/**
 * Sources
 */

// All paths
let data =
{
	build:
	{
		css: './build/assets/styles/',
		js: './build/assets/scripts/',
		html: './build/',
		img: './build/assets/images/',
        font: './build/assets/font/'
	},
	src: {
		css: './src/styles/lib/**/*.css',
		less: './src/styles/**/*.less',
		js: './src/scripts/lib/**/*.js',
		ts: './src/scripts/main.ts',
		html: ['./src/**/*.html', '!./src/templates/*.html'],
		img: './src/images/**/*.{png,jpg,svg,ico}',
        manifest: './src/manifest/',
        font: './src/font/**/*.*'
	},
	watch:
	{
		css: './src/styles/lib/**/*.css',
		less: './src/styles/**/*.less',
		js: './src/scripts/lib/**/*.js',
		ts: './src/scripts/**/*.ts',
		html: './src/**/*.html',
		img: './src/images/**/*.{png,jpg,svg}'
	}
};

// Configuration for local server
let config =
{
	server:
	{
		baseDir: "./build"
	},
	//tunnel: true,
	host: 'localhost',
	port: 9000,
    files: "./build/*.*", // watching to reload
	notify: true,
	codeSync: true,
	logLevel: "info",
	logPrefix: "Main Template"
};

let production = false;

gulp.task( 'LESS', ['html+less:build'], function() {
    gulp.src( ['./build/**/*.*'], {read: false})
        .pipe( $.revOutdated(1) ) // leave 1 latest asset file for every file name prefix.
        .pipe( cleaner() );
});
gulp.task( 'TS', ['html+ts:build'], function() {
	gulp.src( ['./build/**/*.*'], {read: false})
		.pipe( $.revOutdated() ) // leave 1 latest asset file for every file name prefix.
		.pipe( cleaner() );
});
gulp.task( 'HTML', function() {
    gulp.src( data.src.html)
        .pipe( $.rigger() )
        .pipe( $.if( production, $.htmlmin(
          {
               collapseWhitespace: true,
               conservativeCollapse: false,
               keepClosingSlash: true,
               minifyCSS: true,
               minifyJS: true,
               removeComments: true,
               removeEmptyElements: false
           })))
        .pipe( gulp.dest(data.build.html) )
        .pipe( reload({stream: true}) );
});

// Basic copy
gulp.task( 'js:copy', function ()
{
    return gulp.src( data.src.js )
    //.pipe( $.sourcemaps.init( {loadMaps: true} ) )
	    .pipe( $.if( production, $.uglify() ) )
    //.pipe( $.sourcemaps.write( './' ) )
        .pipe( gulp.dest( data.build.js ) )
        .pipe( $.duration( 'Copy js' ) );
});
gulp.task( 'font:copy', function ()
{
    return gulp.src( data.src.font )
        .pipe( gulp.dest( data.build.font ) )
        .pipe( $.duration( 'Copy fonts' ) );
});
gulp.task( 'css:copy', function ()
{
    return gulp.src( data.src.css )
        .pipe( gulp.dest( data.build.css ) )
        .pipe( $.duration( 'Copy css' ) );
});
gulp.task( 'img:copy', function ()
{
    return gulp.src( data.src.img )
        .pipe( gulp.dest( data.build.img ) );
});

gulp.task( 'img:compress:copy', function ()
{
    return gulp.src( data.src.img )
        .pipe( $.image() )
        .pipe( gulp.dest( data.build.img ) );
});
gulp.task( 'img:progressiv:copy', function ()
{
    return gulp.src( data.src.img )
        .pipe($.debug())
        .pipe($.imagemin(
            [
                $.imagemin.gifsicle({interlaced: true}),
                $.imagemin.jpegtran({progressive: true}),
                $.imagemin.optipng({optimizationLevel: 5}),
                $.imagemin.svgo({plugins: [{removeViewBox: false}]})
            ]
        ))
        .pipe( gulp.dest( data.build.img ) );
});

gulp.task('server:start', function () {
    browserSync(config);
});

// separator in gulp list
gulp.task( '==== SUPPORTS =====', function ( event )
{
    return console.log('');
});

gulp.task( 'ts:build', function ()
{
	return browserify( data.src.ts, {debug: true} )
		.plugin(
			'tsify', {
				target: 'ES5',
				noImplicitAny: true})
		.bundle()
		.pipe( source( 'main.js' ) )
		.pipe( buffer() )
		//.pipe( $.sourcemaps.init( {loadMaps: true} ) )
		.pipe( $.if( production, $.uglify() ) )
		//.pipe( $.sourcemaps.write( './' ) )
        .pipe( $.rev() )
        .pipe( gulp.dest( data.build.js ) )
        .pipe( $.rev.manifest() )
		.pipe( gulp.dest( data.src.manifest ) )
		.pipe( $.duration( 'Create TypeScript' ) )
        .pipe( reload({stream: true}) );
});
gulp.task( 'less:build', function ( event )
{
	return gulp.src( data.src.less )
		.pipe( $.concat( 'common.less' ) )
		.pipe( $.less() )
		.pipe( $.autoprefixer({
			browsers: ["> 0.5%", "ie 10"],
			cascade: false
		}))
		.pipe( $.if( production, $.csso() ))
        .pipe( $.rev() )
		.pipe( gulp.dest( data.build.css ))
        .pipe( $.rev.manifest() )
        .pipe( gulp.dest( data.src.manifest ))
        .pipe( reload({stream: true}) );
});

// ---------------- LESS REV --------------------
gulp.task('html+less:build', ['html:rev:less'], function () {
	gulp.src( data.src.html )
		.pipe( $.rigger() )
		.pipe( $.if( production, $.htmlmin(
			{
				collapseWhitespace: true,
				conservativeCollapse: false,
				keepClosingSlash: true,
				minifyCSS: true,
				minifyJS: true,
				removeComments: true,
				removeEmptyElements: false
			})))
		.pipe( gulp.dest(data.build.html) )
		.pipe( reload({stream: true}) );
});
gulp.task('html:rev:less', ['less:build'],function () {
	let pathToCSSHTML = './src/templates/';
    return gulp.src([ data.src.manifest + '*.json', pathToCSSHTML+'styles.html'])
        .pipe( $.revCollector({
            replaceReved: true
        }) )
        .pipe( gulp.dest( pathToCSSHTML ) );
});
// ---------------- TS REV ----------------------
gulp.task('html+ts:build', ['html:rev:ts'], function () {
    gulp.src( data.src.html )
        .pipe( $.rigger() )
        .pipe( $.if( production, $.htmlmin(
            {
                collapseWhitespace: true,
                conservativeCollapse: false,
                keepClosingSlash: true,
                minifyCSS: true,
                minifyJS: true,
                removeComments: true,
                removeEmptyElements: false
            })))
        .pipe( gulp.dest(data.build.html) )
        .pipe( reload({stream: true}) );
});
gulp.task('html:rev:ts', ['ts:build'],function () {
    let pathToJSHTML = './src/templates/';
    return gulp.src([ data.src.manifest + '*.json', pathToJSHTML+'scripts.html'])
        .pipe( $.revCollector({
            replaceReved: true
        }) )
        .pipe( gulp.dest( pathToJSHTML ) );
});
// ----------------------------------------------

gulp.task('webserver-reload', function () {
	browserSync.reload;
});


// Beautify css with CSSCOMB settings
gulp.task( 'pre-push-setting:css', function ()
{
	return gulp.src( './src/styles/400_html/**/*.less' )
		.pipe( $.csscomb() )
		.pipe( gulp.dest( './src/styles/400_html/' ) );
});

gulp.task( 'watch' , function ()
{
	$.watch([data.watch.less], function(event, cb) {
		gulp.start('LESS');
	});
	$.watch([data.watch.ts], function(event, cb) {
		gulp.start('TS');
	});
    $.watch([data.watch.html], function(event, cb) {
        gulp.start('HTML');
    });
});


gulp.task( '==== DANGEROUS =====', function ( event )
{
    return console.log('');
});
gulp.task( 'WIPE-ALL-BUILD-FOLDER', function ( event )
{
    return del( './build/assets/' );
});