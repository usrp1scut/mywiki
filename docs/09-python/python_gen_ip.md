# python根据IP地址范围生成所有IP地址列表

```python
#!/usr/bin/env python

# -*- coding: utf-8 -*-

startIP = '183.2.143.0'
endIP = '183.2.144.255'

def ip2num(ip):

    ip = [int(x) for x in ip.split('.')]

    return ip[0] << 24 | ip[1] << 16 | ip[2] << 8 | ip[3]

def num2ip(num):

    return '%s.%s.%s.%s' % (

        (num & 0xff000000) >> 24,

        (num & 0x00ff0000) >> 16,

        (num & 0x0000ff00) >> 8,

        num & 0x000000ff

    )

def gen_ips(start, end):

    # if num & 0xff 过滤掉 最后一段为 0 的IP

    return [num2ip(num) for num in range(start, end + 1) if num & 0xff]

if __name__ == '__main__':
    start = ip2num(startIP)
    end = ip2num(endIP)
    L = []
    L = gen_ips(start,end)
    F = open(r'1.txt','w')
    for i in L:
        F.write(i+'\n')
    F.close()
    print(L)

```