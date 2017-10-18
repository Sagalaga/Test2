/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var pushNotification;

var appInit = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        $("#app-status-ul").append('<li>registering ' + device.platform + '</li>');

        pushNotification = window.plugins.pushNotification;

        if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){
            $("#app-status-ul").append('<li>Running android push call</li>');
            pushNotification.register(
            appInit.successHandler,
            appInit.errorHandler,
            {
                "senderID":"1009597235175",
                "ecb":"appInit.onNotificationGCM"
            });
        } else {
            $("#app-status-ul").append('<li>Running ios push call</li>');
            pushNotification.register(
            appInit.tokenHandler,
            appInit.errorHandler,
            {
                "badge":"true",
                "sound":"true",
                "alert":"true",
                "ecb":"appInit.onNotificationAPN"
            });
        }
        //appInit.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        // ---  // var senderID = "big-signifier-516";
        
        /*
        var senderID = "1009597235175";

        var pushNotification = window.plugins.pushNotification;
        pushNotification.register(appInit.successHandler, appInit.errorHandler,{"senderID":senderID,"ecb":"appInit.onNotificationGCM"});
        

        console.log('Received Event: ' + id); */
    },

    tokenHandler: function(result) {
        alert('Token Success! Result = '+ result)
        console.log('IOS Token callback Success! Result = '+ result);
        $("#app-status-ul").append('<li>IOS Token callback Success! Result = ' + result + '</li>');
    },

    successHandler: function(result) {
        //alert('Callback Success! Result = '+ result)
        console.log('Android Callback Success! Result = '+ result);
        $("#app-status-ul").append('<li>Android Callback Success! Result = ' + result + '</li>');
    },

    errorHandler:function(error) {
        alert(error);
    },

    onNotificationGCM: function(e) {
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {

                    function httpGet(theUrl)
                    {
                        var xmlHttp = null;

                        xmlHttp = new XMLHttpRequest();
                        xmlHttp.open( "GET", theUrl, true );
                        xmlHttp.send( null );
                        //alert(xmlHttp.responseText) ;
                    }

                    console.log("Regid " + e.regid);
                    httpGet("http://dev.klapp.se/android-push/add-to-db.php?regID="+e.regid);
                }
            break;
 
            case 'message':
              // this is the actual push notification. its format depends on the data model from the push server
              //alert('message = '+e.message);
              console.log('message = '+e.message);
            break;
 
            case 'error':
              alert('GCM error = '+e.msg);
            break;
 
            default:
              alert('An unknown GCM event has occurred');
              break;
        }
    },

    onNotificationAPN: function(event) {
        if ( event.alert )
        {
            navigator.notification.alert(event.alert);
        }

        if ( event.sound )
        {
            var snd = new Media(event.sound);
            snd.play();
        }

        if ( event.badge )
        {
            pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
        }
    }
};
