#### 需要终端命令行为bash,[下载地址](https://github.com/ahmetb/kubectx/blob/master/kubens)

### 安装过程

`wget https://github.com/ahmetb/kubectx/blob/master/kubens`

`chmod +x kubens`

`mv kubens /bin/`

### 用法

```
USAGE:
  kubens                    : list the namespaces in the current context
  kubens <NAME>             : change the active namespace of current context
  kubens -                  : switch to the previous namespace in this context
  kubens -c, --current      : show the current namespace
  kubens -h,--help          : show this message
```