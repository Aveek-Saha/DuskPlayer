angular.module('Player', [
    'ngRoute',
    'Player.player'
  ])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .otherwise({redirectTo: '/player'})
  }])