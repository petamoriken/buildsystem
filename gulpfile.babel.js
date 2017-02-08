// polyfill
require("babel-polyfill");

const path = require("path");

// gulp
const gulp = require("gulp");
const $ = require("gulp-load-plugins")();

// postcss
const fetchPostcssConfig = require("postcss-load-plugins");

// browserify
const browserify = require("browserify");
const vueify = require("vueify");
const envify = require("envify/custom");

const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");

// notifier
const notifier = require("node-notifier")
function errorHandler(error) {
    console.log("bang!\n\n\n");
    notifier.notify({
        message: error.message,
        title: error.plugin,
        sound: "Glass"
    });
    this.emit("end");
}

// setting
if(!process.env.NODE_ENV) process.env.NODE_ENV = "development";
const target = process.env.NODE_ENV === "production" ? "release" : "debug";

const countries = ["ja", "en"];


// html_ja, html_en
for(const country of countries) {
    gulp.task(`html_${ country }`, () => {
        return gulp.src("src/pages/*/*.ejs")
            .pipe($.plumber(errorHandler))
            .pipe($.foreach((stream, file) => {
                const base = path.dirname(file.path);
                file.base = base;

                const data = require( path.join(base, `${ country }.json`) );
                if(!data.process) data.process = {};
                
                const env = data.process.env || (data.process.env = {});
                Object.assign(env, process.env, { LOCATION: country });

                return stream.pipe($.ejs(data, {ext: ".html"}));
            })).pipe(gulp.dest(`build/${ target }/${ country === "ja" ? "." : country }`));
    });
}

// html (ejs)
gulp.task("html", gulp.parallel( ...countries.map(val => `html_${ val }`) ));



// js_ja, js_en
for(const country of countries) {
    gulp.task(`js_${ country }`, async () => {
        const debug = target === "debug";

        // vueify config
        const postcssConfig = await fetchPostcssConfig();
        vueify.compiler.applyConfig({
            postcss: postcssConfig.plugins
        });

        return gulp.src("src/pages/*/js/*.js")
            .pipe($.plumber(errorHandler))
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
            .pipe(gulp.dest(`build/${ target }/${ country === "ja" ? "." : country }/js`));
    });
}

// js (vue)
gulp.task("js", gulp.parallel( ...countries.map(val => `js_${ val }`) ));



// css (postcss)
gulp.task("css", async () => {
    const postcssConfig = await fetchPostcssConfig();

    let stream = gulp.src("src/pages/*/css/*.css")  
        .pipe($.plumber(errorHandler))
        .pipe($.postcss(postcssConfig.plugins))
        .pipe($.flatten());
    
    for(const country of countries) {
        stream = stream.pipe(gulp.dest(`build/${ target }/${ country === "ja" ? "." : country }/css`));
    }

    return stream;
});



gulp.task("img", () => {
    let stream = gulp.src("src/img/**")
        .pipe($.plumber(errorHandler));

    for(const country of countries) {
        stream = stream.pipe(gulp.dest(`build/${ target }/${ country === "ja" ? "." : country }/img`));
    }

    return stream;
});



// watch
gulp.task("watch", () => {
    gulp.watch(["src/pages/*/*.ejs", "src/pages/*/*.json"], gulp.parallel("html"));
    gulp.watch(["src/pages/*/js/*.js", "src/components/*.vue"], gulp.parallel("js"));
    gulp.watch(["src/base/*.css", "src/setting/*.css", "src/pages/*/css/*.css"], gulp.parallel("css"));
    gulp.watch(["src/img/**"], gulp.parallel("img"));
});



// all build
gulp.task("default", gulp.parallel("html", "js", "css", "img"));