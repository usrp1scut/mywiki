## 📌 RMAN基本概念

### 什么是RMAN？
- **Recovery Manager（RMAN）**：Oracle官方的备份恢复工具
- **特点**：集成在数据库内部，支持块级备份、增量备份、压缩、加密等高级功能

### RMAN优势
- **块级备份**：只备份已使用的数据块，节省空间
- **增量备份**：仅备份变化的数据块
- **自动管理**：自动跟踪备份文件，无需人工记录
- **备份验证**：可验证备份集的完整性和可恢复性

---

## 🔧 RMAN环境配置

### 1. 连接RMAN
```bash
# 本地连接（使用操作系统认证）
rman target /

# 远程连接（使用密码文件）
rman target sys/password@orcl
rman target /@orcl

# 连接恢复目录（可选）
rman target sys/oracle@prod catalog rman/rman@rcat
```

### 2. 基本配置命令
```sql
-- 查看当前配置
RMAN> SHOW ALL;

-- 配置默认设备类型（磁盘或磁带）
RMAN> CONFIGURE DEFAULT DEVICE TYPE TO DISK;
RMAN> CONFIGURE DEFAULT DEVICE TYPE TO SBT_TAPE;

-- 配置备份文件格式和位置
RMAN> CONFIGURE CHANNEL DEVICE TYPE DISK FORMAT '/u01/backup/%d_%U.bkp';
RMAN> CONFIGURE CONTROLFILE AUTOBACKUP FORMAT FOR DEVICE TYPE DISK TO '/u01/backup/cf_%F';

-- 开启控制文件自动备份
RMAN> CONFIGURE CONTROLFILE AUTOBACKUP ON;

-- 配置并行备份（多个通道）
RMAN> CONFIGURE DEVICE TYPE DISK PARALLELISM 3;
```

---

## 📊 备份类型详解

### 1. 数据库备份
#### 完整备份
```sql
-- 备份整个数据库（包括数据文件）
RMAN> BACKUP DATABASE;

-- 备份数据库到指定位置
RMAN> BACKUP DATABASE FORMAT '/u01/backup/full_%d_%T_%U.bkp';

-- 备份数据库并包含归档日志
RMAN> BACKUP DATABASE PLUS ARCHIVELOG;

-- 备份并删除已备份的归档日志
RMAN> BACKUP DATABASE PLUS ARCHIVELOG DELETE INPUT;
```

#### 表空间备份
```sql
-- 备份特定表空间
RMAN> BACKUP TABLESPACE users, system;

-- 备份表空间并验证
RMAN> BACKUP VALIDATE TABLESPACE users;
```

#### 数据文件备份
```sql
-- 备份特定数据文件
RMAN> BACKUP DATAFILE 1, 2, 3;

-- 查看数据文件编号
SELECT file#, name FROM v$datafile;
```

### 2. 归档日志备份
```sql
-- 备份所有归档日志
RMAN> BACKUP ARCHIVELOG ALL;

-- 备份最近24小时内的归档日志
RMAN> BACKUP ARCHIVELOG FROM TIME 'SYSDATE-1';

-- 备份并删除已备份的归档日志
RMAN> BACKUP ARCHIVELOG ALL DELETE INPUT;

-- 备份归档日志到不同位置
RMAN> BACKUP ARCHIVELOG ALL FORMAT '/u01/backup/arch_%d_%T_%U.arc';
```

### 3. 控制文件和参数文件备份
```sql
-- 备份当前控制文件
RMAN> BACKUP CURRENT CONTROLFILE;

-- 备份SPFILE（服务器参数文件）
RMAN> BACKUP SPFILE;

-- 自动备份控制文件（推荐开启）
RMAN> CONFIGURE CONTROLFILE AUTOBACKUP ON;
```

### 4. 增量备份
#### 差异增量备份（默认）
```sql
-- Level 0（基础备份，相当于完整备份）
RMAN> BACKUP INCREMENTAL LEVEL 0 DATABASE;

-- Level 1（备份自上次0级或1级备份以来变化的数据块）
RMAN> BACKUP INCREMENTAL LEVEL 1 DATABASE;

-- 增量备份包含归档日志
RMAN> BACKUP INCREMENTAL LEVEL 1 DATABASE PLUS ARCHIVELOG;
```

#### 累积增量备份
```sql
-- 备份自上次0级备份以来变化的所有数据块
RMAN> BACKUP INCREMENTAL LEVEL 1 CUMULATIVE DATABASE;
```

### 5. 压缩备份
```sql
-- 使用基本压缩
RMAN> BACKUP AS COMPRESSED BACKUPSET DATABASE;

-- 使用高级压缩（需要Advanced Compression许可）
RMAN> BACKUP AS COMPRESSED BACKUPSET DATABASE COMPRESSION ALGORITHM 'HIGH';
```

