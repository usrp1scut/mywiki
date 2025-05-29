## 1.创建SE

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: ServiceEntry
metadata:
  name: myes
spec:
  hosts:
  - gitlab.xiebo.pro
  ports:
  - number: 443
    name: https
    protocol: HTTPS
  #resolution: DNS
  resolution: STATIC
  location: MESH_EXTERNAL
  endpoints:
  - address: 192.168.3.151
```

## 2.结合VS进行流量控制
```yaml
#先创建vs
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: myvs2
spec:
  hosts:
  - xx.xiebo.pro
  http:
  - timeout: 5s
    fault:
      delay:
        percent: 100
        fixedDelay: 4s
    route:
    - destination:
        host: xx.xiebo.pro
```

```yaml
#再创建SE
apiVersion: networking.istio.io/v1alpha3
kind: ServiceEntry
metadata:
  name: myes
spec:
  hosts:
  - xx.xieboo.pro
  ports:
  - number: 8888
    name: http
    protocol: HTTP
  resolution: STATIC
  location: MESH_EXTERNAL
  endpoints:
  - address: 192.168.1.2
  - address: 192.168.1.3
```