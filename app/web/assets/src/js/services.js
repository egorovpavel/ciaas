'use strict';

/* Services */

angular.module('CI.services', []).
    factory('iosocket', function (socketFactory) {
        var myIoSocket = io.connect('/');

        var mySocket = socketFactory({
            ioSocket: myIoSocket
        });

        return mySocket;
    }).
    value('version', '0.1');