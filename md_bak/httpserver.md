# Go 标准库 net/http 包的 HTTP 服务器实现分析

## 1. ListenAndServe 函数调用链

HTTP 服务器的入口通常是 `ListenAndServe` 函数，它启动一个 HTTP 服务器并监听指定地址。

````go path=net/http/server.go mode=EXCERPT
func ListenAndServe(addr string, handler Handler) error {
    server := &Server{Addr: addr, Handler: handler}
    return server.ListenAndServe()
}
````

这个函数创建了一个 `Server` 实例，然后调用其 `ListenAndServe` 方法：

````go path=net/http/server.go mode=EXCERPT
func (srv *Server) ListenAndServe() error {
    if srv.shuttingDown() {
        return ErrServerClosed
    }
    addr := srv.Addr
    if addr == "" {
        addr = ":http"
    }
    ln, err := net.Listen("tcp", addr)
    if err != nil {
        return err
    }
    return srv.Serve(ln)
}
````

调用链路：
1. `http.ListenAndServe(addr, handler)`
2. `server.ListenAndServe()`
3. `net.Listen("tcp", addr)` - 创建 TCP 监听器
4. `server.Serve(ln)` - 使用监听器提供服务

## 2. Server.Serve 方法的实现

`Server.Serve` 方法是服务器的核心，它接受新连接并为每个连接创建一个 goroutine：

````go path=net/http/server.go mode=EXCERPT
func (srv *Server) Serve(l net.Listener) error {
    // 设置 HTTP/2（如果需要）
    if err := srv.setupHTTP2_Serve(); err != nil {
        return err
    }

    // 跟踪监听器
    if !srv.trackListener(&l, true) {
        return ErrServerClosed
    }
    defer srv.trackListener(&l, false)

    // 创建基础上下文
    baseCtx := context.Background()
    if srv.BaseContext != nil {
        baseCtx = srv.BaseContext(origListener)
        if baseCtx == nil {
            panic("BaseContext returned a nil context")
        }
    }

    var tempDelay time.Duration // 连接失败时的延迟时间
    ctx := context.WithValue(baseCtx, ServerContextKey, srv)
    
    // 主循环：接受连接并处理
    for {
        rw, err := l.Accept()
        if err != nil {
            // 处理服务器关闭和临时错误
            if srv.shuttingDown() {
                return ErrServerClosed
            }
            if ne, ok := err.(net.Error); ok && ne.Temporary() {
                // 临时错误，使用指数退避策略
                if tempDelay == 0 {
                    tempDelay = 5 * time.Millisecond
                } else {
                    tempDelay *= 2
                }
                if max := 1 * time.Second; tempDelay > max {
                    tempDelay = max
                }
                srv.logf("http: Accept error: %v; retrying in %v", err, tempDelay)
                time.Sleep(tempDelay)
                continue
            }
            return err
        }
        
        // 成功接受连接，重置延迟
        tempDelay = 0
        
        // 设置连接上下文
        connCtx := ctx
        if cc := srv.ConnContext; cc != nil {
            connCtx = cc(connCtx, rw)
            if connCtx == nil {
                panic("ConnContext returned nil")
            }
        }
        
        // 创建连接对象并启动 goroutine 处理
        c := srv.newConn(rw)
        c.setState(c.rwc, StateNew, runHooks)
        go c.serve(connCtx)
    }
}
````

关键设计点：
1. **连接接受循环**：无限循环接受新连接
2. **错误处理**：对临时错误使用指数退避策略
3. **每个连接一个 goroutine**：为每个连接创建独立的 goroutine 处理请求
4. **上下文传递**：使用 context 传递服务器信息和配置

## 3. conn.serve 方法解析

每个连接由 `conn.serve` 方法处理，它负责读取和解析 HTTP 请求：

