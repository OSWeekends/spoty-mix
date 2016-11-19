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
