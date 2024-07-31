配置xstartup启动命令

将/root/.vnc/xstartup文件内容复制成下面的内容
```bash
[root@vm01 ~]# cp /root/.vnc/xstartup /root/.vnc/xstartup.bak
[root@vm01 ~]# vim /root/.vnc/xstartup               //该配置文件要在vncserver服务启动后才能产生
#!/bin/sh
# Uncomment the following two lines for normal desktop:
unset SESSION_MANAGER
exec /etc/X11/xinit/xinitrc
[ -x /etc/vnc/xstartup ] && exec /etc/vnc/xstartup
[ -r $HOME/.Xresources ] && xrdb $HOME/.Xresources
xsetroot -solid grey
vncconfig -iconic &
#xterm -geometry 80x24+10+10 -ls -title "$VNCDESKTOP Desktop" &
#twm &
gnome-session &
```

然后重启vnc服务
```bash
[root@vm01 ~]# service vncserver restart
```
:::tip
针对上面启动文件内容：
1）如果使用的是gnome图像界面，则需要注释掉以下两行,
```
xterm -geometry80x24+10+10 -ls -title “$VNCDESKTOP Desktop” &
twm &
```
并添加以下这行：
```
gnome-session &
```
:::