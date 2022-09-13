#### nginx proxy cache缓存配置


```nginx
    #缓存路径，缓存2级目录，缓存名称cache_one,分配100m内存，占用最大存储空间4g，不活跃的缓存1天后清除。
    proxy_cache_path /etc/nginx/cache_dir levels=1:2 keys_zone=cache_one:100m max_size=4g inactive=1d;
   
    server {
      listen 80;
      server_name www.example.com;
    # 添加缓存状态header判断是否命中
      add_header X-Cache "$upstream_cache_status";
      location / {
          proxy_set_header X-Real-IP $remote_addr;
          #proxy_set_header Host $host;
    #客户端浏览器缓存过期时间，-1为不缓存
          expires 1d;   
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #缓存键值，判断缓存内容
          proxy_cache_key $host$uri$is_args$args;
    #回源转发后端服务器地址  
          proxy_pass http://127.0.0.1:8080; 
    #指定缓存到哪个集    
          proxy_cache cache_one;
    #针对状态码指定缓存时间
          proxy_cache_valid 200 302 12h;
          proxy_cache_valid 301 1h;
          proxy_cache_valid any 5m;
    #同时间多个回源MISS请求，只转发回源一次，其余阻塞等待缓存
          proxy_cache_lock on;   
    #“不能者止”，如果当前请求未能如期完成，就放行后续请求。
          # (default) proxy_cache_lock_age 5s; 
    #阻塞的请求发生超时，同样放行，但不作缓存  
          # (default) proxy_cache_lock_timeout 5s;  
          proxy_limit_rate 50m;   #限制代理转发回源单个请求的带宽
          #limit_rate 20m;    #限制客户端单个请求的带宽
      }
    }
```