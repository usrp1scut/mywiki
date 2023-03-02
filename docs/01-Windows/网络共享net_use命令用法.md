### 建立空连接:
```bat
net use \\IP\sharename "" /user:"" (一定要注意:这一行命令中包含了3个空格)
```
### 建立非空连接:
```bat
net use \\IP\sharname "密码" /user:"用户名" (同样有3个空格)
```
### 映射默认共享:
```bat
net use z: \\IP\sharename "密码" /user:"用户名" (即可将对方的共享映射为自己的z盘，其他盘类推)
```

### 删除一个ipc$连接
```bat
net use \\IP\sharename /del
```
### 删除共享映射
```bat
net use z: /del 删除映射的z盘，其他盘类推

net use * /del 删除全部,会有提示要求按y确认
```
### 查看远程主机的共享资源（但看不到默认共享）
```bat
net view \\IP
```
### 查看本地主机的共享资源（可以看到本地的默认共享）
```bat
net share
```

### 得到远程主机的用户名列表
```bat
nbtstat -A IP
```

### 得到本地主机的用户列表
```bat
net user
```
### 查看远程主机的当前时间
```bat
net time \\IP
```


