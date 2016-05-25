const gulp = require("gulp");
const babel = require("gulp-babel");

gulp.task("compile", function() {
  gulp
    .src("src/**.js")
    .pipe(babel({presets: ["es2015"]}))
    .pipe(gulp.dest("lib"));
});

gulp.task("watch", function() {
  gulp.watch("src/**.js", ["compile"]);
});

gulp.task("default", ["compile", "watch"]);
