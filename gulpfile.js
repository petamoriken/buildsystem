const path = require("path");

const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");

const gulp = require("gulp");
const $ = require("gulp-load-plugins")();

const browserify = require("browserify");
const vueify = require("vueify");
const envify = require("envify/custom");

if(!process.env.NODE_ENV) process.env.NODE_ENV = "development";

const target = process.env.NODE_ENV === "production" ? "release" : "debug";
const countries = ["ja", "en"];


// html_ja, html_en
for(const country of countries) {
    gulp.task(`html_${ country }`, () => {
        return gulp.src("src/pages/**/*.ejs")
            .pipe($.foreach((stream, file) => {
                const base = path.dirname(file.path);
                file.base = base;

                const data = require( path.join(base, `${ country }.json`) );
                if(!data.process) data.process = {};
                
                const env = data.process.env || (data.process.env = {});
                Object.assign(env, process.env, { LOCATION: country });

                return stream.pipe($.ejs(data, {ext: ".html"}));
            })).pipe(gulp.dest(`build/${ target }/${ country === "ja" ? "" : country + "/" }`));
    });
}

// html (ejs)
gulp.task("html", gulp.parallel( ...countries.map(val => `html_${ val }`) ));


// js_ja, js_en
for(const country of countries) {
    gulp.task(`js_${ country }`, () => {
        const debug = target === "debug";

        return gulp.src("src/pages/*/js/*.js")
            .pipe($.foreach((stream, file) => {
                const filePath = file.path;

                return browserify(filePath, debug ? { debug: true } : {})
                    .transform(vueify)
                    .transform(envify({
                        LOCATION: country
                    })).bundle()
                    .pipe(source(path.basename(filePath)))
                    .pipe(buffer());
            })).pipe($.if( debug, $.sourcemaps.init({ loadMaps: true }) ))
            .pipe($.uglify({ compress: true }))
            .pipe($.optimizeJs())
            .pipe($.if( debug, $.sourcemaps.write("./") ))
            .pipe(gulp.dest(`build/${ target }/${ country === "ja" ? "" : country + "/" }/js/`));
    });
}

// js (vue)
gulp.task("js", gulp.parallel( ...countries.map(val => `js_${ val }`) ));


// all build
gulp.task("default", gulp.parallel("html", "js"));