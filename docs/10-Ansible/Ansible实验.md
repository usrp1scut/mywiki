教程来源网络，仅供个人学习参考使用，所有需要的文件云盘地址：https://pan.quark.cn/s/fd6e9b89d3a3

## 1.1 Ansible介绍

Ansible是一种IT自动化工具。它可以配置系统，部署软件以及协调更高级的IT任务，例如持续部署，滚动更新。Ansible适用于管理企业IT基础设施，从具有少数主机的小规模到数千个实例的企业环境。Ansible也是一种简单的自动化语言，可以完美地描述IT应用程序基础结构。

具备以下三个特点：

 - 简单：减少学习成本   
 - 强大：协调应用程序生命周期 
 - 无代理：可预测，可靠和安全

使用文档： https://docs.ansible.com/ 

安装Ansible：`yum install ansible -y`

![](/img/k8s-2/ansible.png)

- Inventory：Ansible管理的主机信息，包括IP地址、SSH端口、账号、密码等
- Modules：任务均有模块完成，也可以自定义模块，例如经常用的脚本。
- Plugins：使用插件增加Ansible核心功能，自身提供了很多插件，也可以自定义插件。例如connection插件，用于连接目标主机。
- Playbooks：“剧本”，模块化定义一系列任务，供外部统一调用。Ansible核心功能。

## 1.2 主机清单

```conf
[webservers]
alpha.example.org
beta.example.org
192.168.1.100
www[001:006].example.com

[dbservers]
db01.intranet.mydomain.net
db02.intranet.mydomain.net
10.25.1.56
10.25.1.57
db-[99:101]-node.example.com
```

## 1.3 命令行使用

ad-hoc命令可以输入内容，快速执行某个操作，但不希望留存记录。

ad-hoc命令是理解Ansible和在学习playbooks之前需要掌握的基础知识。

一般来说，Ansible的真正能力在于剧本。

### 1、连接远程主机认证

SSH密码认证：

```conf
[webservers]
192.168.1.100:22 ansible_ssh_user=root ansible_ssh_pass=’123456’
192.168.1.101:22 ansible_ssh_user=root ansible_ssh_pass=’123456’
```

SSH密钥对认证：

```conf
[webservers]
10.206.240.111:22 ansible_ssh_user=root ansible_ssh_key=/root/.ssh/id_rsa 
10.206.240.112:22 ansible_ssh_user=root

也可以ansible.cfg在配置文件中指定：
[defaults]
private_key_file = /root/.ssh/id_rsa  # 默认路径
```

### 2、常用选项

| 选项                                  | 描述                     |
| ------------------------------------- | ------------------------ |
| -C, --check                           | 运行检查，不执行任何操作 |
| -e EXTRA_VARS,--extra-vars=EXTRA_VARS | 设置附加变量 key=value   |
| -u REMOTE_USER, --user=REMOTE_USER    | SSH连接用户，默认None    |
| -k, --ask-pass                        | SSH连接用户密码          |
| -b, --become                          | 提权，默认root           |
| -K, --ask-become-pass                 | 提权密码                 |

### 3、命令行使用

```bash
ansible all -m ping
ansible all -m ping
ansible all -m shell -a "ls /root" -u root -k 
ansible webservers -m copy –a "src=/etc/hosts dest=/tmp/hosts"
```

## 1.4 常用模块

ansible-doc –l 查看所有模块

ansible-doc –s copy 查看模块文档

 模块文档：https://docs.ansible.com/ansible/latest/modules/modules_by_category.html 

### 1、shell

在目标主机执行shell命令。

```yml
- name: 将命令结果输出到指定文件
  shell: somescript.sh >> somelog.txt
- name: 切换目录执行命令
  shell:
    cmd: ls -l | grep log
    chdir: somedir/
- name: 编写脚本
  shell: |
      if [ 0 -eq 0 ]; then
         echo yes > /tmp/result
      else
         echo no > /tmp/result
      fi
  args:
    executable: /bin/bash
```

### 2、copy

将文件复制到远程主机。

```yml
- name: 拷贝文件
  copy:
    src: /srv/myfiles/foo.conf
    dest: /etc/foo.conf
    owner: foo
    group: foo
    mode: u=rw,g=r,o=r
    # mode: u+rw,g-wx,o-rwx
    # mode: '0644'
    backup: yes
```

### 3、file

