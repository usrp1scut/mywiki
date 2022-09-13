### 连接pgsql清除token，注意会影响runner,导致runner需要重新注册

```sql
gitlab=> UPDATE projects SET runners_token = null, runners_token_encrypted = null;
UPDATE 1
gitlab=> UPDATE namespaces SET runners_token = null, runners_token_encrypted = null;
UPDATE 6
gitlab=> UPDATE application_settings SET runners_registration_token_encrypted = null;
UPDATE 1
gitlab=> UPDATE application_settings SET encrypted_ci_jwt_signing_key = null;
UPDATE 1
gitlab=> UPDATE ci_runners SET token = null, token_encrypted = null;
```