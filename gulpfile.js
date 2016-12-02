const path = require("path");

const gulp = require("gulp");
const $ = require("gulp-load-plugins")();

gulp.task("ejs", ["ejs_ja", "ejs_en"]);

gulp.task("ejs_ja", function() {
    return gulp.src("src/pages/**/*.ejs")
        .pipe($.foreach((stream, file) => {
            const base = path.join(file.path, "../");
            file.base = base;

            const data = require( path.join(base, "ja.json") );
            data.lang = "ja";

            return stream.pipe($.ejs(data, {ext: ".html"}))
        })).pipe(gulp.dest("build/"));
});

gulp.task("ejs_en", function() {
    return gulp.src("src/pages/**/*.ejs")
        .pipe($.foreach((stream, file) => {
            const base = path.join(file.path, "../");
            file.base = base;

            const data = require( path.join(base, "en.json") );
            data.lang = "en";

            return stream.pipe($.ejs(data, {ext: ".html"}))
        })).pipe(gulp.dest("build/en/"));
});