---

## 🔄 备份策略示例

### 策略1：每周完整备份 + 每日增量备份
```sql
-- 周日：完整备份（Level 0）
RUN {
  ALLOCATE CHANNEL ch1 DEVICE TYPE DISK FORMAT '/u01/backup/full_%d_%T_%U.bkp';
  BACKUP INCREMENTAL LEVEL 0 DATABASE PLUS ARCHIVELOG DELETE INPUT;
  RELEASE CHANNEL ch1;
}

-- 周一到周六：增量备份（Level 1）
RUN {
  ALLOCATE CHANNEL ch1 DEVICE TYPE DISK FORMAT '/u01/backup/incr_%d_%T_%U.bkp';
  BACKUP INCREMENTAL LEVEL 1 DATABASE PLUS ARCHIVELOG DELETE INPUT;
  RELEASE CHANNEL ch1;
}
```

### 策略2：快速恢复区（FRA）自动管理
```sql
-- 配置快速恢复区
ALTER SYSTEM SET DB_RECOVERY_FILE_DEST_SIZE = 100G;
ALTER SYSTEM SET DB_RECOVERY_FILE_DEST = '/u01/fast_recovery_area';

-- 简单备份命令（使用FRA自动管理）
RMAN> BACKUP DATABASE PLUS ARCHIVELOG DELETE INPUT;
```

---

## 📋 备份维护与管理

### 1. 备份信息查询
```sql
-- 查看所有备份集
RMAN> LIST BACKUP;

-- 查看备份汇总信息
RMAN> LIST BACKUP SUMMARY;

-- 查看归档日志备份
RMAN> LIST BACKUP OF ARCHIVELOG ALL;

-- 查看过时的备份（可删除）
RMAN> REPORT OBSOLETE;

-- 查看需要备份的文件
RMAN> REPORT NEED BACKUP;

-- 查询数据文件备份信息
SELECT * FROM v$backup_datafile;
SELECT * FROM v$backup_set;
```

### 2. 备份验证与测试
```sql
-- 验证备份集可恢复性
RMAN> VALIDATE BACKUPSET 1234;

-- 验证所有备份
RMAN> VALIDATE BACKUP;

-- 验证数据库文件
RMAN> VALIDATE DATABASE;

-- 测试恢复（不实际恢复）
RMAN> RESTORE DATABASE VALIDATE;
RMAN> RECOVER DATABASE VALIDATE;
```

### 3. 备份删除与清理
```sql
-- 删除特定备份集
RMAN> DELETE BACKUPSET 1234;

-- 删除过时备份（基于保留策略）
RMAN> DELETE OBSOLETE;

-- 删除所有过期归档日志备份
RMAN> DELETE ARCHIVELOG UNTIL TIME 'SYSDATE-7';

-- 删除所有备份（谨慎使用）
RMAN> DELETE BACKUP;

-- 强制删除（即使找不到文件也删除记录）
RMAN> DELETE EXPIRED BACKUP;
```

### 4. 保留策略管理
```sql
-- 设置基于冗余的保留策略（保留3份完整备份）
RMAN> CONFIGURE RETENTION POLICY TO REDUNDANCY 3;

-- 设置基于恢复窗口的保留策略（保留30天内备份）
RMAN> CONFIGURE RETENTION POLICY TO RECOVERY WINDOW OF 30 DAYS;

-- 禁用保留策略
RMAN> CONFIGURE RETENTION POLICY TO NONE;

-- 查看保留策略
RMAN> SHOW RETENTION POLICY;
```

---

## 🚀 高级备份技巧

### 1. 多通道并行备份
```sql
RUN {
  ALLOCATE CHANNEL ch1 DEVICE TYPE DISK FORMAT '/u01/backup/ch1_%U';
  ALLOCATE CHANNEL ch2 DEVICE TYPE DISK FORMAT '/u01/backup/ch2_%U';
  ALLOCATE CHANNEL ch3 DEVICE TYPE DISK FORMAT '/u01/backup/ch3_%U';
  
  BACKUP DATABASE
    FILESPERSET 10  -- 每个备份集包含的文件数
    PLUS ARCHIVELOG;
  
  RELEASE CHANNEL ch1;
  RELEASE CHANNEL ch2;
  RELEASE CHANNEL ch3;
}
```

### 2. 备份脚本
#### RMAN命令文件
```sql
-- backup.rman
RUN {
  ALLOCATE CHANNEL ch1 DEVICE TYPE DISK;
  BACKUP DATABASE FORMAT '/u01/backup/%d_%T_%U.bkp'
    PLUS ARCHIVELOG
    DELETE ALL INPUT;
  BACKUP CURRENT CONTROLFILE;
  RELEASE CHANNEL ch1;
}
```

