* [acme.sh](https://github.com/acmesh-official/acme.sh/wiki/%E8%AF%B4%E6%98%8E)工具可以自动化申请Let's Encrypt 证书，并可通过api自动化创建dns解析完成验证，acme.sh 目前支持 cloudflare, dnspod, cloudxns, godaddy 以及 ovh 等数十种解析商的自动集成.

### 1.手动DNS创建
``` 
#获取安装acme工具
curl  https://get.acme.sh | sh
#设置命令别名
alias acme.sh=~/.acme.sh/acme.sh
#注册账户
acme.sh --register-account -m aa@example
#申请证书，这里会输出TXT记录，需要配置到DNS解析
acme.sh  --issue  --dns  -d example.com -d *.example.com \
 --yes-I-know-dns-manual-mode-enough-go-ahead-please
#验证域名所有
acme.sh  --renew  -d example.com -d *.example.com \
 --yes-I-know-dns-manual-mode-enough-go-ahead-please
#安装证书
acme.sh --install-cert -d example.com -d *.example.com \
 --key-file         /path/to/ssl/nginx.key \ 
 --fullchain-file   /path/to/ssl/nginx.crt
```
### 2.自动创建
以 dnspod 为例, 你需要先登录到 dnspod 账号, 生成你的 api id 和 api key, 都是免费的. 然后:
```
export DP_Id="1234"

export DP_Key="sADDsdasdgdsf"

acme.sh   --issue   --dns dns_dp   -d aa.com  -d www.aa.com
```

证书就会自动生成了. 这里给出的 api id 和 api key 会被自动记录下来, 将来你在使用 dnspod api 的时候, 就不需要再次指定了. 直接生成就好了:
```
acme.sh  --issue   -d  mydomain2.com   --dns  dns_dp
```