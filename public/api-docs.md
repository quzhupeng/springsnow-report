# 春雪食品生产销售分析报告系统 API 接口文档

## 目录

1. [通用说明](#通用说明)
2. [用户认证接口](#用户认证接口)
3. [数据分析接口](#数据分析接口)
4. [邀请码管理接口](#邀请码管理接口)
5. [系统管理接口](#系统管理接口)

## 通用说明

### 基础URL

```
https://api.springsnow.cn/v1
```

### 请求格式

所有请求均使用 JSON 格式，请求头需包含：

```
Content-Type: application/json
```

### 认证方式

除登录、注册和邀请码验证接口外，所有请求都需要在请求头中携带 token：

```
Authorization: Bearer {token}
```

### 响应格式

所有响应均使用统一的 JSON 格式：

```json
{
  "code": 200,       // 状态码，200表示成功，非200表示失败
  "message": "操作成功", // 响应消息
  "data": {}         // 响应数据，失败时可能为null或包含错误详情
}
```

### 错误码说明

| 错误码 | 说明 |
| ------ | ---- |
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权或token失效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 用户认证接口

### 1. 用户登录

- **接口**: `/auth/login`
- **方法**: `POST`
- **描述**: 用户登录接口
- **请求参数**:

```json
{
  "username": "string", // 用户名
  "password": "string"  // 密码
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1001",
      "username": "zhangsan",
      "avatar": "Z",
      "roles": ["user"]
    }
  }
}
```

### 2. 用户注册

- **接口**: `/auth/register`
- **方法**: `POST`
- **描述**: 用户注册接口
- **请求参数**:

```json
{
  "inviteCode": "string", // 邀请码
  "username": "string",   // 用户名，3-20个字符
  "password": "string"    // 密码，至少6位
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1002",
      "username": "lisi",
      "avatar": "L",
      "roles": ["user"]
    }
  }
}
```

### 3. 邀请码验证

- **接口**: `/auth/validate-invite-code`
- **方法**: `POST`
- **描述**: 验证邀请码是否有效
- **请求参数**:

```json
{
  "inviteCode": "string" // 邀请码
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "邀请码有效",
  "data": {
    "valid": true
  }
}
```

### 4. 退出登录

- **接口**: `/auth/logout`
- **方法**: `POST`
- **描述**: 用户退出登录
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

### 5. 获取用户信息

- **接口**: `/auth/user-info`
- **方法**: `GET`
- **描述**: 获取当前登录用户信息
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "1001",
    "username": "zhangsan",
    "avatar": "Z",
    "email": "zhangsan@example.com",
    "roles": ["user"],
    "lastLoginTime": "2023-06-18T10:30:00Z"
  }
}
```

## 数据分析接口

### 1. 获取核心指标摘要

- **接口**: `/report/summary`
- **方法**: `GET`
- **描述**: 获取报告核心指标摘要
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| startDate | string | 否 | 开始日期，格式YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式YYYY-MM-DD |

- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "productCount": 345,
    "periodDays": 18,
    "productionSalesRatio": 120.3,
    "salesVolume": 6146.0,
    "averagePrice": 9484,
    "highlights": [
      "产销率偏高，可能存在跨期风险",
      "请注意库存水平，避免库存积压"
    ]
  }
}
```

### 2. 获取库存数据

- **接口**: `/report/inventory`
- **方法**: `GET`
- **描述**: 获取库存情况分析数据
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| category | string | 否 | 产品类别，不传则查询全部 |
| startDate | string | 否 | 开始日期，格式YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式YYYY-MM-DD |
| page | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页条数，默认10 |

- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "trendData": [
      {"date": "2023-06-01", "inventory": 2500.5},
      {"date": "2023-06-02", "inventory": 2480.3},
      {"date": "2023-06-03", "inventory": 2420.8}
    ],
    "inventoryList": [
      {
        "productName": "冷冻鸡肉块",
        "currentInventory": 1250.5,
        "safeInventory": 800.0,
        "turnoverDays": 15.6,
        "status": "normal"
      },
      {
        "productName": "冷鲜鸡腿",
        "currentInventory": 680.2,
        "safeInventory": 500.0,
        "turnoverDays": 12.3,
        "status": "normal"
      },
      {
        "productName": "鸡胸肉丁",
        "currentInventory": 320.8,
        "safeInventory": 400.0,
        "turnoverDays": 8.9,
        "status": "warning"
      }
    ],
    "pagination": {
      "total": 345,
      "page": 1,
      "pageSize": 10,
      "totalPages": 35
    }
  }
}
```

### 3. 获取产销率数据

- **接口**: `/report/production-sales-ratio`
- **方法**: `GET`
- **描述**: 获取产销率分析数据
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| category | string | 否 | 产品类别，不传则查询全部 |
| startDate | string | 否 | 开始日期，格式YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式YYYY-MM-DD |

- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "average": 120.3,
    "lowest": 98.5,
    "highest": 135.2,
    "trendData": [
      {"date": "2023-06-01", "ratio": 115.2},
      {"date": "2023-06-02", "ratio": 118.5},
      {"date": "2023-06-03", "ratio": 120.1}
    ],
    "alerts": [
      "产销率偏高，可能存在跨期风险",
      "请注意库存水平，避免库存积压"
    ]
  }
}
```

### 4. 获取销售数据

- **接口**: `/report/sales`
- **方法**: `GET`
- **描述**: 获取销售情况分析数据
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| category | string | 否 | 产品类别，不传则查询全部 |
| startDate | string | 否 | 开始日期，格式YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式YYYY-MM-DD |
| page | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页条数，默认10 |

- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalSales": 6146.0,
    "averagePrice": 9484,
    "trendData": [
      {"date": "2023-06-01", "sales": 340.5, "price": 9450},
      {"date": "2023-06-02", "sales": 352.8, "price": 9480},
      {"date": "2023-06-03", "sales": 345.2, "price": 9510}
    ],
    "productSales": [
      {
        "productName": "冷冻鸡肉块",
        "sales": 1250.5,
        "price": 9600,
        "amount": 12004800
      },
      {
        "productName": "冷鲜鸡腿",
        "sales": 980.2,
        "price": 10200,
        "amount": 9998040
      }
    ],
    "pagination": {
      "total": 345,
      "page": 1,
      "pageSize": 10,
      "totalPages": 35
    }
  }
}
```

### 5. 获取价格波动数据

- **接口**: `/report/price-fluctuation`
- **方法**: `GET`
- **描述**: 获取价格波动分析数据
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| category | string | 否 | 产品类别，不传则查询全部 |
| startDate | string | 否 | 开始日期，格式YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式YYYY-MM-DD |
| page | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页条数，默认10 |

- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "summary": "未监测到价格相超频繁明显异常的情况",
    "priceChanges": [
      {
        "productName": "冷冻鸡肉块",
        "date": "2023-06-05",
        "oldPrice": 9600,
        "newPrice": 9650,
        "changeRate": 0.52,
        "reason": "原材料成本上涨"
      },
      {
        "productName": "冷鲜鸡腿",
        "date": "2023-06-10",
        "oldPrice": 10200,
        "newPrice": 10150,
        "changeRate": -0.49,
        "reason": "促销活动"
      }
    ],
    "pagination": {
      "total": 28,
      "page": 1,
      "pageSize": 10,
      "totalPages": 3
    }
  }
}
```

