#### nginx配置limit_rate实现客户端限速和代理转发限速
```nginx
  server {
    listen 80;
    server_name www.example.com;
    location / {
    #回源转发后端服务器地址  
      proxy_pass http://127.0.0.1:8080; 
    #限制代理转发回源单个请求的带宽为5M
      proxy_limit_rate 5m;
    #限制客户端单个请求的带宽为2M
      limit_rate 2m;    
    }
  }
```