const {dest, src, series} = require("gulp");
const {deleteSync} = require('del');

function clean(cb) {
    deleteSync('dist/**/*');
    cb();
}

function css() {
    const postcss = require('gulp-postcss')
    const sourcemaps = require('gulp-sourcemaps')
    const {plugins} = require('./postcss.config.js')

    return src('front/**/*.css', {"base": "front"})
        .pipe(sourcemaps.init())
        .pipe(postcss(plugins))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/'))
}

function copy() {
    return src('front/**/*', {"base": "front"})
        .pipe(dest('dist/'));
}

exports.default = series(clean, copy, css);
