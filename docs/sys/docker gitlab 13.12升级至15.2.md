## 备份迁移

### 1.备份
```
nohup docker exec -t r-gitlab-gitlab-1-22ea37fd  gitlab-backup create SKIP=artifacts &
```
### 2.在新服务器scp下载备份
```
scp -i "/tmp/key.pem" -P 1022 root@10.0.0.1:/data/gitlab/data/backups/1659430313_2022_08_02_13.12.12_gitlab_backup.tar /data/gitlab/data/backups/

scp -i "/tmp/key.pem" -P 1022 root@10.0.0.1:/data/gitlab/config/gitlab-secrets.json ~/   #包含某些密钥，不会打包进备份，需手动复制
```
### 3.新服务器导入备份
```
chmod 777 /data/gitlab/data/backups/1659430313_2022_08_02_13.12.12_gitlab_backup.tar
docker exec -ti root_gitlab_1 /bin/bash
gitlab-ctl stop puma
gitlab-ctl stop sidekiq
nohup gitlab-backup restore force=yes BACKUP=1659430313_2022_08_02_13.12.12 &
exit
mv ~/gitlab-secrets.json /data/gitlab/config/
docker exec -ti root_gitlab_1 /bin/bash
gitlab-ctl reconfigure && gitlab-ctl restart && gitlab-rake gitlab:check SANITIZE=true
```
## 版本升级

### 1.路线，更改docker-compose.yml按顺序修改镜像标签，重启升级

`13.12.12` -> `13.12.15` -> `14.0.12` ->`14.1.7` -> `14.3.6` -> `14.6.2` -> `14.9.5` -> `14.10.5` -> `15.0.2` -> `15.2.2`

### 2.从13.12升级到14.0问题

因老旧项目使用legacy存储被14版本弃用，需迁移至hashed存储
```
#列出使用传统存储的内容
# Projects
gitlab-rake gitlab:storage:legacy_projects
gitlab-rake gitlab:storage:list_legacy_projects

# Attachments
gitlab-rake gitlab:storage:legacy_attachments
gitlab-rake gitlab:storage:list_legacy_attachments

#迁移至hashed存储
gitlab-rake gitlab:storage:migrate_to_hashed
```

因部分项目删除残留导致无法迁移，使用gitlab-rails控制台删除

```
gitlab-rake gitlab:storage:list_legacy_projects

gitlab-rails console -e production

project = Project.find_by_full_path('old/project')

project.delete
```
### 3.从14.1升级到14.3版本问题,14.0不支持gitlab:background_migrations任务，需先升级到14.1

[Batched background migrations](https://docs.gitlab.com/ee/user/admin_area/monitoring/background_migrations.html#database-migrations-failing-because-of-batched-background-migration-not-finished)

报错
```
Expected batched background migration for the given configuration to be marked as 'finished', but it is 'active':       {:job_class_name=>"CopyColumnUsingBackgroundMigrationJob", :table_name=>"ci_stages", :column_name=>"id", :job_arguments=>[["id"], ["id_convert_to_bigint"]]}
```

链接gitlab postgre 数据库，查询相应异常

sql语句
```
SELECT
 id,
 job_class_name,
 table_name,
 column_name,
 job_arguments,
 status
FROM batched_background_migrations
WHERE status <> 3;
```

得到输出
```
            job_class_name             | table_name | column_name |           job_arguments
---------------------------------------+------------+-------------+------------------------------------
 CopyColumnUsingBackgroundMigrationJob | events     | id          | [["id"], ["id_convert_to_bigint"]]
 ```

根据结果终结异常
```
gitlab-rake gitlab:background_migrations:finalize[CopyColumnUsingBackgroundMigrationJob,events,id,'[["id"]\, ["id_convert_to_bigint"]]']
```

再次执行sql语句直至输出为空

### 直至升级到15.2版本

