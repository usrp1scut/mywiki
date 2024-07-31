
auditd 是Linux系统中的一个审计框架，用于监视和记录系统活动，以帮助管理员追踪和审计系统事件。它提供了一种机制，可以捕获关于文件访问、进程执行、用户登录、系统配置更改等方面的信息。

* auditctl : 即时控制审计守护进程的行为的工具，比如如添加规则等等。
* /etc/audit/audit.rules : 记录审计规则的文件。
* aureport : 查看和生成审计报告的工具。
* ausearch : 查找审计事件的工具
* auditspd : 转发事件通知给其他应用程序，而不是写入到审计日志文件中。
* autrace : 一个用于跟踪进程的命令。
* /etc/audit/auditd.conf : auditd工具的配置文件。

### 查看规则
```bash
auditctl -l
```
### 添加规则
```bash
auditctl -w <path-to-file-or-directory> -p rwxa -k test1
```

选项
* -w path : 指定要监控的路径，上面的命令指定了监控的文件路径 /etc/passwd
* -p : 指定触发审计的文件/目录的访问权限，后面添加指定的触发条件，r 读取权限，w 写入权限，x 执行权限，a 属性（attr）
* -k : 关键字，用于查看日志时过滤用的标签

### 查看审计日志
```bash
ausearch -k test1
```

以如下形式输出
```
time->Wed May 22 10:03:50 2024
type=PROCTITLE msg=audit(1716343430.635:723306): proctitle=726D002D69002F414D4355572F737562536974652F74657374
type=PATH msg=audit(1716343430.635:723306): item=1 name="/test" inode=18359932 dev=fd:00 mode=0100644 ouid=0 ogid=0 rdev=00:00 nametype=DELETE cap_fp=0 cap_fi=0 cap_fe=0 cap_fver=0 cap_frootid=0
type=PATH msg=audit(1716343430.635:723306): item=0 name="/" inode=18359931 dev=fd:00 mode=040755 ouid=0 ogid=0 rdev=00:00 nametype=PARENT cap_fp=0 cap_fi=0 cap_fe=0 cap_fver=0 cap_frootid=0
type=CWD msg=audit(1716343430.635:723306): cwd="/etc/audit"
type=SYSCALL msg=audit(1716343430.635:723306): arch=c000003e syscall=263 success=yes exit=0 a0=ffffff9c a1=55771fbd0640 a2=0 a3=0 items=2 ppid=2720126 pid=2743146 auid=933 uid=0 gid=0 euid=0 suid=0 fsuid=0 egid=0 sgid=0 fsgid=0 tty=pts2 ses=3514 comm="rm" exe="/usr/bin/rm" key="amcuw"
```