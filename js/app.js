// angular.module is a global place for creating, registering and retrieving Angular modules
// 'directory' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'directory.services' is found in services.js
// 'directory.controllers' is found in controllers.js
var app = angular.module('directory', ['ionic','LocalStorageModule','loader.services','directory.services', 'directory.controllers','post.services'])


    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: z
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            .state('employee-start', {
                url: '/start',
                templateUrl: 'templates/app-start.html',
                controller: 'StartCtrl'
            })

            .state('employee-list', {
                url: '/documents',
                templateUrl: 'templates/document-list.html',
                controller: 'EmployeeListCtrl'
            })

            .state('employee-detail', {
                url: '/document/:employeeId/:postCat',
                templateUrl: 'templates/document-detail.html',
                controller: 'EmployeeDetailCtrl'
            })

            .state('pages', {
                url: '/pages/:pageId',
                templateUrl: 'templates/page.html',
                controller: 'PageCtrl'
            })

            .state('favorites', {
                url: '/favorites',
                templateUrl: 'templates/favorites.html',
                controller: 'FavListCtrl'
            });

        // if none of the above states are matched, use this as the fallback
        //$urlRouterProvider.otherwise('/employees');
        $urlRouterProvider.otherwise('/start');

    });

app.directive('div', function($routeParams,$location) {
  return {
    restrict: 'E',
    link: function(scope, element, attrs){ 
      
        if ($location.path().substring(1) == attrs.id) {
          setTimeout(function() {
             window.scrollTo(0, element[0].offsetTop);
          },1);        
        }
    }
  };
});