管理文件和文件属性。

```yml
- name: 创建目录
  file:
    path: /etc/some_directory
    state: directory
    mode: '0755'
- name: 删除文件
  file:
    path: /etc/foo.txt
    state: absent
- name: 递归删除目录
  file:
    path: /etc/foo
    state: absent
```

present，latest：表示安装

absent：表示卸载

### 4、yum

软件包管理。

```yml
- name: 安装最新版apache
  yum:
    name: httpd
    state: latest
- name: 安装列表中所有包
  yum:
    name:
      - nginx
      - postgresql
      - postgresql-server
    state: present
- name: 卸载apache包
  yum:
    name: httpd
    state: absent 
- name: 更新所有包
  yum:
    name: '*'
    state: latest
- name: 安装nginx来自远程repo
  yum:
    name: http://nginx.org/packages/rhel/7/x86_64/RPMS/nginx-1.14.0-1.el7_4.ngx.x86_64.rpm
    # name: /usr/local/src/nginx-release-centos-6-0.el6.ngx.noarch.rpm
    state: present
```

### 5、service/systemd

管理服务。

```yml
- name: 服务管理
  service:
    name: etcd
    state: started
    #state: stopped
    #state: restarted
    #state: reloaded
- name: 设置开机启动
  service:
    name: httpd
    enabled: yes
```

```yml
- name: 服务管理  
  systemd: 
	name=etcd 
	state=restarted 
	enabled=yes 
	daemon_reload=yes
```

### 6、unarchive

```yml
- name: 解压
  unarchive: 
    src=test.tar.gz 
    dest=/tmp
```

### 7、debug

执行过程中打印语句。

```yml
- debug:
    msg: System {{ inventory_hostname }} has uuid {{ ansible_product_uuid }}

- name: 显示主机已知的所有变量
  debug:
    var: hostvars[inventory_hostname]
    verbosity: 4
```

## 1.5 Playbook

Playbooks是Ansible的配置，部署和编排语言。他们可以描述您希望在远程机器做哪些事或者描述IT流程中一系列步骤。使用易读的YAML格式组织Playbook文件。

如果Ansible模块是您工作中的工具，那么Playbook就是您的使用说明书，而您的主机资产文件就是您的原材料。

与adhoc任务执行模式相比，Playbooks使用ansible是一种完全不同的方式，并且功能特别强大。

https://docs.ansible.com/ansible/latest/user_guide/playbooks.html

```yml
---
- hosts: webservers
  vars:
    http_port: 80
    server_name: www.ctnrs.com
  remote_user: root
  gather_facts: false
  tasks:
  - name: 安装nginx最新版
    yum: pkg=nginx state=latest
  - name: 写入nginx配置文件
    template: src=/srv/httpd.j2 dest=/etc/nginx/nginx.conf
    notify:
    - restart nginx
  - name: 确保nginx正在运行
    service: name=httpd state=started
  handlers:
    - name: restart nginx
      service: name=nginx state=reloaded
```

### 1、主机和用户

```yml
- hosts: webservers
  remote_user: lizhenliang
  become: yes
  become_user: root
```

ansible-playbook nginx.yaml -u lizhenliang -k -b -K 

### 2、定义变量

变量是应用于多个主机的便捷方式； 实际在主机执行之前，变量会对每个主机添加，然后在执行中引用。

- **命令行传递**

  ```
  -e VAR=VALUE
  ```

- **主机变量与组变量**

在Inventory中定义变量。

```conf
[webservers]
192.168.1.100 ansible_ssh_user=root hostname=web1
192.168.1.100 ansible_ssh_user=root hostname=web2

[webservers:vars]
ansible_ssh_user=root hostname=web1
```

- **单文件存储**

Ansible中的首选做法是不将变量存储在Inventory中。

除了将变量直接存储在Inventory文件之外，主机和组变量还可以存储在相对于Inventory文件的单个文件中。

组变量：

group_vars 存放的是组变量

`group_vars/all.yml`  表示所有主机有效，等同于`[all:vars]`

`grous_vars/etcd.yml` 表示etcd组主机有效，等同于`[etcd:vars]`

```bash
# vi /etc/ansible/group_vars/all.yml
work_dir: /data
# vi /etc/ansible/host_vars/webservers.yml
nginx_port: 80
```

- **在Playbook中定义**

