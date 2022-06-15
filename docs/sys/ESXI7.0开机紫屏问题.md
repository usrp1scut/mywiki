#### 紫屏代码看基本就是CPU不兼容的问题了，因为CPU太新，VMware还没有放到最新的兼容列表里面（安装介质中有各个厂家的兼容元数据文件，包括Intel、AMD、海光等,文件主要为UC_AMD.B00、UC_INTEL.B00、UC_HYGON.B00）

#### 1.vSphere安装启动界面，安装shift + o 键（在那个倒计时5秒的启动界面

#### 2.启动代码的后面添加
```
cpuUniformityHardCheckPanic=FALSE
```