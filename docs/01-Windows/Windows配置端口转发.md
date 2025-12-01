### 创建端口转发

```batch
netsh interface portproxy add v4tov4  listenaddress=192.168.50.88 listenport=3306  connectaddress=192.168.50.16 connectport=3306
```

### 查看端口转发

```batch
netsh interface portproxy show all
```

### 删除端口转发

```batch
netsh interface portproxy delete v4tov4   listenaddress=192.168.50.88 listenport=3306
```