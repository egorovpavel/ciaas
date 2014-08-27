module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            development: {
                options: {
                    paths: ["./assets/src/less", "./assets/src/bower_components/bootstrap/less"],
                    yuicompress: true
                },
                files: {
                    "./assets/dist/css/style.css": "./assets/src/less/style.less"
                }
            }
        },
        watch: {
            files: "./assets/src/less/*",
            tasks: ["less"]
        }
    });
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['less', 'watch']);
};
