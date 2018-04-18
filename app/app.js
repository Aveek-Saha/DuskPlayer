angular.module('Player', [
    'ngRoute',
    'Player.player',
    'angular-siri-wave'
  ])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .otherwise({redirectTo: '/player'})
  }])