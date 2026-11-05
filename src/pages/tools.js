import React from 'react';
import Layout from '@theme/Layout';
import Toolbox from '@site/src/components/Toolbox';

export default function ToolsPage() {
  return (
    <Layout title="工具箱" description="JSON、Base64、时间戳、Cron、哈希与子网计算等开发运维工具，直接在浏览器中使用。" noFooter>
      <Toolbox />
    </Layout>
  );
}
