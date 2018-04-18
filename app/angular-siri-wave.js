(function (angular) {

    'use strict';

    var app = angular.module('angular-siri-wave', []);

    app.directive('siriWave', ['$window', function ($window) {
        return {
            restrict: 'E',
            scope: {
                width:                          '@',
                height:                         '@',
                ratio:                          '@',
                speed:                          '@',
                frequency:                      '@',
                amplitude:                      '@',
                speedInterpolationSpeed:        '@',
                amplitudeInterpolationSpeed:    '@',
                color:                          '@'
            },
            compile: function (element, attr) {
                return function (scope, element, attr) {
                    var updateWave = function() {
                        if (!scope.SW) {
                            scope.SW = new SiriWave({
                                width: scope.width || ((($window.innerWidth < $window.innerHeight) ? $window.innerWidth : $window.innerHeight) / 2),
                                height: scope.height || scope.width,
                                ratio: scope.ratio || window.devicePixelRatio || 1,
                                speed: scope.speed || 0.025,
                                frequency: scope.frequency || 6.0,
                                amplitude: scope.amplitude || 1.0,
                                speedInterpolationSpeed: scope.speedInterpolationSpeed || 0.005,
                                amplitudeInterpolationSpeed: scope.amplitudeInterpolationSpeed || 0.05,
                                color: scope.color || '#ffffff',
                                container: element[0]
                            });

                            scope.SW.start();
                        }
                        else {
                            scope.SW.setAmplitude(scope.amplitude);
                        }
                    }

                    scope.$watchCollection('[amplitude]', updateWave);
                    updateWave();
                };
            }
        };
    }]);

})(window.angular);
