app.controller('playlistController', function($stateParams, $sce){
    var self = this;

    console.log($stateParams.playlistId);

    var array = [
        '3rgsDhGHZxZ9sB9DQWQfuf',
        '0Vib1QAMtMaiywa3QSEq40'
    ];
    var rand = $stateParams.playlistId || array[Math.floor(Math.random() * array.length)];

    // $scope.trustSrc = function(src) {
       self.player = $sce.trustAsResourceUrl('https://embed.spotify.com/?uri=spotify:user:' + $stateParams.owner + ':playlist:' + rand);
    // }

    // self.player = 'https://embed.spotify.com/?uri=spotify:user:spotify:playlist:' + rand;
    
});
