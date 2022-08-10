### 下载
PaPing 是谷歌开发的一个跨平台的开源工具，可以在 Linux 中发起 TCP 端口连通性和网路时延的测试。
```
#官方获取
wget https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/paping/paping_1.5.5_x86-64_linux.tar.gz
```

```
#通过本站获取
wget https://xiebo.pro/tools/paping_1.5.5_x86-64_linux.tar.gz
```
### 参数

```
Options:
 -?, --help     display usage
 -p, --port N   set TCP port N (required)   #制定TCP端口
     --nocolor  Disable color output      #不带颜色的字符输出，需配合脚本进行字符处理时建议添加此选项
 -t, --timeout  timeout in milliseconds (default 1000)  #超时时间，单位是ms，默认1000ms
 -c, --count N  set number of checks to N    #测试包数
 ```

### 例子
```
/root/paping -p 80 10.0.0.1 -c 10 -t 2000 --nocolor
```
### 获取最大延时及丢包数脚本
```
RESULT=`/root/paping -p 80 10.31.54.17 -c 10 -t 2000 --nocolor`
LOSS=`echo $RESULT | tail -n 1 | awk -F ',' '{print $3}' | awk '{print int($3)}'`
MAX=`echo $RESULT | tail -n 1 | awk -F ',' '{print $4}' |sed 's/ms//g' -|awk '{print int($3)}'`
info="丢包$LOSS个,最大延时$MAX ms"
echo $info
```

### 批量接口tcp探测脚本

`paping_patch.sh`

```
old_IFS=$IFS
#定义分隔符为换行符
IFS='
'
for i in `/usr/bin/cat /root/ip_port.txt`
do
{
  ip=`echo $i| awk '{print $1}'`
  port=`echo $i|awk '{print $2}'`
  RESULT=`/root/paping -p $port $ip -c 10 --nocolor`
  LOSS=`echo $RESULT | tail -n 1 | awk -F ',' '{print $3}' | awk '{print int($3)}'`
  MAX=`echo $RESULT | tail -n 1 | awk -F ',' '{print $4}' |sed 's/ms//g' -|awk '{print int($3)}'`
  echo "$ip 端口$port丢包$LOSS个,最大延时$MAX ms"
}&
done
IFS=$old_IFS 

```

ip_port.txt格式

ip port
```
10.0.0.1 80
```
