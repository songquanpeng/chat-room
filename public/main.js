let socket;
let username = "";
let registered = false;
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
    socket.emit("register", username);
  }
}

function processInput(input) {
  input = input.trim();
  switch (input) {
    case "":
      break;
    case "\\help":
      printMessage("https://github.com/songquanpeng/chat-room", "system");
      break;
    case "\\clear":
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

function printMessage(content, sender = "system", type = "TEXT") {
  let name = document.createElement("span");
  name.innerText = `${sender}: `;
  name.setAttribute("class", "name");
  dialogElement.appendChild(name);
  let e;
  switch (type) {
    case "IMAGE":
      e = document.createElement("img");
      e.setAttribute("src", content);
      e.setAttribute("alt", content);
      break;
    case "FILE":
      e = document.createElement("a");
      e.setAttribute("href", content);
      e.setAttribute("download", content);
      e.innerText = content;
      break;
    case "TEXT":
    default:
      e = document.createElement("span");
      e.innerText = `${content}`;
      break;
  }
  dialogElement.appendChild(e);
  let breadLine = document.createElement("br");
  dialogElement.appendChild(breadLine);
  dialogElement.scrollTop = dialogElement.scrollHeight;
}

function sendMessage(content, type = "TEXT") {
  let data = {
    content,
    type,
  };
  socket.emit("message", data);
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
