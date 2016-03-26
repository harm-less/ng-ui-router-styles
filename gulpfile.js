//==============//
// DEPENDENCIES //
//==============//

// Local dependencies.
var pkg = require('./package.json');

// Node dependencies.
var fs = require('fs');

// Third-party dependencies.
var del = require('del');
var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var ngAnnotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');
var header = require('gulp-header');
var runSequence = require('run-sequence');
var KarmaServer = require('karma').Server;
var htmlmin = require('gulp-htmlmin');
var jshint = require('gulp-jshint');
var serverFactory = require('spa-server');


//=========//
// GLOBALS //
//=========//


//=======//
// CLEAN //
//=======//

gulp.task('clean', function (callback) {
  return del('dist');
});


//=======//
// BUILD //
//=======//

gulp.task('build', function (done) {
  runSequence('clean', ['build:scripts'], done);
});


gulp.task('build:scripts', function () {
  var headerContent = fs.readFileSync('src/scripts/header.js', 'utf8');
  return gulp
    .src([
      './src/scripts/module.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('betsol-ng-ui-router-styles.js'))
    .pipe(ngAnnotate({
      'single_quotes': true
    }))
    .pipe(header(headerContent, { pkg : pkg } ))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(uglify())
    .pipe(header(headerContent, { pkg : pkg } ))
    .pipe(rename('betsol-ng-ui-router-styles.min.js'))
    .pipe(gulp.dest('dist/scripts'))
    .on('error', gutil.log)
  ;
});


//=======//
// TESTS //
//=======//

gulp.task('test', function (done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('test:e2e:server', function () {
  var server = serverFactory.create({
    path: './test/e2e',
    port: 1337
  });
  server.start();
});


//==============//
// DEFAULT TASK //
//==============//

gulp.task('default', function (done) {
  runSequence('build', done);
});
