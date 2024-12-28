import gulp from 'gulp';
import sass from 'gulp-sass';
import * as dartSass from 'sass';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import terser from 'gulp-terser';
import concat from 'gulp-concat';
import browserSync from 'browser-sync';

const sassCompiler = sass(dartSass);
const bs = browserSync.create();

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
        .pipe(sassCompiler().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(bs.stream());
}

// JavaScript task
function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(terser())
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(bs.stream());
}

// Watch files
function watch() {
    bs.init({
        server: {
            baseDir: './'
        }
    });
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.html.src).on('change', bs.reload);
}

// Export tasks
export { styles, scripts, watch };
export default gulp.series(
    gulp.parallel(styles, scripts),
    watch
); 