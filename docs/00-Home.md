---
id: Home
title: 关于HomeLab
sidebar_label: 旁门左道
slug: /
---
## 硬件
优先迷你主机
* NUC兼容性最好，没什么性价比，用过NUC10I7
* AMD的迷你主机很多，性价比高，现在用极摩客M5 plus
## 系统
* 不折腾硬件直通首选ESXI,省事bug少
* 直通选PVE,但建议选intel的CPU
* 也可以直接装Windows开Hyper-V
## 应用
* Windows Server2016一台
  * 虚拟显卡控制台跑wxauto微信机器人，接OpenAI api、openweathermap、RSS订阅，自动获取当前IPv6地址，还可以调wol唤醒电脑
  * 作下载机及内网NAS
* Ubuntu Server 2204
  * talebook内网在线电子书，ipv6公网
  * frpc内网穿透,通过阿里云frps
  * openvpn,配合frpc使用，方便远程回内网
  * JumpServer堡垒机，有OVPN后用不太上停了
  * 青龙面板，订阅京东自动签到脚本之类的








