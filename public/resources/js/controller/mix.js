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
            console.log('VUELVEN COSAS');
            console.log(resp);
            $state.go('playlist', {playlistId: resp.data.playlistId, owner: resp.data.owner});
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