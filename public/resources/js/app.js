var app = angular.module('spotymix', ['ui.router']);


app.config(function($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/user");
    //
    // Now set up the states
    $stateProvider
        .state('user', {
            url: "/user",
            templateUrl: "/templates/home",
            controller: 'userController'
        })
        .state('mix', {
            url: "/mix",
            templateUrl: "/templates/mix",
            controller: 'mixController'
        })
        .state('playlist', {
            url: "/playlist/:playlistId/:owner",
            templateUrl: "/templates/playlist"
        });
});
