 
``` 
    server {
      listen 80;
      server_name ;
      #开启压缩
      gzip on;
      gzip_buffers 4 16k;
      #压缩等级，越高压缩率越高，但消耗性能也多
      gzip_comp_level 6;
      gzip_vary on;
      #压缩的资源类型
      gzip_types application/atom+xml application/javascript application/json application/rss+xml application/vnd.ms-fontobject application/x-font-ttf application/x-web-app-manifest+json application/xhtml+xml application/xml font/opentype image/svg+xml image/x-icon image/jpeg image/jpg image/png text/css text/plain text/x-component;
      location / {
      
      }
    }
```