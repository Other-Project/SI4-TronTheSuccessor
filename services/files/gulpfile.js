import {deleteSync} from "del";
import {dest, series, src} from "gulp";
import postcss from "gulp-postcss";
import sourcemaps from "gulp-sourcemaps";
import * as postcssConfig from "./postcss.config.js";

function clean(cb) {
    deleteSync("dist/**/*");
    cb();
}

function css() {

    return src("front/**/*.css", {"base": "front"})
        .pipe(sourcemaps.init())
        .pipe(postcss(postcssConfig.plugins))
        .pipe(sourcemaps.write("."))
        .pipe(dest("dist/"));
}

function copy() {
    return src("front/**/*", {"base": "front"})
        .pipe(dest("dist/"));
}

const defaultTask = series(clean, copy, css);
export {
    defaultTask as default,
    clean as clean,
    copy as copy,
    css as css
};
