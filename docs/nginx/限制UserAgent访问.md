```
#chrom浏览器或windows系统访问返回404
          #set $client    "";
          #if ( $http_user_agent ~* "(chrome|windows)") {
          #     set $client "1";
          #}
          #if ($client != '1') {
          #    return 404;
          #}
```