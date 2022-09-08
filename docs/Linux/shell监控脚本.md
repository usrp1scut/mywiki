#### 监控主机磁盘使用率并发送企业微信机器人告警，需配合crontab

```
#!/bin/bash
#monitor available disk space
SPACE=`df -Ph | awk '{ if($5 > 90) print $0;}'`
RESULT=`echo $SPACE |sed 's/ /,/g'`
HOST=`hostname`
if [ $RESULT != "" ]
then
   curl 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxx' \
     -H 'Content-Type: application/json' \
     -d '
     {
          "msgtype": "text",
          "text": {
              "content": "服务器的磁盘空间使用率已经超过90%"
          }
     }'
fi
```
#### 主机间ping监测丢包率，死循环，用于监测链路丢包，企业微信机器人告警
```
#!/bin/bash
WEB_HOOK="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxx"
while [ “1” = “1” ]

do

LOSS_RATE=`ping 10.10.10.1 -c 10 | tail -n 2 | head -n 1 | awk -F ',' '{print $3}' | tr "%" " " | awk '{print $1}'`

info="[告警]xx1->xx2丢包率为$LOSS_RATE%"
if [ $LOSS_RATE -ne 0 ]
then
    curl --location --request POST ${WEB_HOOK} \
      --header 'Content-Type: application/json' \
      -d '{"msgtype": "text","text": {"content":"'$info'"}}'
    date >> /root/pingerr.log
    echo $info >> /root/pingerr.log
    mtr 10.10.10.1 -r -c 20 >> /root/pingerr.log 

fi
done