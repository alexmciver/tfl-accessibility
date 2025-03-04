const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const del = require('del');

// File paths
const paths = {
  styles: {
    src: ['src/scss/**/*.scss', 'css/style.css'],
    dest: 'dist/css'
  },
  scripts: {
    src: ['js/**/*.js', '!js/vendor/**/*'],
    dest: 'dist/js'
  },
  images: {
    src: 'assets/images/**/*',
    dest: 'dist/assets/images'
  },
  html: {
    src: '*.html',
    dest: 'dist'
  }
};

// Clean dist folder
function clean() {
  return del(['dist']);
}

// Process SCSS and CSS files
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(concat('main.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Process JavaScript files
function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// Optimize images
function images() {
  return gulp.src(paths.images.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest));
}

// Copy HTML files
function html() {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// Set up development server
function serve() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  gulp.watch('src/scss/**/*.scss', styles);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.html.src, html).on('change', browserSync.reload);
  gulp.watch(paths.images.src, images);
}

// Initial SCSS folder structure
function createScssStructure() {
  return gulp.src('*.*', { read: false })
    .pipe(gulp.dest('src/scss/base'))
    .pipe(gulp.dest('src/scss/components'))
    .pipe(gulp.dest('src/scss/layouts'))
    .pipe(gulp.dest('src/scss/utils'));
}

// Create initial SCSS files
function createScssFiles() {
  const scssFiles = [
    'src/scss/main.scss',
    'src/scss/base/_reset.scss',
    'src/scss/base/_typography.scss',
    'src/scss/base/_variables.scss',
    'src/scss/components/_buttons.scss',
    'src/scss/components/_forms.scss',
    'src/scss/components/_navigation.scss',
    'src/scss/layouts/_header.scss',
    'src/scss/layouts/_footer.scss',
    'src/scss/layouts/_map.scss',
    'src/scss/utils/_mixins.scss',
    'src/scss/utils/_helpers.scss'
  ];

  const tasks = scssFiles.map(file => {
    return gulp.src('*.*', { read: false })
      .pipe(gulp.dest(file.substr(0, file.lastIndexOf('/'))));
  });

  return Promise.all(tasks);
}

// Convert existing CSS to SCSS
function convertCssToScss() {
  return gulp.src('css/style.css')
    .pipe(concat('_legacy.scss'))
    .pipe(gulp.dest('src/scss/base'));
}

// Setup task - creates initial structure
const setup = gulp.series(
  createScssStructure,
  createScssFiles,
  convertCssToScss
);

// Development task
const dev = gulp.series(clean, gulp.parallel(styles, scripts, images, html), serve);

// Build task
const build = gulp.series(clean, gulp.parallel(styles, scripts, images, html));

// Export tasks
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.html = html;
exports.setup = setup;
exports.serve = serve;
exports.build = build;
exports.default = dev; 