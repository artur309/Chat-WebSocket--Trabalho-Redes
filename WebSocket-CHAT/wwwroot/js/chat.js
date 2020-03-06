"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/messages").build();
var username;

function tempoMsg() {
    var data = new Date();
    return " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + " ";
}

function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
}

//registo do utilizador
$("#sendUserName").click(function () {
    username = $('#usernameInput:text').val();

    if (isEmptyOrSpaces(username))
        username = "Anonymous";

    $('#usernameSpan').html(username);

    //dá-se o incio da conexão
    connection.start().catch(function (err) {
        return console.error(err.toString());
    });

    //inserção do novo user
    connection.invoke("NewUser", username).catch(function (err) {
        return console.error(err.toString());
    });

    //avisa a todos os user que um novo user entrou
    $connection.invoke("SendMessageToAll", username);

});

//receber mensagens
connection.on("ReceiveMessage", function (message) {
    var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var div = document.createElement("div");
    div.innerHTML = msg + "<hr/>";
    document.getElementById("messages").appendChild(div);
    div.scrollIntoView();
});

//utilizador conecta
connection.on("UserConnected", function (connectionId) {

    connection.invoke("SendMessageToAll", ("" + username + " ON"));

    //adiciona User nos User ON
    var userTag = document.createElement("li");
    userTag.textContent = username;
    document.getElementById("userList").appendChild(userTag);
});

//utilizador desconecta
connection.on("UserDisconnected", function (connectionId) {

    connection.invoke("SendMessageToAll", ("" + username + " OFF"));

    //remove User nos User ON
    var userTag = document.createElement("li");
    userTag.textContent = username;
    document.getElementById("userList").appendChild(userTag + "off");
});

//codigo alteracao DOM
$("#sendButton").click(function () {
    var message = $('#message').val();

    if(isEmptyOrSpaces(message))
        message = "----";

    var groupElement = document.getElementById("group");
    var groupValue = groupElement.options[groupElement.selectedIndex].value;

    if (groupValue === "All") {
        connection.invoke("SendMessageToAll", username + " (" + tempoMsg() + ")-- > " + message).catch(function (err) {
            return console.error(err.toString());
        });
    }
    else {
        connection.invoke("SendMessageToGroup", groupValue, " (" + tempoMsg() + ")-- > " + message).catch(function (err) {
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