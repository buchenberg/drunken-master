# Dredd Tests
## Fail: POST (200) /auth/oauth/auto/authorize
### Message
```
body: At '' Invalid type: object (expected array)
statusCode: Status code is not '200'

```

### Request
```
method: POST
uri: /auth/oauth/auto/authorize
headers: 
    User-Agent: Dredd/4.7.2 (Darwin 15.6.0; x64)
    Cookie: x-charter-session=1234567
    Content-Length: 0

body: 


```

### Expected
```
headers: 

statusCode: 200
bodySchema: {"type":"array","items":{"type":"object","properties":{"username":{"type":"string","example":"mystro_smn"},"xoauth_account_type":{"type":"string","enum":["RESIDENTIAL","COMMERCIAL","SPECU"],"example":"RESIDENTIAL"},"classification":{"type":"string","title":"Account Classification.","enum":["SFU","MDU_NONBULK","MDU_BULK_MASTER","MDU_BULK_TENANT"],"example":"SFU"},"oauth_verifier":{"type":"string","example":"MJFiIfykXD3O"},"xoauth_device_registration":{"type":"string","example":"3e62fe69c96a2cfa107c23ca28f406deb4d5882c"},"xoauth_device_verifier":{"type":"string","example":"PaolA3hQ.3e62fe69c96a2cfa107c23ca28f406deb4d5882c"}}}}

```

### Actual
```
statusCode: 500
headers: 
    vary: origin
    content-type: application/json; charset=utf-8
    cache-control: no-cache
    content-length: 96
    date: Mon, 27 Nov 2017 22:11:02 GMT
    connection: close

body: 
{"statusCode":500,"error":"Internal Server Error","message":"An internal server error occurred"}

```

## Skip: POST (401) /auth/oauth/auto/authorize
## Skip: POST (500) /auth/oauth/auto/authorize