````go path=net/http/server.go mode=EXCERPT
func (c *conn) serve(ctx context.Context) {
    // 设置远程地址
    if ra := c.rwc.RemoteAddr(); ra != nil {
        c.remoteAddr = ra.String()
    }
    ctx = context.WithValue(ctx, LocalAddrContextKey, c.rwc.LocalAddr())
    
    var inFlightResponse *response
    defer func() {
        // 处理 panic
        if err := recover(); err != nil && err != ErrAbortHandler {
            const size = 64 << 10
            buf := make([]byte, size)
            buf = buf[:runtime.Stack(buf, false)]
            c.server.logf("http: panic serving %v: %v\n%s", c.remoteAddr, err, buf)
        }
        
        // 清理资源
        if inFlightResponse != nil {
            inFlightResponse.cancelCtx()
            inFlightResponse.disableWriteContinue()
        }
        if !c.hijacked() {
            if inFlightResponse != nil {
                inFlightResponse.conn.r.abortPendingRead()
                inFlightResponse.reqBody.Close()
            }
            c.close()
            c.setState(c.rwc, StateClosed, runHooks)
        }
    }()
    
    // 读取和处理请求
    // ...
    
    // 处理请求
    inFlightResponse = w
    serverHandler{c.server}.ServeHTTP(w, w.req)
    inFlightResponse = nil
    w.cancelCtx()
    if c.hijacked() {
        return
    }
    // ...
}
````

关键功能：
1. **请求解析**：从连接中读取 HTTP 请求并解析
2. **panic 恢复**：使用 defer-recover 机制捕获 handler 中的 panic
3. **资源清理**：确保连接和请求资源被正确释放
4. **请求处理**：调用 `serverHandler.ServeHTTP` 处理请求

## 4. serverHandler 的请求分发

`serverHandler` 是一个简单的包装结构，它将请求分发给用户定义的 Handler 或默认的 ServeMux：

````go path=net/http/server.go mode=EXCERPT
type serverHandler struct {
    srv *Server
}

func (sh serverHandler) ServeHTTP(rw ResponseWriter, req *Request) {
    handler := sh.srv.Handler
    if handler == nil {
        handler = DefaultServeMux
    }
    if !sh.srv.DisableGeneralOptionsHandler && req.RequestURI == "*" && req.Method == "OPTIONS" {
        handler = globalOptionsHandler{}
    }

    handler.ServeHTTP(rw, req)
}
````

这个结构的职责很简单：
1. 确定使用哪个 Handler（用户提供的或 DefaultServeMux）
2. 处理特殊的 OPTIONS 请求
3. 调用选定 Handler 的 ServeHTTP 方法

## 5. DefaultServeMux 的路由匹配

当用户没有提供自定义 Handler 时，`DefaultServeMux` 负责根据 URL 路径匹配处理函数：

````go path=net/http/server.go mode=EXCERPT
func (mux *ServeMux) ServeHTTP(w ResponseWriter, r *Request) {
    if r.RequestURI == "*" {
        if r.ProtoAtLeast(1, 1) {
            w.Header().Set("Connection", "close")
        }
        w.WriteHeader(StatusBadRequest)
        return
    }
    var h Handler
    if use121 {
        h, _ = mux.mux121.findHandler(r)
    } else {
        h, r.Pattern, r.pat, r.matches = mux.findHandler(r)
    }
    h.ServeHTTP(w, r)
}
````

`ServeMux` 使用 `findHandler` 方法查找匹配的处理函数：

````go path=net/http/server.go mode=EXCERPT
func (mux *ServeMux) findHandler(r *Request) (h Handler, patStr string, _ *pattern, matches []string) {
    var n *routingNode
    host := r.URL.Host
    escapedPath := r.URL.EscapedPath()
    path := escapedPath
    
    // CONNECT 请求的特殊处理
    if r.Method == "CONNECT" {
        // ...
    } else {
        // 清理路径并处理重定向
        host = stripHostPort(r.Host)
        path = cleanPath(path)

        // 尝试匹配路径
        var u *url.URL
        n, matches, u = mux.matchOrRedirect(host, r.Method, path, r.URL)
        if u != nil {
            return RedirectHandler(u.String(), StatusMovedPermanently), u.Path, nil, nil
        }
    }
    
    // 返回匹配的处理函数
    return n.handler, n.pattern.String(), n.pattern, matches
}
````

关键设计点：
1. **路径清理**：规范化 URL 路径
2. **主机和路径匹配**：支持基于主机名和路径的路由
3. **重定向处理**：自动处理尾部斜杠的重定向
4. **模式匹配**：使用前缀树结构进行高效路由匹配

