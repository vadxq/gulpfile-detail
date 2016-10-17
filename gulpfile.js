var gulp = require ('gulp')
		uglify = require ('gulp-uglify')//使用gulp-uglify压缩javascript文件，减小文件大小
		jshint = require ('gulp-jshint')
		rename = require ('gulp-rename')// 重命名
		concat = require ('gulp-concat')//合并指定名使用gulp-concat合并javascript文件，减少网络请求。
		cached = require ('gulp-cached')//当前修改的文件检测结果
		less = require ('gulp-less')
		notify = require ('gulp-notify')//当发生异常时提示错误 确保本地安装gulp-notify和gulp-plumber
		plumber - require ('gulp-plumber')
		livereload = require('gulp-livereload')// 文件修改浏览器刷新
		cssmin = require('gulp-minify-css')
    cssver = require('gulp-make-css-url-version')//确保已本地安装gulp-make-css-url-version [cnpm install gulp-make-css-url-version --save-dev]
    imgmin = require('gulp-imagemin')//压缩图片文件（包括PNG、JPEG、GIF和SVG图片）
    pngquant = require('imagemin-pngquant')
    //确保本地已安装gulp-cache [cnpm install gulp-cache --save-dev]
    cache = require('gulp-cache')//只压缩修改的图片
    htmlmin = require('gulp-htmlmin')//使用gulp-htmlmin压缩html，可以压缩页面javascript、css，去除页面空格、注释，删除多余属性等操作。
    rev = require('gulp-rev-append')//使用gulp-rev-append给页面的引用添加版本号，清除页面引用缓存
    autoprefixer = require('gulp-autoprefixer')//使用gulp-autoprefixer根据设置浏览器版本自动处理浏览器前缀。使用她我们可以很潇洒地写代码，不必考虑各浏览器兼容前缀。【特别是开发移动端页面时，就能充分体现它的优势。例如兼容性不太好的flex布局。】
    sass = require('gulp-sass')
    rubysass = require('gulp-ruby-sass')
    webpack = require('gulp-webpack')//vue webpack
    named = require('vinyl-named')

//sass是编写css的一套语法。 使用它的预处理器可以将sass语法的css处理成css格式
gulp.task('testrubysass', function () {
    return gulp.src('./src/**/*.scss')
        .pipe(rubysass({sourcemap: true, sourcemapPath: '../scss'}))
        .on('error', function (err) { console.log(err.message); })
        .pipe(gulp.dest('src/css'))
        .pipw(livereload())
})

// less 含livereload
gulp.task('testLess', function () {
    gulp.src('./src/**/*.less')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(less())
        .pipe(gulp.dest('src/css'))
        .pipw(livereload())
})

// minify-css
gulp.task('testCssmin', function () {
    gulp.src('src/css/*.css')
    		.pipe(cssver()) //给css文件里引用文件加版本号（文件MD5）
        .pipe(cssmin({
            advanced: false//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie7'//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: true//类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
    		.pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/css'))
})

//压缩图片文件（包括PNG、JPEG、GIF和SVG图片）
gulp.task('testImagemin', function () {
    gulp.src('src/img/*.{png,jpg,gif,ico}')
        .pipe(cache(imagemin({
        	// optimizationLevel: 5 //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true//类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
            svgoPlugins: [{removeViewBox: false}]//不要移除svg的viewbox属性
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        })))
        .pipe(gulp.dest('dist/img'))
})

// 使用gulp-htmlmin压缩html，可以压缩页面javascript、css，去除页面空格、注释，删除多余属性等操作。
gulp.task('testHtmlmin', function () {
    var options = {
        removeComments: true//清除HTML注释
        collapseWhitespace: true//压缩HTML
        collapseBooleanAttributes: true//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true//删除<style>和<link>的type="text/css"
        minifyJS: true//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    gulp.src('src/html/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist/html'))
})

// 压缩-合并-重命名-输出~JS代码
gulp.task('jsmin', function () {
		// 压缩src/js目录下的所有js文件
    //除了test1.js和test2.js（**匹配src/js的0个或多个子文件夹）
    gulp.src(['src/js/*.js', '!src/js/**/{test1,test2}.js'])
        .pipe(jshint())
      	.pipe(jshint.reporter('default'))
        .pipe(uglify({
        		//mangle: true,//类型：Boolean 默认：true 是否修改变量名
        		//preserveComments: 'all' //保留所有注释
        		//compress: true,//类型：Boolean 默认：true 是否完全压缩
            mangle: {except: ['require' ,'exports' ,'module' ,'$']}//排除混淆关键字
        }))
        .pipe(concat('all.js'))//合并后的文件名
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/js'))
})

//给页面引用url添加版本号，以清除页面缓存
gulp.task('testRev', function () {
    gulp.src('src/html/index.html')
        .pipe(rev())
        .pipe(gulp.dest('dist/html'))
})

//使用gulp-autoprefixer根据设置浏览器版本自动处理浏览器前缀。使用她我们可以很潇洒地写代码，不必考虑各浏览器兼容前缀。
//【特别是开发移动端页面时，就能充分体现它的优势。例如兼容性不太好的flex布局。】
gulp.task('testAutoFx', function () {
    gulp.src('src/css/index.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0']
            cascade: true//是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest('dist/css'))
})

// 当前修改的文件检测结果。
gulp.task('jshint', function () {
	gulp.src(inFile)
			.pipe(cached('jshint'))
			.pipe(jshint())
			.pipe(jshint.reporter('default'))
})

// vue webpack
// gulp.task('testwebpack', function() {
//   return gulp.src('src/entry.js')
//     .pipe(webpack({
//       entry: {
//         app: 'src/app.js',
//         test: 'test/test.js'
//       },
//       output: {
//         filename: '[name].js'
//       }
//     }))
//     .pipe(gulp.dest('dist/'))
// })
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

//watch
var inFile = './src/js/*.js'
var outPut = './dist/'
gulp.task('testwatch', function () {
	livereload.listen()
	gulp.watch(inFile, ['jshint'])
	gulp.watch('src/**/*.less', ['testLess'])
})

gulp.task('default', ['jshint',  'testLess', 'testwatch'])