```yml
- hosts: webservers
  vars:
    http_port: 80
    server_name: www.ctnrs.com
```

- **Register变量**

```yml
- shell: /usr/bin/uptime
  register: result
- debug:
    var: result
```

### 3、任务列表

每个play包含一系列任务。这些任务按照顺序执行，在play中，所有主机都会执行相同的任务指令。play目的是将选择的主机映射到任务。

```yml
  tasks:
  - name: 安装nginx最新版
    yum: pkg=nginx state=latest
```

### 4、语法检查与调试

语法检查：ansible-playbook  --check  /path/to/playbook.yaml

测试运行，不实际操作：ansible-playbook -C /path/to/playbook.yaml

debug模块在执行期间打印语句，对于调试变量或表达式，而不必停止play。与'when：'指令一起调试更佳。

```yml
  - debug: msg={{group_names}}
  - name: 主机名
    debug:
      msg: "{{inventory_hostname}}"
```

### 5、任务控制

如果你有一个大的剧本，那么能够在不运行整个剧本的情况下运行特定部分可能会很有用。

```yml
  tasks:
  - name: 安装nginx最新版
    yum: pkg=nginx state=latest
    tags: install
  - name: 写入nginx配置文件
    template: src=/srv/httpd.j2 dest=/etc/nginx/nginx.conf
    tags: config
```

使用：

```bash
ansible-playbook example.yml --tags "install"
ansible-playbook example.yml --tags "install,config"
ansible-playbook example.yml --skip-tags "install"
```

### 6、流程控制

条件：

```yml
tasks:
- name: 只在192.168.1.100运行任务
  debug: msg="{{ansible_default_ipv4.address}}"
  when: ansible_default_ipv4.address == '192.168.1.100'
```

循环：

```yml
tasks:
- name： 批量创建用户
  user: name={{ item }} state=present groups=wheel
  with_items:
     - testuser1
     - testuser2
```

```yml
- name: 解压
  copy: src={{ item }} dest=/tmp
  with_fileglob:
    - "*.txt"
```

常用循环语句：

|   语句   |  描述    |
| ---- | ---- |
| with_items    | 标准循环     |
| with_fileglob | 遍历目录文件 |
| with_dict     | 遍历字典     |

### 7、模板

```yml
 vars:
    domain: "www.ctnrs.com"
 tasks:
  - name: 写入nginx配置文件
    template: src=/srv/server.j2 dest=/etc/nginx/conf.d/server.conf
```

```conf
# server.j2
{% set domain_name = domain %}
server {
   listen 80;
   server_name {{ domain_name }};
   location / {
        root /usr/share/html;
   }
}
```

在jinja里使用ansible变量直接 `{{ }}`引用。使用ansible变量赋值jinja变量不用`{{ }}`引用。

**定义变量**：

```
{% set local_ip = inventory_hostname %}
```

**条件和循环**：

```
{% set list=['one', 'two', 'three'] %}
{% for i in list %}
	{% if i == 'two' %}
		-> two
	{% elif loop.index == 3 %}
		-> 3
	{% else %}
		{{i}}
	{% endif %}
{% endfor %}
```

例如：生成连接etcd字符串

```
{% for host in groups['etcd'] %}
	https://{{ hostvars[host].inventory_hostname }}:2379
	{% if not loop.last %},{% endif %}
{% endfor %} 
```

里面也可以用ansible的变量。

## 1.6 Roles

Roles是基于已知文件结构自动加载某些变量文件，任务和处理程序的方法。按角色对内容进行分组，适合构建复杂的部署环境。

### 1、定义Roles

Roles目录结构：

```
site.yml
webservers.yml
fooservers.yml
roles/
   common/
     tasks/
     handlers/
     files/
     templates/
     vars/
     defaults/
     meta/
   webservers/
     tasks/
     defaults/
     meta/
```

- `tasks` -包含角色要执行的任务的主要列表。
- `handlers` -包含处理程序，此角色甚至在此角色之外的任何地方都可以使用这些处理程序。
- `defaults`-角色的默认变量
- `vars`-角色的其他变量
- `files` -包含可以通过此角色部署的文件。
- `templates` -包含可以通过此角色部署的模板。
- `meta`-为此角色定义一些元数据。请参阅下面的更多细节。



通常的做法是从`tasks/main.yml`文件中包含特定于平台的任务：

