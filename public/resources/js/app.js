var app = angular.module('login', ['ui-router']);


app.config(function($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/home");
    //
    // Now set up the states
    $stateProvider
        .state('home', {
            url: "/home",
            templateUrl: "/templates/home",
            controller: 'homeController'
        });
});


app.controller('homeController', function($scope){
    var self = this;

    self.friend = '';
});