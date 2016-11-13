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
        });
});


app.controller('navController', function(menu){
    var self = this;

    console.log(menu.active);
    self.menu = menu;
    self.active = menu.active;
    self.state = function() {
        console.log($state.current.name);
        return $state.current.name;
    }

});


app.controller('userController', function(menu){
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


app.controller('mixController', function(api, menu){
    var self = this;

    self.lists = [];
    self.items = [ {
    "collaborative": false,
    "external_urls": {
      "spotify": "http://open.spotify.com/user/wizzler/playlists/53Y8wT46QIMz5H4WQ8O22c"
    },
    "href": "https://api.spotify.com/v1/users/wizzler/playlists/53Y8wT46QIMz5H4WQ8O22c",
    "id": "53Y8wT46QIMz5H4WQ8O22c",
    "images" : [ ],
    "name": "Wizzlers Big Playlist",
    "owner": {
      "external_urls": {
        "spotify": "http://open.spotify.com/user/wizzler"
      },
      "href": "https://api.spotify.com/v1/users/wizzler",
      "id": "wizzler",
      "type": "user",
      "uri": "spotify:user:wizzler"
    },
    "public": true,
    "snapshot_id" : "bNLWdmhh+HDsbHzhckXeDC0uyKyg4FjPI/KEsKjAE526usnz2LxwgyBoMShVL+z+",
    "tracks": {
      "href": "https://api.spotify.com/v1/users/wizzler/playlists/53Y8wT46QIMz5H4WQ8O22c/tracks",
      "total": 30
    },
    "type": "playlist",
    "uri": "spotify:user:wizzler:playlist:53Y8wT46QIMz5H4WQ8O22c"
  }, {
    "collaborative": false,
    "external_urls": {
      "spotify": "http://open.spotify.com/user/wizzlersmate/playlists/1AVZz0mBuGbCEoNRQdYQju"
    },
    "href": "https://api.spotify.com/v1/users/wizzlersmate/playlists/1AVZz0mBuGbCEoNRQdYQju",
    "id": "1AVZz0mBuGbCEoNRQdYQju",
    "images" : [ ],
    "name": "Another Playlist",
    "owner": {
      "external_urls": {
        "spotify": "http://open.spotify.com/user/wizzlersmate"
      },
      "href": "https://api.spotify.com/v1/users/wizzlersmate",
      "id": "wizzlersmate",
      "type": "user",
      "uri": "spotify:user:wizzlersmate"
    },
    "public": true,
    "snapshot_id" : "Y0qg/IT5T02DKpw4uQKc/9RUrqQJ07hbTKyEeDRPOo9LU0g0icBrIXwVkHfQZ/aD",
    "tracks": {
      "href": "https://api.spotify.com/v1/users/wizzlersmate/playlists/1AVZz0mBuGbCEoNRQdYQju/tracks",
      "total": 58
    },
    "type": "playlist",
    "uri": "spotify:user:wizzlersmate:playlist:1AVZz0mBuGbCEoNRQdYQju"
  } ];

    self.addList = function(playlistId) {
        api.put('/playlists/' + playlistId, function(data, status) {
            console.log(status);
            console.log(data);
            self.lists = data;
        });
    }

    self.removeList = function(playlistId) {
        api.delete('/playlists/' + playlistId, function(data, status) {
            console.log(status);
            console.log(data);
            self.lists = data;
        });
    }

    $('nav a').removeClass('active');
    $('nav a:nth-child(2)').addClass('active');

    api.get('/playlists', function(data, status) {
        console.log(status);
        console.log(data);
        self.lists = data;
    });

});


app.factory("menu", function() {
    var menu = {
        active: 'user'
    };

    return menu;
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
