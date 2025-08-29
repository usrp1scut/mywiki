## 库文档

* [标准库](https://pkg.go.dev/std)
* [go-redis](https://redis.uptrace.dev/zh/guide/go-redis.html)
* [Gin_Web框架](https://gin-gonic.com/zh-cn/docs/quickstart/)

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

## 类型断言
```go
//类型判断实践
func TypeJudge(items ...interface{}) {
	for index, x := range items {
		switch x.(type) {//.(type)固定用法
		case bool:
			fmt.Printf("第%v个参数是bool类型,值是%v\n", index, x)
		case int, int32, int64:
			fmt.Printf("第%v个参数是整数类型,值是%v\n", index, x)
		case float32, float64:
			fmt.Printf("第%v个参数是浮点数类型,值是%v\n", index, x)
		case string:
			fmt.Printf("第%v个参数是字符串类型,值是%v\n", index, x)
		case byte:
			fmt.Printf("第%v个参数是字节类型,值是%v\n", index, x)
		default:
			fmt.Printf("第%v个参数类型不确定,值是%v\n", index, x)
		}
	}
}

```
## 文件读写
```go
import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	file := ".\\test.txt"
	//一次性读
	content, err := os.ReadFile(file)
	if err != nil {
		fmt.Printf("read file err= %v", err)
	}
	fmt.Println(string(content))
	//写文件，不存在则创建
	file2, err2 := os.OpenFile(".\\abc.txt", os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		fmt.Println("ERR:", err2)
		return
	}
	defer file2.Close()
	str := "hello,gardon\n"
	//缓存写
	writer := bufio.NewWriter(file2)
	for i := 0; i < 5; i++ {
		writer.WriteString(str)
	}
	writer.Flush()
}
```
### 读写模式FLAG
```go
    O_RDONLY int = syscall.O_RDONLY // 只读模式打开文件
    O_WRONLY int = syscall.O_WRONLY // 只写模式打开文件
    O_RDWR   int = syscall.O_RDWR   // 读写模式打开文件
    O_APPEND int = syscall.O_APPEND // 写操作时将数据附加到文件尾部
    O_CREATE int = syscall.O_CREAT  // 如果不存在将创建一个新文件
    O_EXCL   int = syscall.O_EXCL   // 和O_CREATE配合使用，文件必须不存在
    O_SYNC   int = syscall.O_SYNC   // 打开文件用于同步I/O
    O_TRUNC  int = syscall.O_TRUNC  // 如果可能，打开时清空文件
```

### 判断文件或目录是否存在
```go
func PathExist(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, err
	}
	return false, err
}
```
## 错误处理
```go
	defer func() {
		if err := recover(); err != nil {
			fmt.Println("ERR", err)
		}
	}()
```
## 协程与管道
### 找素数例程
```go

package main

import (
	"fmt"
	"sync"
	"time"
)
//推数据至channel
func putNum(intChan chan int) {
	for i := 1; i <= 2000000; i++ {
		intChan <- i
	}
	close(intChan)
}
//读自然数channel,判断素数并写入素数channel
func primeNum(intChan chan int, primeChan chan int) {
	var flag bool
	for {
		num, ok := <-intChan
		if !ok {
			break
		}
		flag = true
		//素数判断
		for i := 2; i < num; i++ {
			if num%i == 0 {
				flag = false
				break
			}
		}
		if flag {
			primeChan <- num
		}
	}
	fmt.Println("协程退出")
}

func main() {
	intChan := make(chan int, 1000)
	primeChan := make(chan int, 2000)
	var wg sync.WaitGroup
	start := time.Now().Local().Unix()
	go putNum(intChan)
	wg.Add(8)
	for i := 0; i < 8; i++ {
		go func() {
			defer wg.Done()
			primeNum(intChan, primeChan)
		}()
	}
	go func() {
		wg.Wait()
		end := time.Now().Unix()
		fmt.Println("耗时", end-start)
		close(primeChan)

	}()
	for {
		_, ok := <-primeChan
		if !ok {
			break
		}
		//fmt.Println(v)
	}
}
```
## 排序
### 冒泡排序
```go
func sort(slice []int) {
	n := len(slice)
	for i := 0; i < n-1; i++ {
		for j := 0; j < n-i-1; j++ {
			if slice[j] > slice[j+1] {
				tmp := slice[j]
				slice[j] = slice[j+1]
				slice[j+1] = tmp
			}
		}
		fmt.Println(slice)
	}

}
```
### 插入排序
```go

func InsertSort(arr []int) {

	for i := 1; i < len(arr); i++ {
		insertVal := arr[i]
		insertIndex := i - 1
		for insertIndex >= 0 && arr[insertIndex] < insertVal {
			arr[insertIndex+1] = arr[insertIndex]
			fmt.Println(insertIndex)
			insertIndex--
		}
		if insertIndex+1 != 1 {
			arr[insertIndex+1] = insertVal
		}
	}
}
```
### 选择排序
```go
func selectSort(arr []int) {

	maxIndex := 0
	for i := 0; i < len(arr)-1; i++ {
		maxIndex = i
		for j := i + 1; j < len(arr); j++ {
			if arr[maxIndex] < arr[j] {
				maxIndex = j
			}
		}
		if i != maxIndex {
			arr[i], arr[maxIndex] = arr[maxIndex], arr[i]
		}
	}
}
```
### 快速排序
```go
func quickSort(left int, right int, arr []int) {
	l := left
	r := right
	pivot := arr[(left+right)/2]
	temp := 0
	for l < r {
		for arr[l] < pivot {
			l++
		}
		for arr[r] > pivot {
			r--
		}
		if l >= r {
			break
		}
		temp = arr[l]
		arr[l] = arr[r]
		arr[r] = temp
		if arr[l] == pivot {
			r--
		}
		if arr[r] == pivot {
			l++
		}
	}
	if l == r {
		l++
		r--
	}
	if left < r {
		quickSort(left, r, arr)
	}
	if right > l {
		quickSort(l, right, arr)
	}
}
```