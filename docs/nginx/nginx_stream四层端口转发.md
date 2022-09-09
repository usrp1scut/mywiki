```nginx
stream {
    #tcp端口转发
    server {
        listen 1701 ;
        proxy_pass 192.168.2.13:1701;
    }
    #udp端口转发
    server {
        listen 500 udp;
        proxy_pass 192.168.2.13:500;
    }
}
```