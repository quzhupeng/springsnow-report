export async function onRequest(context) {
  const { request, env } = context;
  
  // 处理CORS预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      }
    });
  }
  
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  
  // 构建转发到Worker的URL
  const workerUrl = `https://my-auth-worker.qu18354531302.workers.dev${path}`;
  
  try {
    // 创建新的请求对象
    const newRequest = new Request(workerUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });
    
    // 转发请求到Worker
    const response = await fetch(newRequest);
    
    // 创建新的响应对象并添加CORS头
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
    return newResponse;
  } catch (error) {
    console.error('代理请求失败:', error);
    return new Response(JSON.stringify({
      code: 500,
      message: '服务器内部错误',
      data: null
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}