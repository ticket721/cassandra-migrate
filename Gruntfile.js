module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['build'],
        jshint: {
            files: ['Gruntfile.js', 'index.js', 'bin/*.js'],
            options: {
                proto: true,
                //undef: true,
                //unused: true,
                // options here to override JSHint defaults
                globals: {
                    console: true,
                    module: true,
                    require: true,
                    exports: true,
                    describe: true,
                    should: true,
                    it: true,
                    before: true,
                    after: true,
                    beforeEach: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('js', ['clean', 'jshint']);
    grunt.registerTask('default',['clean', 'jshint']);
};
