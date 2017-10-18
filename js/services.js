var directoryService = angular.module('directory.services', []);
var postService = angular.module('post.services', []);
var loaderService = angular.module('loader.services', []);

    loaderService.factory('LoaderService', function($rootScope, $ionicLoading) {

      // Trigger the loading indicator
      return {
            show : function() { //code from the ionic framework doc

                // Show the loading overlay and text
                $rootScope.loading = $ionicLoading.show({

                  // The text to display in the loading indicator
                  content: '<i class="icon ion-loading-c"></i>',

                  // The animation to use
                  animation: 'fade-in',

                  // Will a dark overlay or backdrop cover the entire view
                  showBackdrop: true,

                  // The maximum width of the loading indicator
                  // Text will be wrapped if longer than maxWidth
                  //maxWidth: 1,

                  // The delay in showing the indicator
                  showDelay: 10
                });
            },
            hide : function(){
                $rootScope.loading.hide();
            }
        }
    });
    
    postService.factory('PostService', function($http, $q){
        return {
            getPostsAsync: function(callback) {
                var remote_url = 'http://dev.klapp.se/wpapp/api/get_posts/?callback=JSON_CALLBACK&orderby=title&order=ASC';
                $http.jsonp(remote_url).success(callback);
            },
            getPostAsync: function(postId,callback) {
                var remote_url = 'http://dev.klapp.se/wpapp/api/get_post/?callback=JSON_CALLBACK&id=' + postId;
                $http.jsonp(remote_url).success(callback);
            },
            getPageAsync: function(pageId,callback) {
                var remote_url = 'http://dev.klapp.se/wpapp/api/get_page/?callback=JSON_CALLBACK&id=' + pageId;
                $http.jsonp(remote_url).success(callback);
            },
            getPagesAsync: function(callback) {
                var remote_url = 'http://dev.klapp.se/wpapp/api/get_page_index/?callback=JSON_CALLBACK';
                $http.jsonp(remote_url).success(callback);
            },
            getModified: function(callback) {
                var remote_url = 'http://dev.klapp.se/wpapp/api/get_recent_posts/?callback=JSON_CALLBACK&count=1&order=desc&orderby=modified&include=modified&date_format=U';
                $http.jsonp(remote_url).success(callback);
            },
            getCatPostsAsync: function(callback) {
                //var remote_url = 'http://dev.klapp.se/wpapp/api/get_posts/?callback=JSON_CALLBACK';
                //$http.jsonp(remote_url).success(callback);

                var remote_smakinstallningar = "http://dev.klapp.se/wpapp/api/get_category_posts/?callback=JSON_CALLBACK&orderby=title&order=ASC&slug=smakinstallningar";
                var remote_manualer = "http://dev.klapp.se/wpapp/api/get_category_posts/?callback=JSON_CALLBACK&orderby=title&order=ASC&slug=manualer";

                var remote_produktblad = "http://dev.klapp.se/wpapp/api/get_category_posts/?callback=JSON_CALLBACK&orderby=title&order=ASC&slug=produktblad";
                var remote_rengoringsrutiner = "http://dev.klapp.se/wpapp/api/get_category_posts/?callback=JSON_CALLBACK&orderby=title&order=ASC&slug=rengoringsrutiner";

                var smakinstallningar = $http.jsonp(remote_smakinstallningar),
                manualer = $http.jsonp(remote_manualer),
                produktblad = $http.jsonp(remote_produktblad),
                rengoringsrutiner = $http.jsonp(remote_rengoringsrutiner);

                $q.all({smakinstallningar : smakinstallningar, manualer : manualer, produktblad : produktblad, rengoringsrutiner : rengoringsrutiner}).then(callback);
            },
            getCatAsync: function(catSlug,callback) {
                var remote_url = 'http://dev.klapp.se/wpapp/api/get_category_posts/?callback=JSON_CALLBACK&slug=' + catSlug;
                $http.jsonp(remote_url).success(callback);
            }
        };
    });

    directoryService.factory('EmployeeService', function($q) {

        //alert("Refresh success!");

        // Initialize websql / json
        function getJSON() {
            var remote_url = 'http://dev.klapp.se/wpapp/api/get_posts/?callback=?';
            //var remote_url = 'http://dev.klapp.se/wpapp/wp_api/v1/posts?callback=?&category_name=smakinstallningar&after=20140223';

            $.getJSON(remote_url,function (data) {  
                var post_data = data.posts;
                //addData(tx,post_data);

                //console.log(post_data);

                var posts = new Array();

                $.each( post_data, function ( i, val ) {
                            
                    var first_name = val.author.first_name;
                    var last_name = val.author.last_name;
                    var nickname = val.author.nickname;
                    var title = val.title;
                    var content = val.content;
                    var modified = val.modified;
                    //var post_content = val.acf.post_content;
                    var post_content = JSON.stringify( val.acf.post_content );

                    var post = {
                        "id" : i,
                        "first_name" : first_name,
                        "last_name" : last_name,
                        "nickname" : nickname,
                        "title" : title,
                        "content" : content,
                        "modified" : modified,
                        "post_content" : post_content
                    };

                    posts.push(post);
                });

                //console.log(posts);

                var database = window.openDatabase("WPAppDB", "1.0", "Wordpress App DB", 200000);

                // CREATE DATABASE

                database.transaction(function(tx){

                    tx.executeSql('DROP TABLE IF EXISTS wp_post');

                    var sql = "CREATE TABLE IF NOT EXISTS wp_post ( " +
                        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                        "first_name VARCHAR(50), " +
                        "last_name VARCHAR(50), " +
                        "nickname VARCHAR(50), " +
                        "title VARCHAR(50), " +
                        "content VARCHAR(100), " +
                        "modified VARCHAR(50), " +
                        "post_content VARCHAR(100))";

                    tx.executeSql(sql, null,
                        function () {
                            console.log('Create table "WP POSTS" success');
                            //alert('Create table "WP POSTS" success');
                        },
                        function (tx, error) {
                            alert('Create table "WP POSTS" error: ' + error.message);
                        }
                    );

                });

                // INSERT INTO DATABASE

                var l = posts.length;
                var sql = "INSERT OR REPLACE INTO wp_post " +
                    "(id, first_name, last_name, nickname, title, content, modified, post_content) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                var e;
                var p_array;

                //console.log(tx);

                database.transaction(function(tx){

                    for (var i = 0; i < l; i++) {
                        e = posts[i];
                        //console.log(e);

                        //p_array = JSON.stringify( e.post_content );

                        tx.executeSql(sql, [e.id, e.first_name, e.last_name, e.nickname, e.title, e.content, e.modified, e.post_content],
                            function () {
                                console.log('INSERT WP success');
                            },
                            function (tx, error) {
                                alert('INSERT error: ' + error.message);
                            }
                        );
                        
                    }

                });

                
            })
            .success(function(){
                alert("GETJSON SUCCESS");
                //$("#update").html('Update');
            })
            .error(function(jqxhr, textStatus, error){
                var err = textStatus + ", " + error;
                callback( "GETJSON failed. Request Failed: " + err );
            });
        }

        function getSQL (){
            var deferred = $.Deferred();

            sql_database = window.openDatabase("WPAppDB", "1.0", "Wordpress App DB", 200000);

            sql_database.transaction(    // Här blir det problem när man är offline. FIXA!
                function (tx) {

                    var sql = "SELECT * FROM wp_post";

                    tx.executeSql(sql, [], function (tx, results) {
                        //alert("TRANSACTION SUCCESS"); 
                        //console.log(results);
                        var len = results.rows.length;
                        var i = 0;
                        var posts = [];

                        for (; i < len; i = i + 1) {
                            var item = results.rows.item(i);

                            var title = item.title;

                            //console.log(item.post_content);
                            

                            if(item.post_content !== "undefined") {
                                var post_content = JSON.parse( item.post_content );
                                //console.log(post_content);
                            }
                            

                            //console.log(results.rows.item(i));
                            posts[i] = results.rows.item(i);
                            //alert(item.title);

                        }

                        console.log(posts);

                        deferred.resolve(posts);
                    });
                },
                function (error) {
                    alert("TRANSACTION ERROR : " + error.message);
                    deferred.reject("Transaction Error: " + error.message);
                }
            );

            return deferred.promise();

        }

        //getJSON();
        //getSQL();

        //console.log(getSQL());

        /*var stank = {};

        var sql_test = function() {
            getSQL().then(function (posts) {
                //var test_post = posts;
                //console.log(posts);

                stank.posts = posts;
            });
        }

        //sql_test();
        console.log(stank);*/


        var employees = [
            {"id": 1, "firstName": "James", "lastName": "King", "managerId": 0, "managerName": "", "reports": 4, "title": "President and CEO", "department": "Corporate", "cellPhone": "617-000-0001", "officePhone": "781-000-0001", "email": "jking@fakemail.com", "city": "Boston, MA", "pic": "James_King.jpg", "twitterId": "@fakejking", "blog": "http://coenraets.org"},
            {"id": 2, "firstName": "Julie", "lastName": "Taylor", "managerId": 1, "managerName": "James King", "reports": 2, "title": "VP of Marketing", "department": "Marketing", "cellPhone": "617-000-0002", "officePhone": "781-000-0002", "email": "jtaylor@fakemail.com", "city": "Boston, MA", "pic": "Julie_Taylor.jpg", "twitterId": "@fakejtaylor", "blog": "http://coenraets.org"},
            {"id": 3, "firstName": "Eugene", "lastName": "Lee", "managerId": 1, "managerName": "James King", "reports": 0, "title": "CFO", "department": "Accounting", "cellPhone": "617-000-0003", "officePhone": "781-000-0003", "email": "elee@fakemail.com", "city": "Boston, MA", "pic": "Eugene_Lee.jpg", "twitterId": "@fakeelee", "blog": "http://coenraets.org"},
            {"id": 4, "firstName": "John", "lastName": "Williams", "managerId": 1, "managerName": "James King", "reports": 3, "title": "VP of Engineering", "department": "Engineering", "cellPhone": "617-000-0004", "officePhone": "781-000-0004", "email": "jwilliams@fakemail.com", "city": "Boston, MA", "pic": "John_Williams.jpg", "twitterId": "@fakejwilliams", "blog": "http://coenraets.org"},
            {"id": 5, "firstName": "Ray", "lastName": "Moore", "managerId": 1, "managerName": "James King", "reports": 2, "title": "VP of Sales", "department": "Sales", "cellPhone": "617-000-0005", "officePhone": "781-000-0005", "email": "rmoore@fakemail.com", "city": "Boston, MA", "pic": "Ray_Moore.jpg", "twitterId": "@fakermoore", "blog": "http://coenraets.org"},
            {"id": 6, "firstName": "Paul", "lastName": "Jones", "managerId": 4, "managerName": "John Williams", "reports": 0, "title": "QA Manager", "department": "Engineering", "cellPhone": "617-000-0006", "officePhone": "781-000-0006", "email": "pjones@fakemail.com", "city": "Boston, MA", "pic": "Paul_Jones.jpg", "twitterId": "@fakepjones", "blog": "http://coenraets.org"},
            {"id": 7, "firstName": "Paula", "lastName": "Gates", "managerId": 4, "managerName": "John Williams", "reports": 0, "title": "Software Architect", "department": "Engineering", "cellPhone": "617-000-0007", "officePhone": "781-000-0007", "email": "pgates@fakemail.com", "city": "Boston, MA", "pic": "Paula_Gates.jpg", "twitterId": "@fakepgates", "blog": "http://coenraets.org"},
            {"id": 8, "firstName": "Lisa", "lastName": "Wong", "managerId": 2, "managerName": "Julie Taylor", "reports": 0, "title": "Marketing Manager", "department": "Marketing", "cellPhone": "617-000-0008", "officePhone": "781-000-0008", "email": "lwong@fakemail.com", "city": "Boston, MA", "pic": "Lisa_Wong.jpg", "twitterId": "@fakelwong", "blog": "http://coenraets.org"},
            {"id": 9, "firstName": "Gary", "lastName": "Donovan", "managerId": 2, "managerName": "Julie Taylor", "reports": 0, "title": "Marketing Manager", "department": "Marketing", "cellPhone": "617-000-0009", "officePhone": "781-000-0009", "email": "gdonovan@fakemail.com", "city": "Boston, MA", "pic": "Gary_Donovan.jpg", "twitterId": "@fakegdonovan", "blog": "http://coenraets.org"},
            {"id": 10, "firstName": "Kathleen", "lastName": "Byrne", "managerId": 5, "managerName": "Ray Moore", "reports": 0, "title": "Sales Representative", "department": "Sales", "cellPhone": "617-000-0010", "officePhone": "781-000-0010", "email": "kbyrne@fakemail.com", "city": "Boston, MA", "pic": "Kathleen_Byrne.jpg", "twitterId": "@fakekbyrne", "blog": "http://coenraets.org"},
            {"id": 11, "firstName": "Amy", "lastName": "Jones", "managerId": 5, "managerName": "Ray Moore", "reports": 0, "title": "Sales Representative", "department": "Sales", "cellPhone": "617-000-0011", "officePhone": "781-000-0011", "email": "ajones@fakemail.com", "city": "Boston, MA", "pic": "Amy_Jones.jpg", "twitterId": "@fakeajones", "blog": "http://coenraets.org"},
            {"id": 12, "firstName": "Steven", "lastName": "Wells", "managerId": 4, "managerName": "John Williams", "reports": 0, "title": "Software Architect", "department": "Engineering", "cellPhone": "617-000-0012", "officePhone": "781-000-0012", "email": "swells@fakemail.com", "city": "Boston, MA", "pic": "Steven_Wells.jpg", "twitterId": "@fakeswells", "blog": "http://coenraets.org"}
        ];

        // We use promises to make this api asynchronous. This is clearly not necessary when using in-memory data
        // but it makes this service more flexible and plug-and-play. For example, you can now easily replace this
        // service with a JSON service that gets its data from a remote server without having to changes anything
        // in the modules invoking the data service since the api is already async.

        return {
            findAll: function() {
                var deferred = $q.defer();
                deferred.resolve(employees);
                return deferred.promise;
            },

            findById: function(employeeId) {
                var deferred = $q.defer();
                var employee = employees[employeeId - 1];
                deferred.resolve(employee);
                return deferred.promise;
            },

            findByName: function(searchKey) {
                var deferred = $q.defer();

                var results = employees.filter(function(element) {
                    var fullName = element.firstName + " " + element.lastName;
                    return fullName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
                });

                deferred.resolve(results);
                return deferred.promise;
            },

            findByManager: function (managerId) {
                var deferred = $q.defer(),
                    results = employees.filter(function (element) {
                        return parseInt(managerId) === element.managerId;
                    });
                deferred.resolve(results);
                return deferred.promise;
            }

        }

    });