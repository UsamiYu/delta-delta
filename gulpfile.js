"use strict"

var gulp = require("gulp"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify");

gulp.task("concat", function(){
    gulp.src([
        "lib/tmlib.js",
        "lib/bulletml.min.js",
        "src/scripts/custom.tmlib.bulletml.js",
        "src/scripts/param.js",
        "src/scripts/dsl.actionpattern.js",
        "src/scripts/dsl.danmaku.js",
        "src/scripts/enemy.js",
        "src/scripts/player.js",
        "src/scripts/scene.js",
        "src/scripts/ui.js",
        "src/scripts/main.js"
    ])
        .pipe(concat("app.js"))
        .pipe(gulp.dest("dest/"));
});

gulp.task("minify", function(){
    gulp.src("dest/app.js")
        .pipe(uglify())
        .pipe(gulp.dest("dest/"));
});

gulp.task("default", function(){
    console.log("Hello, gulp!");
});
