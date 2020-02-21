"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

function checkTime(i) {
    if (i < 10) {
        i = '0' + i;
    }
    return i;
}

function dayOfWeek(dayIndex) {
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][dayIndex];
}
function boldString(str, find) {
    var re = new RegExp(find, 'g');
    return str.replace(re, '<b>' + find + '</b>');
}

connection.on("ReceiveMessage", function (user, message) {
    var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var today = new Date();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();
    var day = dayOfWeek(today.getDay());
    var date = today.getDate();

    minutes = checkTime(minutes);
    seconds = checkTime(seconds);

    var time = " " + hours + ":" + minutes + ":" + seconds + " | " + day + " " + date + " ";
    if (user.toString() === '') {
        user = 'Anonymous';
    }

    var encodedMsg = user + ": " + msg;

    var li = document.createElement("li");
    li.setAttribute("id", "onlineMessages");
    li.className = "list-group-item list-group-item-info";

    var span = document.createElement("span");
    span.className = "label label-primary label-as-badge";
    span.textContent = time;
    span.style.cssFloat = "right";   

    
    li.textContent = encodedMsg;

    var colorValue = document.getElementById("valueInputColor").value;
    li.style.color = colorValue;
    document.getElementById("messagesList").appendChild(li);
    document.getElementById("onlineMessages").appendChild(span);
    document.getElementById("onlineMessages").innerHTML = boldString(document.getElementById("onlineMessages").innerHTML, user);
    li.setAttribute("id", "temp");
    li.scrollIntoView();
});
connection.on("NewUser", function (user) {
    var li = document.createElement("li");
    li.setAttribute("id", "onlineUsers");
    li.className = "list-group-item";
    li.textContent = user;
    
    var span = document.createElement("span");
    span.className = "label label-success label-as-badge";
    span.textContent = "✔";
    span.style.cssFloat = "right";   

    
    document.getElementById("usersList").appendChild(li);
    document.getElementById("onlineUsers").appendChild(span);
    li.setAttribute("id", "temp");
    li.scrollIntoView();
});

window.addEventListener("beforeunload", function (user) {
    var user = document.getElementById("userInput").value;
    //var message = document.getElementById("messageInput").value;
    connection.invoke("UserLeft", user).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("urlButton").addEventListener("click", function (event) {
    var clipboard = document.createElement('input'), textUrl = window.location.href;
    document.body.appendChild(clipboard);
    clipboard.value = textUrl;
    clipboard.select();
    document.execCommand('copy');
    document.body.removeChild(clipboard);
    event.preventDefault();
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    connection.invoke("SendMessage", user, message).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('#newUserButton').prop('disabled', true);
    $('#userInput').on('keyup', (function () {
        if ($(this).val() != '') {
            $('#newUserButton').prop('disabled', false);
        }
        else {
            $('#newUserButton').prop('disabled', true);
        }
    }));
});

document.getElementById("newUserButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    connection.invoke("NewUser", user).catch(function (err) {
        return console.error(err.toString());
    });

    document.getElementById("userInput").readOnly = true;

    var button = document.getElementById("newUserButton");
    var icon = document.getElementById("buttonIcon");
    icon.setAttribute("class", "glyphicon glyphicon-user cursor:default");
    button.style.cursor = "auto";
    //$("#nameFooter").hide();
    button.disabled = "disabled";
    setTimeout(function () {        
        document.getElementById("refreshButton").click();
    }, 100);

    event.preventDefault();
});

document.getElementById("refreshButton").addEventListener("click", function (event) {
    $(document.getElementById("usersList")).empty();
    connection.invoke("GetUsers").catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});



document.getElementById("clearMessageButton").addEventListener("click", function (event) {
    document.getElementById("messageInput").value = '';
    event.preventDefault();
});

document.getElementById("clearChatButton").addEventListener("click", function (event) {
    $(document.getElementById("messagesList")).empty();
    event.preventDefault();
});