### 6. 获取行业资讯数据

- **接口**: `/report/industry-news`
- **方法**: `GET`
- **描述**: 获取卓创资讯提供的行业价格监测数据
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| category | string | 否 | 资讯类别，不传则查询全部 |
| page | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页条数，默认10 |

- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "news": [
      {
        "id": "1001",
        "title": "本周鸡肉价格指数环比上涨2.3%",
        "source": "卓创资讯",
        "publishDate": "2023-06-15",
        "summary": "受饲料成本上涨影响，本周鸡肉价格指数环比上涨2.3%，同比上涨5.1%...",
        "url": "https://news.example.com/1001"
      },
      {
        "id": "1002",
        "title": "冷鲜鸡产品需求旺盛，价格持续走高",
        "source": "卓创资讯",
        "publishDate": "2023-06-12",
        "summary": "随着夏季到来，冷鲜鸡产品需求旺盛，价格持续走高...",
        "url": "https://news.example.com/1002"
      }
    ],
    "pagination": {
      "total": 56,
      "page": 1,
      "pageSize": 10,
      "totalPages": 6
    }
  }
}
```

## 邀请码管理接口

### 1. 创建邀请码

- **接口**: `/invite-code/create`
- **方法**: `POST`
- **描述**: 创建新的邀请码（需要管理员权限）
- **请求参数**:

```json
{
  "count": 5,           // 创建数量，默认1
  "expireDate": "2023-12-31", // 过期日期，格式YYYY-MM-DD
  "maxUses": 1          // 最大使用次数，默认1
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "inviteCodes": [
      {
        "code": "SPRING2023",
        "expireDate": "2023-12-31",
        "maxUses": 1,
        "used": 0,
        "status": "active"
      },
      {
        "code": "SNOW2023",
        "expireDate": "2023-12-31",
        "maxUses": 1,
        "used": 0,
        "status": "active"
      }
    ]
  }
}
```

### 2. 查询邀请码

- **接口**: `/invite-code/list`
- **方法**: `GET`
- **描述**: 查询邀请码列表（需要管理员权限）
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| status | string | 否 | 状态：active(有效)、used(已使用)、expired(已过期)、disabled(已禁用) |
| page | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页条数，默认10 |

- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "inviteCodes": [
      {
        "code": "SPRING2023",
        "expireDate": "2023-12-31",
        "maxUses": 1,
        "used": 0,
        "status": "active",
        "createdAt": "2023-06-01T10:30:00Z",
        "createdBy": "admin"
      },
      {
        "code": "SNOW2023",
        "expireDate": "2023-12-31",
        "maxUses": 1,
        "used": 1,
        "status": "used",
        "createdAt": "2023-06-01T10:30:00Z",
        "createdBy": "admin",
        "usedAt": "2023-06-10T15:20:00Z",
        "usedBy": "zhangsan"
      }
    ],
    "pagination": {
      "total": 20,
      "page": 1,
      "pageSize": 10,
      "totalPages": 2
    }
  }
}
```

