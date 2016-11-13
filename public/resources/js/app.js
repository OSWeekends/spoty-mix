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
            url: "/playlist",
            templateUrl: "/templates/playlist"
        });
});


app.controller('userController', function(){
    var self = this;

    self.friend = '';

    var json = {
        user: self.friend
    }

    self.search = function() {
        api.post('/users', json, function(data, status) {
            console.log(status);
            console.log(data);
        });
    }

    $('nav a').removeClass('active');
    $('nav a:nth-child(1)').addClass('active');
});


app.controller('playlistController', function($sce){
    var self = this;

    var array = [
        '3rgsDhGHZxZ9sB9DQWQfuf',
        '0Vib1QAMtMaiywa3QSEq40'
    ];
    var rand = array[Math.floor(Math.random() * array.length)];

    // $scope.trustSrc = function(src) {
       self.player = $sce.trustAsResourceUrl('https://embed.spotify.com/?uri=spotify:user:spotify:playlist:' + rand);
    // }

    // self.player = 'https://embed.spotify.com/?uri=spotify:user:spotify:playlist:' + rand;
    
});


app.controller('mixController', function($state, api){
    var self = this;

    self.items = [];
    self.mix = [];

    self.list = function(object) {
        var playlistId = object.id;
        if($('#list-' + playlistId).hasClass('active')) {
            self.removeList(object);
        } else {
            self.addList(object);
        }
    }

    self.addList = function(object) {
        var playlistId = object.id;
        $('#list-' + playlistId).addClass('active');
        $('#list-' + playlistId + ' .icon-add').hide();
        $('#list-' + playlistId + ' .icon-rem').show();

        self.mix.push(object);
    }

    self.removeList = function(object) {
        var playlistId = object.id;
        $('#list-' + playlistId).removeClass('active');
        $('#list-' + playlistId + ' .icon-add').show();
        $('#list-' + playlistId + ' .icon-rem').hide();
        
        var index = self.mix.indexOf(object);
        self.mix = self.mix.splice(index, 1);
    }

    self.sendMix = function() {
        var obj = {playlists: self.mix};
        api.post('/api/playlists', obj, function(resp) {
            console.log(resp);
            $state.go('playlist');
        });
    }

    $('nav a').removeClass('active');
    $('nav a:nth-child(2)').addClass('active');

    api.get('/api/playlists', function(data, status) {
        console.log(status);
        console.log(data);
        self.items = data.data;
    });

});


app.factory("api", function($http) {

    var api = {
        url: 'http://localhost:8080',
        get: get,
        post: post,
        del: del,
        put: put
    };

    return api;

    function get(url, callback) {
        $http({
            method: 'GET',
            url: url,
        }).success(function(data, status, headers, config) {
            if(typeof(callback) != 'undefined') {
                callback(data, status, headers, config);
            }
        }).error(function(data, status, headers, config) {
            console.error('Error in HTTP POST request');
            if(typeof(callback) != 'undefined') {
                callback(data, status, headers, config);
            }
        });
    }

    function post(url, data, callback) {

        $http({
            method: 'POST',
            url: url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            // dataType: 'jsonp',
            data: data
        }).success(function(data, status, headers, config) {
            if(typeof(callback) != 'undefined') {
                callback(data, status, headers, config);
            }
        }).error(function(data, status, headers, config) {
            console.error('Error in HTTP POST request');
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
            if(typeof(callback) != 'undefined') {
                callback(data, status, headers, config);
            }
        });
    }

    function del(url, data, callback) {

        $http({
            method: 'DELETE',
            url: url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            // dataType: 'jsonp',
            data: data
        }).success(function(data, status, headers, config) {
            if(typeof(callback) != 'undefined') {
                callback(data, status, headers, config);
            }
        }).error(function(data, status, headers, config) {
            console.error('Error in HTTP POST request');
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
            if(typeof(callback) != 'undefined') {
                callback(data, status, headers, config);
            }
        });
    }

    function put(url, data, callback) {

        $http({
            method: 'PUT',
            url: url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            // dataType: 'jsonp',
            data: data
        }).success(function(data, status, headers, config) {
            if(typeof(callback) != 'undefined') {
                callback(data, status, headers, config);
            }
        }).error(function(data, status, headers, config) {
            console.error('Error in HTTP POST request');
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
            if(typeof(callback) != 'undefined') {
                callback(data, status, headers, config);
            }
        });
    }

});
