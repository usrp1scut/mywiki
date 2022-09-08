```
解决方法：

gitlab-psql gitlabhq_production

UPDATE application_settings set signup_enabled=t;

update application_settings set password_authentication_enabled_for_web = t;
```