### 3. 禁用邀请码

- **接口**: `/invite-code/disable`
- **方法**: `POST`
- **描述**: 禁用指定邀请码（需要管理员权限）
- **请求参数**:

```json
{
  "code": "SPRING2023" // 邀请码
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "禁用成功",
  "data": {
    "code": "SPRING2023",
    "status": "disabled"
  }
}
```

## 系统管理接口

### 1. 用户列表

- **接口**: `/admin/users`
- **方法**: `GET`
- **描述**: 获取用户列表（需要管理员权限）
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| username | string | 否 | 用户名，支持模糊查询 |
| status | string | 否 | 状态：active(正常)、disabled(禁用) |
| page | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页条数，默认10 |

- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "users": [
      {
        "id": "1001",
        "username": "zhangsan",
        "email": "zhangsan@example.com",
        "status": "active",
        "roles": ["user"],
        "createdAt": "2023-06-01T10:30:00Z",
        "lastLoginTime": "2023-06-18T15:20:00Z"
      },
      {
        "id": "1002",
        "username": "lisi",
        "email": "lisi@example.com",
        "status": "active",
        "roles": ["user"],
        "createdAt": "2023-06-05T14:20:00Z",
        "lastLoginTime": "2023-06-17T09:10:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pageSize": 10,
      "totalPages": 3
    }
  }
}
```

### 2. 修改用户状态

- **接口**: `/admin/users/status`
- **方法**: `POST`
- **描述**: 修改用户状态（需要管理员权限）
- **请求参数**:

```json
{
  "userId": "1001",
  "status": "disabled" // active(正常)、disabled(禁用)
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "修改成功",
  "data": {
    "userId": "1001",
    "status": "disabled"
  }
}
```

### 3. 修改用户角色

- **接口**: `/admin/users/roles`
- **方法**: `POST`
- **描述**: 修改用户角色（需要管理员权限）
- **请求参数**:

```json
{
  "userId": "1001",
  "roles": ["user", "admin"]
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "修改成功",
  "data": {
    "userId": "1001",
    "roles": ["user", "admin"]
  }
}
```

### 4. 系统配置

- **接口**: `/admin/settings`
- **方法**: `GET`
- **描述**: 获取系统配置（需要管理员权限）
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "settings": {
      "siteName": "春雪食品生产销售分析报告系统",
      "logoUrl": "https://example.com/logo.png",
      "allowRegister": true,
      "requireInviteCode": true,
      "defaultDataPeriod": 18,
      "systemNotice": "系统将于2023年7月1日进行维护升级，请提前做好准备。"
    }
  }
}
```

### 5. 更新系统配置

- **接口**: `/admin/settings`
- **方法**: `POST`
- **描述**: 更新系统配置（需要管理员权限）
- **请求参数**:

```json
{
  "siteName": "春雪食品生产销售分析报告系统",
  "logoUrl": "https://example.com/logo.png",
  "allowRegister": true,
  "requireInviteCode": true,
  "defaultDataPeriod": 18,
  "systemNotice": "系统将于2023年7月1日进行维护升级，请提前做好准备。"
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "settings": {
      "siteName": "春雪食品生产销售分析报告系统",
      "logoUrl": "https://example.com/logo.png",
      "allowRegister": true,
      "requireInviteCode": true,
      "defaultDataPeriod": 18,
      "systemNotice": "系统将于2023年7月1日进行维护升级，请提前做好准备。"
    }
  }
}
``` 