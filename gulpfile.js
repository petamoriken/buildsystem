const path = require("path");

const gulp = require("gulp");
const $ = require("gulp-load-plugins")();

const target = process.env.NODE_ENV || "development";

// ejs
{
    const counties = ["ja", "en"];

    gulp.task("ejs", counties.map(val => `ejs_${ val }`));

    // ejs_ja, ejs_en
    for(const country of counties) {
        gulp.task(`ejs_${ country }`, () => {
            return gulp.src("src/pages/**/*.ejs")
                .pipe($.foreach((stream, file) => {
                    const base = path.join(file.path, "../");
                    file.base = base;

                    const data = require( path.join(base, `${ country }.json`) );
                    data.lang = country;

                    return stream.pipe($.ejs(data, {ext: ".html"}));
                })).pipe(gulp.dest(`build/${ target }/${ country === "ja" ? "" : country + "/" }`));
        });
    }
}