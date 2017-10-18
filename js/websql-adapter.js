var WebSqlAdapter = function () { 

    this.initialize = function () {

        //$("#update").html('Loading...');
        
        var deferred = $.Deferred();
        this.db = window.openDatabase("WPAppDB", "1.0", "Wordpress App DB", 200000);
        var database = this.db;

        // CREATE TABLE TRANSACTION
        this.db.transaction(
            function (tx) {
                createTable(tx);
                //getJSONdata(tx);
            },
            function (error) {
                console.log('Transaction error: ' + error);
                deferred.reject('Transaction error: ' + error);
            },
            function () {
                console.log('Transaction success');
                deferred.resolve();
            }
        );

        

        // GET JSON AND PUT IN TABLE

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

            console.log(posts);
            


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
                            alert('INSERT WP success');
                        },
                        function (tx, error) {
                            alert('INSERT error: ' + error.message);
                        }
                    );
                    
                }

            });

            
        })
        .success(function(){
            console.log("GETJSON SUCCESS");
            //$("#update").html('Update');
        })
        .error(function(jqxhr, textStatus, error){
            var err = textStatus + ", " + error;
            console.log( "GETJSON failed. Request Failed: " + err );
        });



        return deferred.promise();


    }

    this.showData = function() {
        //alert("RUNNING SHOW DATA FUNCTION");
        
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
                            console.log(post_content);
                        }
                        

                        //console.log(results.rows.item(i));
                        posts[i] = results.rows.item(i);
                        //alert(item.title);

                    }

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

    var createTable = function (tx) {
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
            });
    }

}