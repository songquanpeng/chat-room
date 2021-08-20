let socket;
let username = "";
let registered = false;
let roomID = window.location.pathname;
let dialogElement;
let inputElement;
let fileInputElement;

function isImage(fileName) {
  let extension = fileName.split(".").pop().toLowerCase();
  let formats = [
    "png",
    "jpg",
    "bmp",
    "gif",
    "ico",
    "jpeg",
    "apng",
    "svg",
    "tiff",
    "webp",
  ];
  return formats.includes(extension);
}

function uploadFile() {
  let file = fileInputElement.files[0];
  let formData = new FormData();
  formData.append("file", file);
  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      let filePath = data.path;
      sendMessage(filePath, isImage(file.name) ? "IMAGE" : "FILE");
    });
}

function changeUsername() {
  printMessage("please input your new username");
  registered = false;
}

function register() {
  if (username !== "") {
    socket.emit("register", username, roomID);
  }
}

function processInput(input) {
  input = input.trim();
  switch (input) {
    case "":
      break;
    case "help":
      printMessage("https://github.com/songquanpeng/chat-room", "system");
      break;
    case "clear":
      clearMessage();
      break;
    default:
      sendMessage(input);
      break;
  }
  clearInputBox();
}

function clearInputBox() {
  inputElement.value = "";
}

function clearMessage() {
  dialogElement.innerHTML = "";
}

function char2color(c) {
  let num = c.charCodeAt(0);
  let r = Math.floor(num % 255);
  let g = Math.floor((num / 255) % 255);
  let b = Math.floor((r + g) % 255);
  if (g < 20) g += 20;
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

function printMessage(content, sender = "system", type = "TEXT") {
  let html;
  let firstChar = sender[0];
  switch (type) {
    case "IMAGE":
      html = `<div class="chat-message shown">
    <div class="avatar" style="background-color:${char2color(firstChar)}">${firstChar.toUpperCase()}</div>
    <div class="nickname">${sender}</div>
    <div class="message-box"><img src="${content}" alt="${content}"></div>
</div>`
      break;
    case "FILE":
      html = `<div class="chat-message shown">
    <div class="avatar" style="background-color:${char2color(firstChar)}">${firstChar.toUpperCase()}</div>
    <div class="nickname">${sender}</div>
    <div class="message-box"><a href="${content}" download="${content}">${content}</a></div>
</div>`
      break;
    case "TEXT":
    default:
      html = `<div class="chat-message shown">
    <div class="avatar" style="background-color:${char2color(firstChar)}">${firstChar.toUpperCase()}</div>
    <div class="nickname">${sender}</div>
    <div class="message-box"><p>${content}</p></div>
</div>`
      break;
  }
  dialogElement.insertAdjacentHTML('beforeend', html)
  dialogElement.scrollTop = dialogElement.scrollHeight;
}

function sendMessage(content, type = "TEXT") {
  let data = {
    content,
    type,
  };
  socket.emit("message", data, roomID);
}

function initSocket() {
  socket = io();
  socket.on("message", function (message) {
    printMessage(message.content, message.sender, message.type);
  });
  socket.on("register success", function () {
    registered = true;
    localStorage.setItem("username", username);
    clearInputBox();
  });
  socket.on("conflict username", function () {
    registered = false;
    localStorage.setItem("username", "");
    printMessage(
      "the username is already been taken, please input a new username"
    );
  });
}

function send() {
  let input = inputElement.value;
  if (registered) {
    processInput(input);
  } else {
    username = input;
    register();
  }
}

window.onload = function () {
  initSocket();
  dialogElement = document.getElementById("dialog");
  inputElement = document.getElementById("input");
  fileInputElement = document.getElementById("fileInput");
  inputElement.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  });
  username = localStorage.getItem("username");
  if (username) {
    register();
  } else {
    printMessage("please input your username");
  }
};
