var gulp = require ('gulp')
	uglify = require ('gulp-uglify')
	jshint = require ('gulp-jshint')
	rename = require ('gulp-rename')
	concat = require ('gulp-concat')
	cached = require ('gulp-cached')
	less = require ('gulp-less')
	notify = require ('gulp-notify')
	plumber - require ('gulp-plumber')
	livereload = require('gulp-livereload')
	cssmin = require('gulp-minify-css')
    cssver = require('gulp-make-css-url-version')
    imgmin = require('gulp-imagemin')
    pngquant = require('imagemin-pngquant')
    cache = require('gulp-cache')
    htmlmin = require('gulp-htmlmin')
    rev = require('gulp-rev-append')
    autoprefixer = require('gulp-autoprefixer')
    sass = require('gulp-sass')
    rubysass = require('gulp-ruby-sass')
    webpack = require('gulp-webpack')
    named = require('vinyl-named')

gulp.task('testrubysass', function () {
    return gulp.src('./src/**/*.scss')
        .pipe(rubysass({sourcemap: true, sourcemapPath: '../scss'}))
        .on('error', function (err) { console.log(err.message); })
        .pipe(gulp.dest('src/css'))
        .pipw(livereload())
})

gulp.task('testLess', function () {
    gulp.src('./src/**/*.less')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(less())
        .pipe(gulp.dest('src/css'))
        .pipw(livereload())
})

gulp.task('testCssmin', function () {
    gulp.src('src/css/*.css')
    		.pipe(cssver())
        .pipe(cssmin({
            advanced: false
            compatibility: 'ie7'式，'*'：
            keepBreaks: true
            keepSpecialComments: '*'
        }))
    		.pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/css'))
})

gulp.task('testImagemin', function () {
    gulp.src('src/img/*.{png,jpg,gif,ico}')
        .pipe(cache(imagemin({
            progressive: true
            interlaced: true
            multipass: true
            svgoPlugins: [{removeViewBox: false}]
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'))
})

gulp.task('testHtmlmin', function () {
    var options = {
        removeComments: true
        collapseWhitespace: true
        collapseBooleanAttributes: true
        removeEmptyAttributes: true
        removeScriptTypeAttributes: true
        removeStyleLinkTypeAttributes: true
        minifyJS: true
        minifyCSS: true
    };
    gulp.src('src/html/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist/html'))
})

gulp.task('jsmin', function () {
    gulp.src(['src/js/*.js', '!src/js/**/{test1,test2}.js'])
        .pipe(jshint())
      	.pipe(jshint.reporter('default'))
        .pipe(uglify({
            mangle: {except: ['require' ,'exports' ,'module' ,'$']}
        }))
        .pipe(concat('all.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/js'))
})

gulp.task('testRev', function () {
    gulp.src('src/html/index.html')
        .pipe(rev())
        .pipe(gulp.dest('dist/html'))
})

gulp.task('testAutoFx', function () {
    gulp.src('src/css/index.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0']
            cascade: true
            remove:true
        }))
        .pipe(gulp.dest('dist/css'))
})

gulp.task('jshint', function () {
	gulp.src(inFile)
			.pipe(cached('jshint'))
			.pipe(jshint())
			.pipe(jshint.reporter('default'))
})

var appList = ['main']

gulp.task('default', ['bundle'], function() {
  console.log('done')
})

gulp.task('bundle', function() {
  return gulp.src(mapFiles(appList, 'js'))
    .pipe(named())
    .pipe(webpack(getConfig()))
    .pipe(gulp.dest('dist/'))
})

gulp.task('watch', function() {
  return gulp.src(mapFiles(appList, 'js'))
    .pipe(named())
    .pipe(webpack(getConfig({watch: true})))
    .pipe(gulp.dest('dist/'))
})

/**
 * @private
 */
function getConfig(opt) {
  var config = {
    module: {
      loaders: [
        { test: /\.vue$/, loader: 'vue'}
      ]
    },
    devtool: 'source-map'
  }
  if (!opt) {
    return config
  }
  for (var i in opt) {
    config[i] = opt[i]
  }
  return config
}

/**
 * @private
 */
function mapFiles(list, extname) {
  return list.map(function (app) {return 'src/' + app + '.' + extname})
}

var inFile = './src/js/*.js'
var outPut = './dist/'
gulp.task('testwatch', function () {
	livereload.listen()
	gulp.watch(inFile, ['jshint'])
	gulp.watch('src/**/*.less', ['testLess'])
})

gulp.task('default', ['jshint',  'testLess', 'testwatch'])
