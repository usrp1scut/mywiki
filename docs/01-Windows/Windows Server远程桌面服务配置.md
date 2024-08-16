**http://www.datahelp.cn/news/show-114.html**
## 一、服务器配置与授权
### 1、添加远程桌面授权服务
* 第一步：服务器管理 - 添加角色和功能打开添加角色和功能向导窗口，选择基于角色或给予功能安装：

![](/img/win_rds/image1.jpeg)

* 第二步：添加远程桌面会话主机和远程桌面授权功能：

![](/img/win_rds/image2.jpeg)

![](/img/win_rds/image3.jpeg)

以上配置完成后即可使用多于2用户同时登陆，但使用期限为120天，再次登陆会有如下提示：

![](/img/win_rds/image4.jpeg)
### 2、添加远程桌面授权许可

添加之前将时间调至未来的一个时间，用来增加使用期限

打开远程桌面授权管理器：

![](/img/win_rds/image5.jpeg)

此时为未激活状态：

![](/img/win_rds/image6.jpeg)

右键选择激活服务器，打开服务器激活向导：

![](/img/win_rds/image7.jpeg)

连接方法选择Web浏览器：

![](/img/win_rds/image8.jpeg)

![](/img/win_rds/image9.jpeg)

根据提示打开远程桌面授权网站，选择启用许可证服务器：

![](/img/win_rds/image10.jpeg)

输入产品ID，其余信息随意填写：

![](/img/win_rds/image11.jpeg)

获取并输入许可证ID：

![](/img/win_rds/image12.jpeg)

![](/img/win_rds/image13.jpeg)

即可激活许可证服务器：

![](/img/win_rds/image14.jpeg)

许可证程序选择企业协议：

![](/img/win_rds/image15.jpeg)

选择每用户访问许可，协议号码可以填写6565792,4954438,6879321或者5296992，数量可以填写任意：

![](/img/win_rds/image16.jpeg)

获取许可证密钥包 ID ：

![](/img/win_rds/image17.jpeg)

![](/img/win_rds/image18.jpeg)

此时激活状态为已激活：

![](/img/win_rds/image19.jpeg)

至此，整个安装过程已全部完成。
### 3.  配置远程桌面会话主机授权服务器
1. 在**本地策略组**界面**，**依次打开**计算机配置-管理模板-Windows组件-****远程桌面服务**

  ![](/img/win_rds/image20.png)

2. 启用**使用指定远程桌面许可证服务器**和**设置远程桌面授权模式,**两组策略。

    ![](/img/win_rds/image21.png)

    ![](/img/win_rds/image22.png)

    ![](/img/win_rds/image23.png)

3. 返回到“服务器管理器”，切换到“远程桌面服务”界面选择“服务器”。选中你的服务器名称并且右击选中“RD授权诊断程序 ”。查看是否正常。
  
    ![](/img/win_rds/image24.png)

4. 最后，你就可以启用多用户同时远程登陆互不影响了。且只需要给用户分配Remote Desktop Users组即可无需管理员权限
## 二、临时许可证续期
### 1、如果远程桌面授权服务器提供的临时许可证过期，则将无法远程登陆，解决方法如下：
第一步：使用“mstsc /admin /v:目标ip”来强制登录服务器（注意只能管理员身份登陆）

![](/img/win_rds/image25.jpeg)

第二步：调整日期为未来的时间（获得更长的时间，不更改可再次获得120天授权）

![](/img/win_rds/image26.jpeg)

第三步：删除注册表项中类型为binary的项
`HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\RCM\\GracePeriod`
:::tip
注：注册表项可能无法删除，需要修改权限，方法如下：
运行 gpedit.msc，在用户配置 - 管理模板 - 系统中修改组织访问注册表编辑工具为已禁用

![](/img/win_rds/image27.jpeg)

更改GracePeriod项权限

![](/img/win_rds/image28.jpeg)

![](/img/win_rds/image29.jpeg)

![](/img/win_rds/image30.jpeg)

删除 GracePeriod 项，重启机器，改回时间。
:::