#### 执行脚本
```bash
# 命令行执行
rman target / @backup.rman log=/u01/logs/backup_$(date +%Y%m%d).log

# 定时任务（crontab）
0 2 * * 0 /u01/scripts/full_backup.sh
0 2 * * 1-6 /u01/scripts/incremental_backup.sh
```

### 3. 增量更新备份（可刷新镜像副本）
```sql
-- 创建初始镜像副本
BACKUP AS COPY DATABASE;

-- 每日增量更新镜像副本
RECOVER COPY OF DATABASE WITH TAG 'DAILY_COPY';
BACKUP INCREMENTAL LEVEL 1 
  FOR RECOVER OF COPY WITH TAG 'DAILY_COPY' 
  DATABASE;
```

---

## ⚠️ 注意事项与最佳实践

### 1. 备份前检查
```sql
-- 检查数据库模式
SELECT log_mode FROM v$database;  -- 应为ARCHIVELOG

-- 检查备份配置
RMAN> SHOW ALL;

-- 检查磁盘空间
df -h /u01/backup
```

### 2. 最佳实践
- **定期验证备份**：每月至少执行一次 `VALIDATE BACKUP`
- **测试恢复流程**：每季度至少测试一次完整恢复
- **监控备份日志**：检查备份完成状态和错误信息
- **备份脚本化**：使用脚本确保备份一致性和可重复性
- **分离存储**：将备份存储在与生产数据不同的物理位置
- **加密敏感数据**：对备份进行加密保护

### 3. 常见问题排查
```sql
-- 查看RMAN操作记录
SELECT * FROM v$rman_status;
SELECT * FROM v$rman_output;

-- 查看备份进度
SELECT sid, serial#, context, sofar, totalwork,
       ROUND(sofar/totalwork*100,2) "% Complete"
FROM v$session_longops
WHERE opname LIKE 'RMAN%'
AND totalwork != 0;
```

### 4. 备份性能优化
```sql
-- 增加缓冲区大小
RMAN> CONFIGURE CHANNEL DEVICE TYPE DISK MAXPIECESIZE 10G;

-- 设置备份优化
RMAN> CONFIGURE BACKUP OPTIMIZATION ON;

-- 调整并行度
RMAN> CONFIGURE DEVICE TYPE DISK PARALLELISM 4;

-- 使用大文件段
RMAN> BACKUP DATABASE FILESPERSET 1;
```

---

## 📈 备份监控报告

### 生成备份报告脚本
```sql
-- 生成备份报告
RMAN> REPORT SCHEMA;
RMAN> REPORT NEED BACKUP DAYS 3;
RMAN> REPORT UNRECOVERABLE;

-- 生成详细备份报告脚本
SET PAGESIZE 60 LINESIZE 200
COLUMN status FORMAT a10
COLUMN input_type FORMAT a20
COLUMN hrs FORMAT 999.99

SELECT session_key, 
       session_recid,
       to_char(start_time,'dd-mon-yyyy hh24:mi') start_time,
       to_char(end_time,'dd-mon-yyyy hh24:mi') end_time,
       input_bytes/1024/1024/1024 input_gb,
       output_bytes/1024/1024/1024 output_gb,
       status,
       input_type
FROM v$rman_backup_job_details
ORDER BY session_key;
```

---

## 💎 总结要点

### 关键命令速查
| 操作 | 命令 |
|------|------|
| **完整备份** | `BACKUP DATABASE PLUS ARCHIVELOG` |
| **增量备份** | `BACKUP INCREMENTAL LEVEL 1 DATABASE` |
| **表空间备份** | `BACKUP TABLESPACE users` |
| **归档备份** | `BACKUP ARCHIVELOG ALL DELETE INPUT` |
| **查看备份** | `LIST BACKUP` |
| **验证备份** | `VALIDATE BACKUP` |
| **删除旧备份** | `DELETE OBSOLETE` |
| **恢复测试** | `RESTORE DATABASE VALIDATE` |

### 备份策略选择
- **小型数据库**：每日完整备份 + 归档日志备份
- **中型数据库**：每周完整备份 + 每日增量备份
- **大型数据库**：镜像副本 + 增量更新备份策略
- **关键业务系统**：多重备份（磁盘+磁带+异地）

### 最重要的原则
1. **备份必须可恢复**：定期验证和测试恢复
2. **保护备份文件**：加密、访问控制、异地存储
3. **文档化流程**：备份策略、恢复步骤、联系人
4. **监控和报警**：备份失败立即通知
