# Redis 命令速查手册

## 1. 通用命令
| 命令         | 语法                          | 描述                          | 示例                     |
|--------------|-------------------------------|-------------------------------|--------------------------|
| `KEYS`       | `KEYS pattern`                | 匹配所有符合模式的键            | `KEYS user:*`            |
| `DEL`        | `DEL key [key ...]`           | 删除一个或多个键                | `DEL user:101`           |
| `EXISTS`     | `EXISTS key`                  | 检查键是否存在                  | `EXISTS counter`         |
| `EXPIRE`     | `EXPIRE key seconds`          | 设置键的过期时间（秒）          | `EXPIRE session:abc 300` |
| `TTL`        | `TTL key`                     | 获取键的剩余过期时间            | `TTL session:abc`        |
| `TYPE`       | `TYPE key`                    | 获取键存储的数据类型            | `TYPE cache:data`        |
| `FLUSHDB`    | `FLUSHDB [ASYNC]`             | 清空当前数据库                  | `FLUSHDB`                |

## 2. 字符串操作
| 命令         | 语法                                      | 描述                          | 示例                     |
|--------------|-------------------------------------------|-------------------------------|--------------------------|
| `SET`        | `SET key value [EX seconds] [NX\|XX]`     | 设置键值对（支持过期/NX/XX）   | `SET status active EX 60`|
| `GET`        | `GET key`                                 | 获取键值                      | `GET username`           |
| `INCR`       | `INCR key`                                | 将键值整数值+1                | `INCR page_views`        |
| `DECR`       | `DECR key`                                | 将键值整数值-1                | `DECR inventory`         |
| `MSET`       | `MSET key1 value1 [key2 value2 ...]`      | 批量设置键值                  | `MSET a 1 b 2`           |
| `MGET`       | `MGET key1 [key2 ...]`                    | 批量获取键值                  | `MGET a b`               |
| `STRLEN`     | `STRLEN key`                              | 获取值的长度                  | `STRLEN message`         |

## 3. 哈希操作
| 命令         | 语法                              | 描述                          | 示例                         |
|--------------|-----------------------------------|-------------------------------|------------------------------|
| `HSET`       | `HSET key field value`            | 设置哈希字段值                | `HSET user:101 name "Alice"` |
| `HGET`       | `HGET key field`                  | 获取哈希字段值                | `HGET user:101 email`        |
| `HGETALL`    | `HGETALL key`                     | 获取所有字段和值              | `HGETALL product:200`        |
| `HDEL`       | `HDEL key field [field ...]`      | 删除一个或多个字段            | `HDEL user:101 phone`        |
| `HKEYS`      | `HKEYS key`                       | 获取所有字段名                | `HKEYS config:server`        |
| `HVALS`      | `HVALS key`                       | 获取所有字段值                | `HVALS car:xyz`              |
| `HINCRBY`    | `HINCRBY key field increment`     | 字段值整数增加                | `HINCRBY stats views 1`      |

## 4. 列表操作
| 命令         | 语法                              | 描述                          | 示例                     |
|--------------|-----------------------------------|-------------------------------|--------------------------|
| `LPUSH`      | `LPUSH key element [element ...]` | 左侧插入元素                  | `LPUSH tasks "repair"`   |
| `RPUSH`      | `RPUSH key element [element ...]` | 右侧插入元素                  | `RPUSH tasks "clean"`    |
| `LPOP`       | `LPOP key [count]`                | 左侧弹出元素                  | `LPOP tasks`             |
| `RPOP`       | `RPOP key [count]`                | 右侧弹出元素                  | `RPOP tasks`             |
| `LRANGE`     | `LRANGE key start stop`           | 获取指定范围元素              | `LRANGE logs 0 -1`       |
| `LLEN`       | `LLEN key`                        | 获取列表长度                  | `LLEN notifications`     |
| `LTRIM`      | `LTRIM key start stop`            | 保留指定范围元素              | `LTRIM messages 0 99`    |

## 5. 集合操作
| 命令         | 语法                              | 描述                          | 示例                     |
|--------------|-----------------------------------|-------------------------------|--------------------------|
| `SADD`       | `SADD key member [member ...]`    | 添加集合成员                  | `SADD admins "bob"`      |
| `SREM`       | `SREM key member [member ...]`    | 移除集合成员                  | `SREM users "inactive"`  |
| `SMEMBERS`   | `SMEMBERS key`                    | 获取所有成员                  | `SMEMBERS tags`          |
| `SISMEMBER`  | `SISMEMBER key member`            | 检查成员是否存在              | `SISMEMBER vip "alice"`  |
| `SINTER`     | `SINTER key [key ...]`            | 获取多个集合的交集            | `SINTER group1 group2`   |
| `SUNION`     | `SUNION key [key ...]`            | 获取多个集合的并集            | `SUNION all_users`       |
| `SCARD`      | `SCARD key`                       | 获取集合成员数量              | `SCARD unique_visitors`  |

## 6. 有序集合操作
| 命令         | 语法                                      | 描述                          | 示例                         |
|--------------|-------------------------------------------|-------------------------------|------------------------------|
| `ZADD`       | `ZADD key score member [score member ...]`| 添加成员和分数                | `ZADD rankings 100 "playerA"`|
| `ZRANGE`     | `ZRANGE key start stop [WITHSCORES]`      | 按分数升序获取成员            | `ZRANGE top10 0 9`           |
| `ZREVRANGE`  | `ZREVRANGE key start stop [WITHSCORES]`   | 按分数降序获取成员            | `ZREVRANGE leaders 0 4`      |
| `ZREM`       | `ZREM key member [member ...]`             | 移除成员                      | `ZREM scores "playerB"`      |
| `ZSCORE`     | `ZSCORE key member`                       | 获取成员的分数                | `ZSCORE highscore "userX"`   |
| `ZINCRBY`    | `ZINCRBY key increment member`            | 增加成员分数                  | `ZINCRBY points 50 "teamA"`  |