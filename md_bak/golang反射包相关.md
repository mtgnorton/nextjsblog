## reflect.TypeOf()函数
reflect.TypeOf() 函数用于获取一个接口值的动态类型信息。返回一个 reflect.Type 类型的值。

**常用方法：**

- Kind(): 返回底层类型的类别，如 Bool、Int、String、Struct、Slice、Map、Ptr 等。
- Name(): 返回类型的名称（如果类型是命名类型）。
- PkgPath(): 返回类型的包路径（如果类型是命名类型且在导出）。
- NumField(): 返回结构体字段的数量。
- Field(i int): 返回结构体第 i 个字段的 reflect.StructField。
- Elem(): 如果是指针、数组、切片、映射或通道类型，返回其元素类型。

```go
type User struct {
	Name string `json:"name,omitempty"`
	Age  int    `json:"age"`
}

func main() {
	var i int = 10
	t := reflect.TypeOf(i)
	fmt.Println("变量 i 的类型:", t.Name()) // 输出: int
	fmt.Println("变量 i 的类别:", t.Kind()) // 输出: int

	var s string = "hello"
	ts := reflect.TypeOf(s)
	fmt.Println("变量 s 的类型:", ts.Name()) // 输出: string
	fmt.Println("变量 s 的类别:", ts.Kind()) // 输出: string

	u := User{Name: "Alice", Age: 30}
	tu := reflect.TypeOf(u)
	fmt.Println("结构体 u 的类型:", tu.Name())      // 输出: User
	fmt.Println("结构体 u 的类别:", tu.Kind())      // 输出: struct
	fmt.Println("结构体 u 字段数量:", tu.NumField()) // 输出: 2

	// 获取结构体字段信息
	for i := 0; i < tu.NumField(); i++ {
		field := tu.Field(i)
		fmt.Printf("字段名称: %s, 字段类型: %s, 字段标签: %s\n", field.Name, field.Type.Name(), field.Tag)
	}
	// 字段名称: Name, 字段类型: string, 字段标签: json:"name,omitempty"
	//字段名称: Age, 字段类型: int, 字段标签: json:"age"

	var ptr *int
	tptr := reflect.TypeOf(ptr)
	fmt.Println("指针 ptr 的类型:", tptr.Name())          // 输出:
	fmt.Println("指针 ptr 的类别:", tptr.Kind())          // 输出: ptr
	fmt.Println("指针 ptr 的元素类型:", tptr.Elem().Name()) // 输出: int
}
```

## reflect.ValueOf()函数
reflect.ValueOf() 函数用于获取一个接口值的运行时数据，返回一个 reflect.Value 类型的值。通过 reflect.Value 可以获取和设置变量的值。

**常用方法：**

- Kind(): 返回底层值的类别。
- Interface(): 返回 reflect.Value 包装的值，类型为 interface{}。
- CanSet(): 返回该值是否可以被修改。只有当 reflect.Value 持有原始值的可寻址副本时，才能设置其值。通常通过传入指针来获取可设置的 reflect.Value。
- Set*(): 一系列用于设置值的函数，如 SetInt()、SetString()、SetFloat() 等。
- Field(i int): 返回结构体第 i 个字段的 reflect.Value。
- Elem(): 如果是指针，返回其指向的元素的 reflect.Value。如果不是指针，会发生 panic。
- MapKeys(): 返回 Map 的所有键的 reflect.Value 切片。
- MapIndex(key reflect.Value): 返回 Map 中指定键对应的值的 reflect.Value。
- Call([]reflect.Value): 调用函数。

