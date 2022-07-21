### 关闭nginx版本号显示

`server_tokens off;`

### https配置
```
    server {
        listen       443 ssl http2 default_server;
        listen       [::]:443 ssl http2 default_server;
        server_name  www.example.com;
        #网站文件目录
        root         /usr/share/nginx/html;
        #ssl证书路径
        ssl_certificate "/etc/pki/nginx/server.crt";
        ssl_certificate_key "/etc/pki/nginx/private/server.key";
        ssl_session_cache shared:SSL:1m;
        ssl_session_timeout  10m;
        ssl_ciphers PROFILE=SYSTEM;
        ssl_prefer_server_ciphers on;

        # Load configuration files for the default server block.
        #其他配置文件
        include /etc/nginx/default.d/*.conf;
        
        location / {
        }

        error_page 404 /404.html;
            location = /40x.html {
        }

        error_page 500 502 503 504 /50x.html;
            location = /50x.html {
        }
    }
```
 ### http重定向到https
```
  server {
    listen 80;
    server_name www.example.com;
    index index.html index.php index.htm;
     
    rewrite ^(.*)$  https://$host$1 permanent;        //这是ngixn早前的写法，现在还可以使用。
  
  }
```
### 针对路径的重定向配置,改变客户端浏览器url
```
        location ^~ /news {
           return       301 http://www.example.com$request_uri;
        }
```
### nginx 日志配置
* 可配在最外层、http层及server层
```
#错误日志
error_log /var/log/nginx/error.log;
#连接日志
access_log  /var/log/nginx/access.log  main;
#配置日志格式
log_format  main  '$remote_addr - $http_x_forwarded_for - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$upstream_cache_status"'
                  '"$http_cookie" "$cookie_access-key"';
```
### location正则表达式匹配，优先级从上到下
```
  1. = 精确匹配
  2. ^~ 前缀匹配
  3. ~ 为区分大小写匹配
  4. ~* 为不区分大小写匹配
  5. !~和!~*分别为区分大小写不匹配及不区分大小写不匹配
  6. 通配符路径，即“/”开头

```
### 文件及目录匹配，其中：
```
  -f和!-f用来判断是否存在文件
  -d和!-d用来判断是否存在目录
  -e和!-e用来判断是否存在文件或目录
  -x和!-x用来判断文件是否可执行
```
### rewrite指令的最后一项参数为flag标记
```
1.last    相当于apache里面的[L]标记，表示rewrite。
2.break本条规则匹配完成后，终止匹配，不再匹配后面的规则。
3.redirect  返回302临时重定向，浏览器地址会显示跳转后的URL地址。
4.permanent  返回301永久重定向，浏览器地址会显示跳转后的URL地址。
```
* 使用last和break实现URI重写，浏览器地址栏不变。而且两者有细微差别，使用alias指令必须用last标记;使用proxy_pass指令时，需要使用break标记。Last标记在本条rewrite规则执行完毕后，会对其所在server{......}标签重新发起请求，而break标记则在本条规则匹配完成后，终止匹配。