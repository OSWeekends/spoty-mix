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
            // transformRequest: function(obj) {
            //     var str = [];
            //     for(var p in obj)
            //     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            //     return str.join("&");
            // },
            dataType: 'json',
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