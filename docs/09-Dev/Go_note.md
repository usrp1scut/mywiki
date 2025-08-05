## Golang标准库文档

https://studygolang.com/pkgdoc

## 字符串常用函数

```go
package main

import (
	"fmt"
	"strconv"
	"strings"
)

func main() {
    //检查字符串是否包含
	b := strings.Contains("seafood", "sea")
	fmt.Printf("%v\n", b)
    //计算某字符串在字符串出现的次数
	num := strings.Count("cheese", "e")
	fmt.Printf("%v\n", num)
    //进制转换
	str := strconv.FormatInt(123, 2)
	fmt.Printf("%v\n", str)
	str = strconv.FormatInt(123, 16)
	fmt.Printf("%v\n", str)
    //ASCII转字符串
	str = string([]byte{97, 98, 99})
	fmt.Printf("%v\n", str)
    //大小写不敏感地判断字符串是否相等
	b = strings.EqualFold("aBc", "abc")
	fmt.Printf("%v\n", b)
    //字符串替换
	str = strings.Replace("go golang", "go ", "go语言 ", -1)
	fmt.Println(str)
    //以特定符号切割字符串
	array := strings.Split("asd,asdas,asddfdfgfd,hgfhgfd,dsf", ",")
	fmt.Println(array)
	for i := 0; i < len(array); i++ {
		fmt.Println(array[i])
	}
    //大小写转换
	str = "SRASDjkl"
	str = strings.ToLower(str)
	fmt.Println(str)

	str = "SRASDjkl"
	str = strings.ToUpper(str)
	fmt.Println(str)
    //判断是否以特定字符串开头
	str = "ftp://192.168.1.3"
	if strings.HasPrefix(str, "ftp://") {
		fmt.Println("FTP服务器地址")
	}
    //判断是否以特定字符串结尾
    str = "asd.jpg"
	if strings.HasSuffix(str, ".jpg") {
		fmt.Println("jpg图片文件")
	}

}
```
## 时间与日期函数
```go
package main

import (
	"fmt"
	"time"
    "stronv"
)
func test() {
	str := "hello"
	for i := 0; i < 100000; i++ {
		str += strconv.Itoa(i)
	}
}
func main() {
	now := time.Now()
	fmt.Printf("%T, %v\n", now, now)             //当前时间time.Time, 2025-08-02 11:56:36.7655031 +0800 CST m=+0.000000001
	fmt.Print(now.Format("2006-01-02 15:04:05")) //格式化

    //等待函数Sleep
	for i := 0; i < 10; i++ {
		fmt.Println(i)
		time.Sleep(time.Second)//1s
		time.Sleep(time.Millisecond * 100)//0.1s
	}

    //Unix(秒)和UnixNano(纳秒)
	fmt.Printf("%v %v", now.Unix(), now.UnixNano())

    //案例，计算程序耗时
    start := time.Now().Unix()
	test()
	end := time.Now().Unix()
	fmt.Printf("%v\n", end-start)
}
```
### 随机数生成
```go
package main
import "math/rand"
func main() {
	rand.New(rand.NewSource(time.Now().UnixNano()))
	ran := rand.Intn(100) + 1
}
```