```
# roles/webservers/tasks/main.yml
- name: added in 2.4, previously you used 'include'
  import_tasks: redhat.yml
  when: ansible_facts['os_family']|lower == 'redhat'
- import_tasks: debian.yml
  when: ansible_facts['os_family']|lower == 'debian'

# roles/webservers/tasks/redhat.yml
- yum:
    name: "httpd"
    state: present

# roles/webservers/tasks/debian.yml
- apt:
    name: "apache2"
    state: present
```

### 2、使用角色

```
# site.yml
- hosts: webservers
  roles:
    - common
    - webservers


定义多个：
- name: 0
  gather_facts: false
  hosts: all 
  roles:
    - common

- name: 1
  gather_facts: false
  hosts: all 
  roles:
    - webservers
```

### 3、角色控制

```
- name: 0.系统初始化
  gather_facts: false
  hosts: all 
  roles:
    - common
  tags: common 
```

## 1.7 自动化部署K8S（离线版）

### 1、 熟悉二进制部署K8S步骤

1. **服务器规划**

| **角色**                | **IP**                             | **组件**                                                     |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------ |
| k8s-master1             | 192.168.31.61                      | kube-apiserver  kube-controller-manager  kube-scheduler  etcd |
| k8s-master2             | 192.168.31.62                      | kube-apiserver  kube-controller-manager  kube-scheduler      |
| k8s-node1               | 192.168.31.63                      | kubelet  kube-proxy  docker  etcd                            |
| k8s-node2               | 192.168.31.66                      | kubelet  kube-proxy  docker  etcd                            |
| Load Balancer（Master） | 192.168.31.61  192.168.31.60 (VIP) | nginx  keepalived                                            |
| Load Balancer（Backup） | 192.168.31.62                      | nginx keepalived    |

2. **系统初始化**
   1. 关闭selinux，firewalld
   2. 关闭swap
   3. 时间同步
   4. 写hosts
3. **Etcd集群部署**
   1. 生成etcd证书
   2. 部署三个etcd集群
   3. 查看集群状态
4. **部署Master**
   1. 生成apiserver证书
   2. 部署apiserver、controller-manager和scheduler组件
   3. 启动TLS Bootstrapping
5. **部署Node**
   1. 安装Docker
   2. 部署kubelet和kube-proxy
   3. 在Master上允许为新Node颁发证书
   4. 授权apiserver访问kubelet
6. **部署插件（准备好镜像）**
   1. Flannel
   2. Web UI
   3. CoreDNS
   4. Ingress Controller
7. **Master高可用**
   1. 增加Master节点（与Master1一致）
   2. 部署Nginx负载均衡器
   3. Nginx+Keepalived高可用
   4. 修改Node连接VIP                            


### 2、Roles组织K8S各组件部署解析

编写建议：

1. 梳理流程和Roles结构
2. 如果配置文件有不固定内容，使用jinja渲染
3. 人工干预改动的内容应统一写到一个文件中

### 3、下载所需文件

> 确保所有节点系统时间一致

所有需要的文件云盘地址：https://pan.quark.cn/s/fd6e9b89d3a3

找到并上传Ansible部署文件`.\第 1 章：Ansible 自动化部署 K8S 集群\工具\ansible-install-k8s-master`：

```
cd ansible-install-k8s
```

找到上传软件包并解压：

```
tar zxf binary_pkg.tar.gz
```
### 4、修改Ansible文件

修改hosts文件，根据规划修改对应IP和名称。

```
vi hosts
```
修改group_vars/all.yml文件，修改软件包目录和证书可信任IP。

```
vim group_vars/all.yml
software_dir: '/root/binary_pkg'
...
cert_hosts:
  k8s:
  etcd:
```

### 5、一键部署
**架构图**

![](/img/k8s-2/single-master.jpg)

​																				单Master架构


![avatar](/img/k8s-2/multi-master.jpg)

​																					多Master架构

**部署命令**
单Master版：

```
ansible-playbook -i hosts single-master-deploy.yml -uroot -k
```
多Master版：
```
ansible-playbook -i hosts multi-master-deploy.yml -uroot -k
```

### 6、部署控制
如果安装某个阶段失败，可针对性测试.

例如：只运行部署插件
```
ansible-playbook -i hosts single-master-deploy.yml -uroot -k --tags addons
```



示例参考：https://github.com/ansible/ansible-examples
