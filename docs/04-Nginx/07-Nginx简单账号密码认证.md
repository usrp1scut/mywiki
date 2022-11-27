### 通过htpasswd实现，先安装apahce工具包

```bash
#centos
yum install httpd-tools
#debian、ubuntu
sudo apt install apache2-utils
```
### 创建登陆验证文件
```bash
touch /usr/local/nginx/.htpasswd
```

### 创建用户或修改用户密码

```bash
htpasswd -m /usr/local/nginx/.htpasswd admin
```

### 修改Nginx配置

```bash
vi /usr/local/nginx/conf/nginx.conf
```
在对应位置添加auth配置，可在location也可在server层

```nginx
        location /wiki {
            auth_basic "Wiki Login";
            auth_basic_user_file /usr/local/nginx/.htpasswd;
            alias   html/;
            index  index.html index.htm;
        }
```

### 测试配置，重载配置

```bash
 /usr/local/nginx/sbin/nginx -t
 /usr/local/nginx/sbin/nginx -s reload
```