```go
func main() {
	var x float64 = 3.14159
	v := reflect.ValueOf(x)
	fmt.Println("值:", v.Interface())    // 输出: 3.14159
	fmt.Println("类型:", v.Type().Name()) // 输出: float64
	fmt.Println("类别:", v.Kind())        // 输出: float64
	fmt.Println("能否设置:", v.CanSet())    // 输出: false (因为 v 是 x 的副本)

	// 要修改值，必须传递一个指向变量的指针
	p := reflect.ValueOf(&x)              // 获取 x 的地址
	fmt.Println("指针 p 的类别:", p.Kind())    // 输出: ptr
	fmt.Println("指针 p 能否设置:", p.CanSet()) // 输出: false (p本身不能设置，但它指向的值可以)

	v = p.Elem()                              // 获取指针 p 指向的元素
	fmt.Println("p.Elem() 的类别:", v.Kind())    // 输出: float64
	fmt.Println("p.Elem() 能否设置:", v.CanSet()) // 输出: true

	v.SetFloat(7.1)
	fmt.Println("修改后的 x:", x) // 输出: 7.1

	// 操作结构体字段
	type Person struct {
		Name string
		Age  int
	}
	person := Person{Name: "Bob", Age: 25}
	vp := reflect.ValueOf(&person).Elem() // 获取 person 结构体的可设置 Value

	nameField := vp.FieldByName("Name")
	if nameField.IsValid() && nameField.CanSet() {
		nameField.SetString("Charlie")
	}

	ageField := vp.FieldByName("Age")
	if ageField.IsValid() && ageField.CanSet() {
		ageField.SetInt(30)
	}
	fmt.Println("修改后的 person:", person) // 输出: {Charlie 30}
}
```

## 创建和操作切片、映射和指针
```go
func main() {
	// 动态创建切片
	sliceType := reflect.TypeOf([]int{})
	sliceValue := reflect.MakeSlice(sliceType, 0, 5) // 类型，初始长度，容量
	fmt.Println("初始切片:", sliceValue.Interface())

	sliceValue = reflect.Append(sliceValue, reflect.ValueOf(1), reflect.ValueOf(2))
	fmt.Println("添加元素后切片:", sliceValue.Interface())

	// 动态创建映射
	mapType := reflect.TypeOf(map[string]int{})
	mapValue := reflect.MakeMap(mapType)
	fmt.Println("初始 Map:", mapValue.Interface())

	mapValue.SetMapIndex(reflect.ValueOf("one"), reflect.ValueOf(1))
	mapValue.SetMapIndex(reflect.ValueOf("two"), reflect.ValueOf(2))
	fmt.Println("添加元素后 Map:", mapValue.Interface())

	// 动态创建指针并设置值
	intType := reflect.TypeOf(0)
	ptrValue := reflect.New(intType) // 创建一个指向 int 零值的指针
	fmt.Println("初始指针值:", ptrValue.Elem().Interface())

	ptrValue.Elem().SetInt(123) // 设置指针指向的值
	fmt.Println("设置后指针值:", ptrValue.Elem().Interface())
}

```
## 调用方法
reflect.Value 可以用于调用对象的方法。

**常用方法：**
- MethodByName(name string): 返回指定名称的方法的 reflect.Value。
- Call([]reflect.Value): 调用该方法，参数为一个 reflect.Value 切片。


```go
package main

import (
	"fmt"
	"reflect"
)

type MyStruct struct {
	Name string
}

func (m MyStruct) Greet(prefix string) string {
	return prefix + ", " + m.Name
}

func main() {
	myObj := MyStruct{Name: "World"}
	val := reflect.ValueOf(myObj)

	method := val.MethodByName("Greet")
	if method.IsValid() {
		args := []reflect.Value{reflect.ValueOf("Hello")}
		result := method.Call(args)
		if len(result) > 0 {
			fmt.Println("调用方法结果:", result[0].Interface()) // 输出: Hello, World
		}
	} else {
		fmt.Println("方法 Greet 不存在或不可访问")
	}
}

```
## 结构体标签
```go

type Product struct {
	ID    int    `json:"product_id" db:"id"`
	Name  string `json:"product_name"`
	Price float64
}

func main() {
	p := Product{ID: 1, Name: "Laptop", Price: 1200.0}
	t := reflect.TypeOf(p)

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		fmt.Printf("字段: %s\n", field.Name)
		fmt.Printf("  JSON 标签: %s\n", field.Tag.Get("json"))
		fmt.Printf("  DB 标签: %s\n", field.Tag.Get("db"))
		fmt.Println("---")
	}
}

```