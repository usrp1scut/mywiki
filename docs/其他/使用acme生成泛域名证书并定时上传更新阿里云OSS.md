* [acme.sh](https://github.com/acmesh-official/acme.sh/wiki/%E8%AF%B4%E6%98%8E)工具可以自动化申请Let's Encrypt 证书，并可通过api自动化创建dns解析完成验证，acme.sh 目前支持 cloudflare, dnspod, cloudxns, godaddy 以及 ovh 等数十种解析商的自动集成.

现在新规则免费证书都只有三个月，很麻烦，提供一种思路以自动更新

## 自动创建证书
我的静态站点和域名DNS都是阿里云的

配置acme使用阿里云API自动申请证书
```bash
#安装
curl https://get.acme.sh | sh
#配置证书机构为letsencrypt，默认的需要登陆
acme.sh --set-default-ca --server letsencrypt
#设置阿里云api key，需要在阿里云控制台用户管理创建并授权

export Ali_Key="<key>"
export Ali_Secret="<secret>"

./acme.sh --issue --dns dns_ali -d example.com -d *.example.com
```

证书就会自动生成了. root用户执行默认在/root/.acme.sh路径

这里给出的 api id 和 api key 会被自动记录下来, crontab里面已经有任务会每天检测证书过期时间自动更新:

```bash
# crontab -l
17 13 * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" > /dev/null
```

## 上传证书到OSS

使用SDk调用对象存储api,这里我用的python，定时任务每月上传一次，实际三个月才过期，可以按需调整

```bash
#crontab -l
0 10 23 */2 * python /root/oss_ssl/oss_ssl.py 
```
```py title=oss_ssl.py
# -*- coding: utf-8 -*-
import oss2
from oss2.credentials import EnvironmentVariableCredentialsProvider

# 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
auth = oss2.ProviderAuthV4(EnvironmentVariableCredentialsProvider())

# 填写Bucket所在地域对应的Endpoint。以华东1（杭州）为例，Endpoint填写为https://oss-cn-hangzhou.aliyuncs.com。
endpoint = "https://oss-cn-shenzhen.aliyuncs.com"
# 填写Endpoint对应的Region信息，例如cn-hangzhou。注意，v4签名下，必须填写该参数
region = "cn-shenzhen"

# examplebucket填写存储空间名称。
bucket = oss2.Bucket(auth, endpoint, "bucket-name", region=region)

# 填写自定义域名
domain = 'www.example.com'

# 填写旧版证书ID，首次执行不用管，第二次执行起把证书ID放进来可以覆盖写入，避免每次都创建新的证书
previous_cert_id = '1xxxxx7-cn-hangzhou'
with open("/root/.acme.sh/example.com_ecc/example.com.cer") as f:
    certificate = f.read()
# 设置证书私钥。
with open("/root/.acme.sh/example.com_ecc/example.com.key") as f:
    private_key = f.read()

cert = oss2.models.CertInfo(cert_id=previous_cert_id, certificate=certificate, private_key=private_key, force=True)
# 首次执行不传cert_id
# 通过force=True设置强制覆盖旧版证书。
# 通过delete_certificate选择是否删除证书。设置为delete_certificate=True表示删除证书，设置为delete_certificate=False表示不删除证书。
# cert = oss2.models.CertInfo(certificate=certificate, private_key=private_key, force=True, delete_certificate=False)
input = oss2.models.PutBucketCnameRequest(domain, cert)
bucket.put_bucket_cname(input)
```