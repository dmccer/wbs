var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('src-babel', function() {
  return gulp
    .src(['src/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('built/src'));
});

gulp.task('test-babel', function() {
  return gulp
    .src(['test/src/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('built/test'));
});

gulp.task('config', function() {
  return gulp
    .src(['./config.js', './db.js'])
    .pipe(gulp.dest('built/'));
});

gulp.task('watch', ['default'], function() {
  gulp.watch(['./config.js', './db.js'], ['config']);
  gulp.watch(['src/**/*.js'], ['src-babel']);
  gulp.watch(['test/src/**/*.js'], ['test-babel']);
});

gulp.task('default', ['config', 'src-babel', 'test-babel']);
