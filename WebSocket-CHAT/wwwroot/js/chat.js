"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/messages").build();
var username = "Anonymous"; //utilizador default é Anonimo

function tempoMsg(tempo) {

    function segundosFormata(i) { //serve pra formatar os segundos ;; 9 --> 09
        if (i < 10)
            return i = '0' + i;
    }

    var data = new Date();
    var horas = data.getHours();
    var minutos = data.getMinutes();
    var segundos = data.getSeconds();

    minutos = segundosFormata(minutos);
    segundos = segundosFormata(segundos);

    return tempo = " " + horas + ":" + minutos + ":" + segundos + " ";
}

function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
}

//registo do utilizador
$("#sendUserName").click(function () {
    //var username = "" + $('#usernameInput:text').val() + " entrou";
    username = $('#usernameInput:text').val();

    if (isEmptyOrSpaces(username))
        username = "Anonymous";

    $('#usernameSpan').html(username);

    //dá-se o incio da conexão
    connection.start().catch(function (err) {
        return console.error(err.toString());
    });

    connection.invoke("NewUser", username).catch(function (err) {
        return console.error(err.toString());
    });

    $connection.invoke("SendMessageToAll", username);

});

//envio de mensagens
connection.on("ReceiveMessage", function (message) {
    var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var div = document.createElement("div");
    div.innerHTML = msg + "<hr/>";
    document.getElementById("messages").appendChild(div);
    div.scrollIntoView();
});

//utilizador conecta
connection.on("UserConnected", function (connectionId) {
    var option = document.createElement("option");
    option.text = connectionId;
    option.value = connectionId;
    document.getElementById("group").add(option); //grupo de elementos
    connection.invoke("SendMessageToAll", ("" + username + " ON"));

    //adiciona User nos User ON
    var userTag = document.createElement("li");
    userTag.textContent = username;
    document.getElementById("userList").appendChild(userTag);
});

//utilizador desconecta
connection.on("UserDisconnected", function (connectionId) {
    var groupElement = document.getElementById("group");
    for (var i = 0; i < groupElement.length; i++) {
        if (groupElement.options[i].value == connectionId)
            groupElement.remove(i);
    }
    connection.invoke("SendMessageToAll", ("" + username + " OFF"));

    //remove User nos User ON
    var userTag = document.createElement("li");
    userTag.textContent = username;
    document.getElementById("userList").appendChild(userTag+"off");
});

//codigo alteracao DOM
$("#sendButton").click(function () {
    var message = document.getElementById("message").value;
    var groupElement = document.getElementById("group");
    var groupValue = groupElement.options[groupElement.selectedIndex].value;
    var method = "SendMessageToAll";

    if (groupValue === "All") {
        var method = groupValue === "All" ? "SendMessageToAll" : "SendMessageToCaller";
        connection.invoke(method, username + " (" + tempoMsg() + ")-- > " + message).catch(function (err) {
            return console.error(err.toString());
        });
    } else if (groupValue === "PrivateGroup") {
        connection.invoke("SendMessageToGroup", "PrivateGroup", message).catch(function (err) {
            return console.error(err.toString());
        });
    } else {
        connection.invoke("SendMessageToUser", groupValue, message).catch(function (err) {
            return console.error(err.toString());
        });
    }

    e.preventDefault();
});

$("#joinGroup").click(function (event) {

    var nomeGrupo = $('#nomeGrupo:text').val();

    var option = document.createElement("option");
    option.text = nomeGrupo;
    option.value = nomeGrupo;
    document.getElementById("group").add(option); //grupo de elementos

    connection.invoke("JoinGroup", nomeGrupo).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
}); 