// Each step is a logical exchange or flight, not a captured frame.
const node = (name, address, kind = 'server') => ({name, address, kind});
const step = (from, to, label, wire, detail) => ({from, to, label, wire, detail});
const client = node('客户端', '192.0.2.10', 'client');
const server = node('服务端', '198.51.100.20');
const browser = node('浏览器', '192.0.2.10', 'client');
const web = node('网站', 'www.example.com');
const mail = node('邮件服务', 'mail.example.com');
export const groups = ['网络与传输', '应用协议', '安全连接'];

export const lessons = [
  {
    id: 'tcp', name: 'TCP', topic: '可靠传输', group: groups[0], refs: [9293],
    title: '从三次握手到第一个字节', intro: '双方各自选择初始序号，再用确认号告诉对方，下一个期望收到的字节在哪里。',
    nodes: [client, server], steps: [
      step(0, 1, '发起连接', 'SYN  ·  Seq=1000', '客户端发送初始序号 1000。SYN 占用一个序号，即使它还没有携带应用数据。'),
      step(1, 0, '确认并同步', 'SYN, ACK  ·  Seq=4000  Ack=1001', '服务端确认客户端的 SYN，同时通告自己的初始序号 4000。'),
      step(0, 1, '完成握手', 'ACK  ·  Seq=1001  Ack=4001', '服务端收到这个确认后，双方都进入已建立连接的状态。单独的 ACK 不消耗序号。'),
      step(0, 1, '发送数据', 'ACK  ·  Seq=1001  Ack=4001  Len=100', '这 100 字节占用序号 1001 到 1100。字节序号使接收端能重组有序的数据流。'),
      step(1, 0, '累计确认', 'ACK  ·  Seq=4001  Ack=1101', '确认号 1101 表示此前的字节已连续收到。它确认传输层收到了数据，不代表应用已经处理完毕。'),
    ],
  },
  {
    id: 'udp', name: 'UDP', topic: '数据报', group: groups[0], refs: [768, 5905],
    title: '用一个数据报校时', intro: '一次 NTP 查询只需交换两个 UDP 数据报。用来估算时钟偏移的时间戳由 NTP 携带。',
    nodes: [client, node('时间服务器', '198.51.100.123')], steps: [
      step(0, 1, '请求服务器时间', 'UDP  53000 → 123  ·  NTP client  T1', '客户端记录发送时刻 T1，然后直接发送校时请求。UDP 在发送前没有连接握手。'),
      step(1, 0, '返回时间戳', 'UDP  123 → 53000  ·  NTP server  T1 / T2 / T3', '服务端带回请求的发送时刻以及自己的接收和发送时刻。客户端再记录到达时刻 T4。若响应丢失，由应用决定是否重试。'),
    ],
  },
  {
    id: 'ip', name: 'IP', topic: '逐跳转发', group: groups[0], refs: [791],
    title: '一份 IPv4 数据报如何跨网段', intro: '在这个没有 NAT 的路径上，目的 IP 始终是最终主机。每台路由器根据自己的路由表选择下一跳。',
    nodes: [client, node('网关', '192.0.2.1', 'router'), node('边界路由', '203.0.113.1', 'router'), server], steps: [
      step(0, 1, '交给默认网关', 'Dst=198.51.100.20  ·  TTL=64', '客户端发现目的地址在本地网段外，将承载数据报的以太网帧发给默认网关的 MAC 地址。'),
      step(1, 2, '选择下一跳', 'Dst=198.51.100.20  ·  TTL=63', '网关按目的 IP 匹配路由，转发时递减 TTL，并为出接口的链路重新封装。'),
      step(2, 3, '送达主机', 'Dst=198.51.100.20  ·  TTL=62', '边界路由器把数据报发到目的主机所在链路。主机再按 IP 首部的协议字段交给上层。'),
    ],
  },
  {
    id: 'icmp', name: 'ICMP', topic: '连通性诊断', group: groups[0], refs: [792],
    title: '一次 ping 的往返', intro: 'IPv4 的 ping 用标识符和序号配对回显请求与应答，并在发起端测量往返时间。',
    nodes: [client, server], steps: [
      step(0, 1, '回显请求', 'Echo Request  ·  Type=8  Code=0  ID=42  Seq=1', '请求直接封装在 IPv4 中。ICMP 没有 TCP 或 UDP 的端口号。'),
      step(1, 0, '回显应答', 'Echo Reply  ·  Type=0  Code=0  ID=42  Seq=1', '应答带回相同的标识符、序号和数据。超时也可能是回显被过滤，仅凭超时无法判定主机离线。'),
    ],
  },
  {
    id: 'dns', name: 'DNS', topic: '域名解析', group: groups[1], refs: [1034, 1035],
    title: '一次没有命中缓存的解析', intro: '以 www.example.com 的示例 A 记录为线索，看递归解析器怎样沿根区、顶级域和权威区找到答案。',
    nodes: [client, node('递归端', '192.0.2.53'), node('根服务器', '根区'), node('顶级域', '.com'), node('权威端', 'example.com')], steps: [
      step(0, 1, '请求递归解析', 'A www.example.com  ·  RD=1', '客户端希望递归解析器替它找回最终答案。本例假设没有可用的委派和答案缓存。'),
      step(1, 2, '从根区查询', 'A www.example.com  ·  RD=0', '解析器从已知的根服务器开始迭代查询。本例使用完整名称，实际解析器也可以使用查询名最小化。'),
      step(2, 1, '取得顶级域委派', 'Authority: com. NS …', '根服务器提供 .com 的名称服务器线索。委派指向下一层，尚未给出网站地址。'),
      step(1, 3, '询问顶级域', 'A www.example.com  ·  RD=0', '解析器将查询发往 .com 的名称服务器。'),
      step(3, 1, '取得权威区委派', 'Authority: example.com. NS …', '解析器获得 example.com 的权威名称服务器信息。'),
      step(1, 4, '查询权威记录', 'A www.example.com  ·  RD=0', '这次请求到达保存该名称记录的权威服务器。'),
      step(4, 1, '得到示例地址', 'A 198.51.100.20  ·  TTL=300  ·  AA=1', '权威端返回本例设定的 A 记录和缓存时限。300 秒是此记录的示例值。'),
      step(1, 0, '交付查询结果', 'A 198.51.100.20  ·  RA=1', '递归端将结果返回客户端。随后的相同查询可以在记录有效期内利用缓存。'),
    ],
  },
  {
    id: 'dhcp', name: 'DHCP', topic: '地址租约', group: groups[1], refs: [2131],
    title: '一台新设备领取 IPv4 地址', intro: '在同一广播域、没有中继的示例中，设备用四条消息完成第一次地址租用。',
    nodes: [node('新设备', '初始地址 0.0.0.0', 'client'), node('租约服务器', '192.0.2.1')], steps: [
      step(0, 1, '发现服务器', 'DHCPDISCOVER  ·  UDP 68 → 67  ·  广播', '设备尚无可用地址，向本地广播域寻找服务器。图中显示接收广播并响应的一台服务器。'),
      step(1, 0, '提供租约', 'DHCPOFFER  ·  yiaddr=192.0.2.80', '服务器提出可分配地址，并提供租期等参数。其他服务器也可能提出不同的租约。'),
      step(0, 1, '选择报价', 'DHCPREQUEST  ·  Requested IP=192.0.2.80', '设备广播选中的地址和服务器标识，使其他报价方也能知道它选择了谁。'),
      step(1, 0, '确认配置', 'DHCPACK  ·  Lease=3600 s', '服务器确认租约。设备检查地址冲突后使用配置，并在租约到期前尝试续租。'),
    ],
  },
  {
    id: 'http', name: 'HTTP', topic: '请求与缓存', group: groups[1], refs: [9110, 9111],
    title: '浏览器怎样复用缓存', intro: '同一资源被访问两次。第一次下载正文，第二次用 ETag 向服务器验证已有副本。',
    nodes: [browser, web], steps: [
      step(0, 1, '获取页面', 'GET /guide HTTP/1.1  ·  Host: www.example.com', '本例从已经建立的连接开始。请求方法是 GET，目标资源是 /guide。'),
      step(1, 0, '返回内容和标识', '200 OK  ·  ETag: "v1"  ·  Cache-Control: no-cache', '浏览器可以保存响应，但再次使用前要验证。ETag 为这个版本的资源提供标识。'),
      step(0, 1, '验证已有副本', 'GET /guide  ·  If-None-Match: "v1"', '浏览器在下一次请求中带上已保存的标识。'),
      step(1, 0, '允许复用', '304 Not Modified  ·  ETag: "v1"', '资源仍与标识匹配。304 不携带正文，浏览器使用本地保存的内容。'),
    ],
  },
  {
    id: 'smtp', name: 'SMTP', topic: '发送邮件', group: groups[1], refs: [5321],
    title: '一封邮件怎样交给下一站', intro: '在已经问候完毕的 SMTP 会话中，先声明投递信封，再传输邮件正文。每一步都要看服务器的回复。',
    nodes: [node('发送方', 'relay.example.org', 'client'), mail], steps: [
      step(0, 1, '声明发件地址', 'MAIL FROM:<ops@example.org>', '这里设置的是退信使用的信封地址，它可以与正文中的 From 字段不同。'),
      step(1, 0, '接受发件地址', '250 OK', '服务器接受这一笔邮件事务的发件地址。'),
      step(0, 1, '指定收件地址', 'RCPT TO:<team@example.com>', '每个信封收件人分别提交，服务器可以独立接受或拒绝。'),
      step(1, 0, '接受收件地址', '250 OK', '至少一个收件人被接受后，发送方可以请求传输内容。'),
      step(0, 1, '请求发送内容', 'DATA', '发送方先等待服务器准备好接收邮件。'),
      step(1, 0, '允许输入正文', '354 Start mail input', '服务器进入接收模式，此时才开始发送邮件头与正文。'),
      step(0, 1, '结束正文', 'Subject: Status …  ·  <CRLF>.<CRLF>', '正文以单独一行的句点结束。正文中原本以句点开头的行需要做点转义。'),
      step(1, 0, '接收邮件', '250 OK: queued', '此刻这台服务器已接下投递责任。最终收件人是否已经读到邮件，是另一件事。'),
    ],
  },
  {
    id: 'pop3', name: 'POP3', topic: '下载邮件', group: groups[1], refs: [1939],
    title: '取回一封邮件', intro: '从已认证的 POP3 会话开始，查看邮箱统计，下载第一封邮件，然后正常退出。',
    nodes: [client, mail], steps: [
      step(0, 1, '查询统计', 'STAT', '客户端询问当前邮箱的邮件数和总字节数。'),
      step(1, 0, '返回统计', '+OK 1 240', '邮箱中有一封邮件，本例总大小为 240 字节。'),
      step(0, 1, '取回内容', 'RETR 1', '客户端按当前会话中的编号请求第一封邮件。'),
      step(1, 0, '传送整封邮件', '+OK 240 octets  ·  邮件内容  ·  终止行 .', '服务器用多行响应传送邮件。单纯读取不会标记邮件删除。'),
      step(0, 1, '结束会话', 'QUIT', '本例没有发送 DELE，退出后邮件仍在邮箱中。'),
      step(1, 0, '确认退出', '+OK signing off', '服务器结束会话并关闭连接。'),
    ],
  },
  {
    id: 'imap', name: 'IMAP', topic: '同步邮箱', group: groups[1], refs: [9051],
    title: '同步收件箱中的已读状态', intro: '在已认证的会话中，客户端打开邮箱，并修改一封邮件的标志。服务器保存的状态可以供其他设备同步。',
    nodes: [client, mail], steps: [
      step(0, 1, '打开收件箱', 'A1 SELECT INBOX', 'A1 是命令标签，用于将完成响应对应回这条命令。'),
      step(1, 0, '报告邮箱状态', '* 3 EXISTS  …  A1 OK [READ-WRITE]', '服务器报告邮件数和其他选择结果，最后用带 A1 的应答确认操作完成。'),
      step(0, 1, '读取邮件标志', 'A2 FETCH 1 (UID FLAGS)', '客户端取第一封邮件的 UID 和标志。序号可能变化，UID 需结合本邮箱的 UIDVALIDITY 使用。'),
      step(1, 0, '返回邮件标识', '* 1 FETCH (UID 42 FLAGS ())  …  A2 OK', '客户端现在知道目标邮件的 UID 是 42，当前没有已读标志。'),
      step(0, 1, '写入已读状态', 'A3 UID STORE 42 +FLAGS (\\Seen)', '以 UID 定位邮件，添加已读标志，保留其余标志。'),
      step(1, 0, '确认更新', '* 1 FETCH (UID 42 FLAGS (\\Seen))  …  A3 OK', '邮箱状态已更新。其他客户端同步该邮箱时也能得到这个标志。'),
    ],
  },
  {
    id: 'ftp', name: 'FTP', topic: '双连接传输', group: groups[1], refs: [959, 2428],
    title: '被动模式为何需要第二条连接', intro: '已登录的客户端经控制连接发命令，再用单独的数据连接取文件。图中分别标出同一服务器的两个端口。',
    nodes: [client, node('控制端口', '服务端 :21'), node('数据端口', '服务端 :49152')], steps: [
      step(0, 1, '请求被动端口', 'EPSV', '客户端要求服务器监听一个数据端口。'),
      step(1, 0, '返回监听端口', '229 Entering Extended Passive Mode (|||49152|)', '客户端沿用控制连接对端的地址，只更换目标端口。'),
      step(0, 2, '连接数据端口', 'TCP connect → 49152', '客户端主动建立第二条 TCP 连接。在该被动模式示例中两条连接都由客户端发起。'),
      step(0, 1, '请求文件', 'RETR report.txt', '取文件的命令仍发在原控制连接上。'),
      step(1, 0, '准备传输', '150 Opening data connection', '这是初步响应，并不表示整个文件已经传完。'),
      step(2, 0, '传送文件', 'report.txt  ·  文件字节流', '文件内容经数据连接返回。流模式下，这条连接关闭时表示文件结束。'),
      step(1, 0, '确认完成', '226 Transfer complete', '最终状态经控制连接返回，控制连接还可以用于下一条命令。'),
    ],
  },
  {
    id: 'https', name: 'HTTPS', topic: '安全访问', group: groups[2], refs: [9110, 9846],
    title: '在加密通道里取一个页面', intro: '这里选用 HTTP/1.1、TCP 和 TLS 1.3，从 TCP 已连接的时刻开始。图中将同向连续的握手消息合并展示。',
    nodes: [browser, web], steps: [
      step(0, 1, '协商加密参数', 'ClientHello  ·  server_name=www.example.com', '浏览器发起 TLS 握手，给出支持的参数与密钥共享信息。'),
      step(1, 0, '证明网站身份', 'ServerHello … Certificate … Finished', '网站选择参数，并发送证书和握手证明。浏览器校验证书链、有效期、目标主机名及握手签名。'),
      step(0, 1, '完成握手', 'Finished', '浏览器发送握手完整性校验。此例采用完整握手，没有使用早期数据。'),
      step(0, 1, '发送页面请求', 'TLS Application Data  ·  内层 GET /guide', 'HTTP 请求在 TLS 记录中加密传送，图中展示浏览器加密前看到的语义。'),
      step(1, 0, '接收页面内容', 'TLS Application Data  ·  内层 200 OK', '浏览器解密并校验记录，取出 HTTP 响应交给页面渲染。'),
    ],
  },
  {
    id: 'tls', name: 'TLS', topic: '密钥协商', group: groups[2], refs: [9846],
    title: '拆开一次 TLS 1.3 握手', intro: '本例使用证书认证和临时密钥交换。没有会话恢复、客户端证书或 HelloRetryRequest。',
    nodes: [client, server], steps: [
      step(0, 1, '给出候选参数', 'ClientHello  ·  supported_versions / key_share', '客户端给出支持的版本、密码套件和密钥共享值。'),
      step(1, 0, '确定握手密钥', 'ServerHello  ·  selected_version / key_share', '双方可以据此导出握手流量密钥，之后的握手消息受加密保护。'),
      step(1, 0, '交付协商结果', 'EncryptedExtensions', '服务器发送其余扩展参数。并非所有协商结果都在明文 ServerHello 中。'),
      step(1, 0, '验证身份', 'Certificate  ·  CertificateVerify', '客户端验证证书链和预期身份，再检查服务器对握手上下文的签名。'),
      step(1, 0, '验证服务端握手', 'Finished  ·  server verify_data', '客户端验证握手完整性，确认对端掌握本次握手的密钥。'),
      step(0, 1, '验证客户端握手', 'Finished  ·  client verify_data', '服务器验证客户端的 Finished。双方随后可用各自方向的应用流量密钥交换数据。'),
    ],
  },
  {
    id: 'ssh', name: 'SSH', topic: '远程登录', group: groups[2], refs: [4253, 4252],
    title: '用公钥登录远端主机', intro: '从 SSH 版本与算法协商完成后开始。先验证服务器主机密钥，再由服务器验证用户身份。',
    nodes: [node('终端', '192.0.2.10', 'client'), node('远端主机', '198.51.100.22')], steps: [
      step(0, 1, '发起密钥交换', 'SSH_MSG_KEXDH_INIT', '以 Diffie–Hellman 交换为例，客户端发送临时公开值。两端之后可以独立算出共享秘密。'),
      step(1, 0, '校验主机密钥', 'SSH_MSG_KEXDH_REPLY  ·  主机公钥 / 临时公开值 / 签名', '客户端验证服务器签名，并通过已信任的主机密钥或其他可信渠道核对主机身份。'),
      step(0, 1, '切换发送密钥', 'SSH_MSG_NEWKEYS', '客户端通知对端，从下一条发出的消息起使用新密钥。'),
      step(1, 0, '切换返回方向', 'SSH_MSG_NEWKEYS', '服务器在自己的发送方向切换密钥。双方现在可以在受保护的连接中启动用户认证服务。'),
      step(0, 1, '提交用户证明', 'SSH_MSG_USERAUTH_REQUEST  ·  publickey / signature', '用户认证服务就绪后，客户端用用户私钥生成与本次会话绑定的签名。私钥留在客户端。'),
      step(1, 0, '认证成功', 'SSH_MSG_USERAUTH_SUCCESS', '服务器检查授权公钥与签名。认证通过后客户端可以申请会话通道，例如打开远程 shell。'),
    ],
  },
];
