angular.module('directory.controllers', ['LocalStorageModule','ionic'])

    
    .controller('StartCtrl', function ($scope, $ionicModal, PostService, localStorageService, $location){

        $scope.validation = true;
        
       /* document.addEventListener("deviceready", onDeviceReady, false);

        function onDeviceReady() {
            
            if(checkConnection() != false){
                //$(".test").append("<li>INITIATE</li>");
                alert("Device is ready and online!");
            }else{
                alert("Device is offline.");
            }
        }

        function checkConnection() {
            var networkState = navigator.connection.type;
            if(networkState == "none") {
                return false;
            }
            return true;
        }*/

        var lastUpdatedLocal = localStorageService.get('modified');
        var current_time = new Date().getTime();

        if(lastUpdatedLocal){
            PostService.getModified(function(results) {
                var modified_time = results.posts[0].modified;
                //var current_time = new Date().getTime();
                //var modified_date = new Date(current_time);
                //console.log(modified_date);
                var nice_date = new Date(modified_time * 1000);
                var nice_local = new Date(lastUpdatedLocal * 1000);
                //console.log("Nice date from server: " + nice_date);
                //console.log("Nice date from local: " + nice_local);

                if(lastUpdatedLocal < modified_time){
                    //console.log("Updating data from server");
                    getData();
                    localStorageService.add('modified',modified_time);
                }
               
            });
        }else{
            //console.log("Adding modified time to local");
            getData();

            PostService.getModified(function(results) { 
                var modified_time = results.posts[0].modified;
                localStorageService.add('modified',modified_time);
            });
        }

        
        function getData(){
            //console.log("Getting data");
            // Load pages into local storage
            PostService.getPagesAsync(function(results) {
                localStorageService.add('pages',results);
            });

            // Load posts and categories
            PostService.getCatPostsAsync(function(results) {
                localStorageService.add('categoryPosts',results);
            });
        }
        



        // Load the modal from the given template URL
        $ionicModal.fromTemplateUrl('templates/pwd-modal.html', function(modal) {
            $scope.modal = modal;
        }, {
        // Use our scope for the scope of the modal to keep it simple
            scope: $scope,
        // The animation we want to use for the modal entrance
            animation: 'slide-in-up'
        });



        $scope.openModal = function() {

            //console.log("Open modal");

            if(localStorageService.get('access')){
                $location.path('/documents').replace();
            }else{
                $scope.modal.show();
            }

        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        $scope.login = function(pwd) { 
            pwd = pwd.toLowerCase();
            if(pwd == "coffeelounge") {
                localStorageService.add('access', 'valid');
                $location.path('/documents').replace();
            }else{
                $scope.validation = false;
            }
        }

        //Be sure to cleanup the modal
        $scope.$on('$destroy', function() {
            //console.log("destroy modal");
            $scope.modal.remove();
        });

    })

    .controller('PageCtrl', function ($scope, $stateParams, PostService, localStorageService, LoaderService){

        LoaderService.show();

        var pageID = $stateParams.pageId;

        function showPage(pagesObject){
            var pages = pagesObject.pages;

            for(var i=0; i < pages.length; i++) {
                if(pageID == pages[i].id){
                    $scope.page = pages[i];
                    break;
                }
            }

            LoaderService.hide();
        }

        var localData = localStorageService.get('pages');
        

        if(localData){
            showPage(localData);
        }else{
            PostService.getPagesAsync(function(results) {
                localStorageService.add('pages',results);
                showPage(results);
            });
        }

    })

    .controller('FavListCtrl', function ($scope, localStorageService){

        $scope.favList = localStorageService.get('favPosts');
        //console.log($scope.favList);

        $scope.catFilterManualer = function (post){

            if(post.categories[0].slug == 'manualer'){
                return true;
            }else{
                return false;
            }
        }

        $scope.catFilterProduktblad = function (post){

            if(post.categories[0].slug == 'produktblad'){
                return true;
            }else{
                return false;
            }
        }

        $scope.catFilterSmakinstallningar = function (post){

            if(post.categories[0].slug == 'smakinstallningar'){
                return true;
            }else{
                return false;
            }
        }

        $scope.catFilterRengoringsrutiner = function (post){

            if(post.categories[0].slug == 'rengoringsrutiner'){
                return true;
            }else{
                return false;
            }
        }

        $scope.removeFav = function(postID) {
            var localStore = localStorageService.get('favPosts'); 

            if(localStore instanceof Array) {
                
                for(var i=0; i < localStore.length; i++) {
                    if(postID == localStore[i].id){
                        console.log("Trying to splice " + i + " !!!!");
                        localStore.splice(i, 1);
                        break;
                    }
                }


            }

            if(localStore.length == 0){
                localStorageService.remove('favPosts');    
            }else {
                localStorageService.add('favPosts', localStore);    
            }
            
            $scope.favList = localStore;
        }

        $scope.checkFav = function(postID){
            var localStore = localStorageService.get('favPosts');

            if(localStore instanceof Array){
                if(localStore.length > 0){

                    for(var i=0; i < localStore.length; i++) {
                        if(postID == localStore[i].id){
                            return true;
                        }
                    }

                }

            }

        }


    })

    .controller('EmployeeListCtrl', function ($scope, PostService, localStorageService, $location, LoaderService) {

        var access = localStorageService.get('access');

        if(!access){
            $location.path('/').replace();
        }

        LoaderService.show();

        $scope.searchKey = "";

        $scope.clearSearch = function () {
            $scope.searchKey = "";
            findAllEmployees();
        }

        $scope.favoritePosts = [];

        var localData = localStorageService.get('categoryPosts');

        if(localData){
            $scope.categories = localData;
            LoaderService.hide();
        }else{
            PostService.getCatPostsAsync(function(results) {
                $scope.categories = results;

                localStorageService.add('categoryPosts',results);

                LoaderService.hide();
            });
        }

        //console.log($scope.categories);

        $scope.onRefresh = function() {

            PostService.getCatPostsAsync(function(results) {
                //console.log(results);
                $scope.categories = results;
                localStorageService.add('categoryPosts',results);
                $scope.$broadcast('scroll.refreshComplete');

            });

        };

        // Lägg till offline-storage-stöd
        


        $scope.addFav = function(post) {
            var localStore = localStorageService.get('favPosts'); 
            var validPush = false;

            if(localStore instanceof Array) {
                //console.log("get local store");
                
                
                for(var i=0; i < localStore.length; i++) {
                    if(post.id == localStore[i].id){
                        console.log("Trying to splice " + i + " !!!!");
                        localStore.splice(i, 1);
                        var validPush = false;

                        break;

                    }else{
                        console.log("Trying to dice!!");
                        validPush = true;
                    }
                }


            }else {
                //console.log("create empty store");
                localStore = new Array();
                validPush = true;
            }

            if(validPush == true) {
                localStore.push(post);
            }

            if(localStore.length == 0){
                localStorageService.remove('favPosts');    
            }else {
                localStorageService.add('favPosts', localStore);    
            }

        
            var newLocalStore = localStorageService.get('favPosts'); 
        }

        $scope.checkFav = function(postID){
            var localStore = localStorageService.get('favPosts');

            if(localStore instanceof Array){
                if(localStore.length > 0){

                    for(var i=0; i < localStore.length; i++) {
                        if(postID == localStore[i].id){
                            return true;
                        }
                    }

                }

            }

        }

        $scope.logoutBtn = [
            { 
                type: 'button-outline',
                content: 'Logga ut',
                tap: function(e) {
                    localStorageService.remove('access');
                    $location.path('/start').replace();
                }
            }
        ]



    })

    .controller('EmployeeDetailCtrl', function ($scope, $stateParams, localStorageService, PostService, $location, LoaderService) {

        var access = localStorageService.get('access');

        if(!access){
            $location.path('/').replace();
        }

        LoaderService.show();

        var localData = localStorageService.get('categoryPosts');

        if(localData){
            var cat = $stateParams.postCat;
            var postID = $stateParams.employeeId;

            var posts = localData[cat].data.posts;

            for(var i=0; i < posts.length; i++) {
                if(postID == posts[i].id){
                    $scope.post = posts[i];
                    LoaderService.hide();
                    break;
                }
            }

        }else {
            PostService.getPostAsync($stateParams.employeeId,function(result){
                $scope.post = result.post;
                LoaderService.hide();
            });
        }

        

        $scope.openPDF = function (url) {
            window.open(url, '_system', 'location=yes');
            //window.open(url, '_blank', 'location=yes');
            //window.open("https://docs.google.com/viewer?url=" + url, '_blank', 'location=yes');
        }


        var localCats = localStorageService.get('categoryPosts');

        //console.log(localCats);

        if(localCats){
            console.log("Getting the local cats!");
            var currentCat = $stateParams.postCat;
            $scope.related_posts = localCats[currentCat].data.posts;
        }else {
            PostService.getCatPostsAsync(function(results) {
                console.log("Getting the remote cats!");
                $scope.related_posts = results[currentCat].data.posts;
                localStorageService.add('categoryPosts',results);
            });
        }




        $scope.toggleRightMenu = function() {
            $scope.sideMenuController.toggleRight();
        };
   

        // TOGGLE RIGHT SIDEBAR FROM NAV
        $scope.rightButtons = [
            { 
                type: 'button-clear',
                content: '<i class="icon ion-navicon"></i>',
                tap: function(e) {
                    $scope.sideMenuController.toggleRight();
                }
            }
        ]
    });
