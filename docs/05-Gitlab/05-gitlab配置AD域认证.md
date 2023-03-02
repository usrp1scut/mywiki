```conf
        gitlab_rails['ldap_enabled'] = true
        gitlab_rails['ldap_servers'] = {
          'main' => {
            'label' => '测试域账号',
            'host' =>  '192.168.x.x',
            'port' => 389,
            'uid' => 'sAMAccountName',
            #管理员账号密码
            'bind_dn' => 'cn=administrator,cn=Users,dc=example,dc=local',
            'password' => 'password',
            'encryption' => 'plain',
            #同步的用户账号所在的组织
            'base' => 'ou=IT,dc=example,dc=local',
          }
        }
```