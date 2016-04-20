/* eslint strict: [2, "global"] */
'use strict';

var fs      = require('fs');
var gulp    = require('gulp');
var $       = require('gulp-load-plugins')();

$.merge = require('merge-stream');

gulp.task('docs', function docs() {
    var streams = $.merge();
    var options = {
        private: false,
        'heading-depth': 3,
        templateSrc: fs.readFileSync('../templates/api.hbs', 'utf8')
    };
    var apiDocs = {
        'api/CLIENT.md': {
            src: '../src/**/!(*.server.js)',
            className: 'CustomProtocol'
        },
        'api/SERVER.md': {
            src: '../src/**/!(*.client.js)',
            className: 'CustomProtocol'
        },
        'api/DYNAMIC_MESSAGES_PROTOCOL.md': {
            src: '../src/utils/DynamicMessagesProtocol.js',
            className: 'DynamicMessagesProtocol'
        }
    };

    function error(err) {
        $.util.log('jsdoc2md failed:', err.message);
    }

    Object.keys(apiDocs).forEach(function generateApiDoc(doc) {
        var runOptions = { private: options.private, 'heading-depth': options['heading-depth'] };

        runOptions.template = options.templateSrc.replace('!_class_!', apiDocs[doc].className);
        streams.add(gulp.src(apiDocs[doc].src)
            .pipe($.concat(doc))
            .pipe($.jsdocToMarkdown(runOptions))
            .on('error', error)
            .pipe(gulp.dest('..')));
    });

    return streams;
});

gulp.task('watch', function watch() {
    gulp.watch('../**/*.{js,hbs}', ['docs']);
});
