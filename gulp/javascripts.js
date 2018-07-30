
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
var config = require('./config.json')
 
gulp.task('javascripts', () =>
    gulp.src(config.paths.assets + '/javascripts/**')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.paths.public + '/javascripts/'))
);