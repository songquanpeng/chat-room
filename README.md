# Chat Room
<details>
<summary><strong><i>Click here to expend the English version of readme.</i></strong></summary>
<div>

## Description
+ This is a chat room application.
+ No registration required.
+ Completely anonymous.
+ **Each different URL is an independent chat room.**
+ The first person get into the chat room will be the administrator of this chat room.

## Demo
![image](https://user-images.githubusercontent.com/39998050/201881861-e72e91a2-16fb-4709-8f71-561e9f0a4540.png)

## Todo list
- [x] Support send text message.
- [x] Support send image.
- [x] Support share file.
- [x] [Android client](https://github.com/songquanpeng/chat-room-android).
- [x] Support multi chat room.
- [x] Allow admin kick out people.
- [x] Save the username and allow change it.
- [ ] Message frequency limit.

</div>
</details>

## 简介
这是一个在线聊天室应用。

特点如下：
1. 支持发送图片消息 & 文件消息。
2. 有配套的[安卓客户端](https://github.com/songquanpeng/chat-room-android)。
3. 支持多房间，每个链接都是一个独立的聊天室，例如： https://chat-room-xx.herokuapp.com/独立聊天室
4. 支持管理员踢人，输入 `kick username` 即可。
5. 第一个进入房间的自动成为管理员。
6. 页面为移动端做了专门优化。

## 演示
演示站：https://chat-room-xx.herokuapp.com/

首次访问需要稍等几秒，这是由于 Heroku 把应用冻结了，之后就会好很多。

截图展示：
![image](https://user-images.githubusercontent.com/39998050/201881861-e72e91a2-16fb-4709-8f71-561e9f0a4540.png)

## 部署
```sh
git clone https://github.com/songquanpeng/chat-room
cd chat-room
npm install
npm start
```

## 其他
部分样式代码来自：https://github.com/koishijs/koishi ， MIT 协议。
