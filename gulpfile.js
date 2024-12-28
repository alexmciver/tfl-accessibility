const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();

// File paths
const paths = {
    styles: {
        src: 'src/scss/**/*.scss',
        dest: 'dist/css'
    },
    scripts: {
        src: 'src/js/**/*.js',
        dest: 'dist/js'
    },
    html: {
        src: 'public/**/*.html',
        dest: 'dist'
    },
    assets: {
        src: 'src/assets/**/*',
        dest: 'dist/assets'
    },
    data: {
        src: 'src/data/**/*',
        dest: 'dist/data'
    }
};

// CSS task
function styles() {
    return gulp.src('src/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

// JavaScript task
function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(terser())
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.stream());
}

// Watch files
function watch() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.html.src).on('change', browserSync.reload);
}

// Export tasks
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.default = gulp.series(
    gulp.parallel(styles, scripts),
    watch
); 