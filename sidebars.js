module.exports = {
  docs: [
    'Home',
    {
      type: 'category',
      label: '网络',
      items: [
        'net/frp实现内网穿透',
        'net/tcp端口探测工具paping',
        'net/各系统查看路由表命令',
        'net/配置dnsmasq作为内网DNS',
      ],
    },
    {
      type: 'category',
      label: '系统',
      items: [
        'sys/shell监控脚本',
        'sys/gitlab-ce管理设置保存时出现500报错',
        'sys/Linux常用内核参数调优',
        'sys/Linux修改最大打开文件数',
        'sys/gitlab恢复账号密码登陆',
        'sys/ESXI7.0开机紫屏问题',
      ],
    },
    {
      type: 'category',
      label: 'Kubernetes',
      items: [
        'k8s/kubeadm搭建3节点k8s集群',
        'k8s/docker常用配置',
        'k8s/namespace切换工具kubens',
      ],
    },

    {
      type: 'category',
      label: 'istio服务网格',
      items: [
      ],
    },

    {
      type: 'category',
      label: 'Nginx',
      items: [
        'nginx/nginx常用配置',
        'nginx/nginx配置代理缓存自建CDN',
        'nginx/nginx配置访问限速',
        'nginx/nginx_stream四层端口转发',
        'nginx/限制UserAgent访问',
        'nginx/gzip压缩静态资源',


      ],
    },
    {
      type: 'category',
      label: '监控日志',
      items: [
      ],
    },

    {
      type: 'category',
      label: '杂七杂八',
      items: [
        'another/解决网页需登陆后复制',
        'another/使用acme生成泛域名证书',
        'another/iMac检测与系统恢复',
        'another/基于Docusaurus及gitlab pages搭建博客',

      ],
    },

    {
      type: 'category',
      label: '项目管理',
      items: [
        'pm/项目管理基础',
        'pm/工作中的项目管理思维',
      ],
    },

  ],
};

