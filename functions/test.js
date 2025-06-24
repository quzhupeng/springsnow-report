export async function onRequest(context) {
  const { request, env } = context;
  
  // 简单的API测试页面
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>API测试</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .test-section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
            button { padding: 10px 20px; margin: 5px; }
            .result { margin: 10px 0; padding: 10px; background: #f5f5f5; }
        </style>
    </head>
    <body>
        <h1>认证API测试</h1>
        
        <div class="test-section">
            <h3>测试邀请码验证</h3>
            <button onclick="testInviteCode()">测试邀请码 SPRING2024</button>
            <div id="inviteResult" class="result"></div>
        </div>
        
        <div class="test-section">
            <h3>测试注册</h3>
            <button onclick="testRegister()">测试注册用户</button>
            <div id="registerResult" class="result"></div>
        </div>
        
        <div class="test-section">
            <h3>测试登录</h3>
            <button onclick="testLogin()">测试登录</button>
            <div id="loginResult" class="result"></div>
        </div>
        
        <script>
            async function testInviteCode() {
                try {
                    const response = await fetch('/auth/validate-invite-code', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ inviteCode: 'SPRING2024' })
                    });
                    const data = await response.json();
                    document.getElementById('inviteResult').innerHTML = 
                        '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } catch (error) {
                    document.getElementById('inviteResult').innerHTML = 
                        '<span style="color: red;">错误: ' + error.message + '</span>';
                }
            }
            
            async function testRegister() {
                try {
                    const response = await fetch('/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: 'testuser' + Date.now(),
                            password: 'password123',
                            inviteCode: 'SPRING2024'
                        })
                    });
                    const data = await response.json();
                    document.getElementById('registerResult').innerHTML = 
                        '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } catch (error) {
                    document.getElementById('registerResult').innerHTML = 
                        '<span style="color: red;">错误: ' + error.message + '</span>';
                }
            }
            
            async function testLogin() {
                try {
                    const response = await fetch('/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: 'admin',
                            password: 'admin123'
                        })
                    });
                    const data = await response.json();
                    document.getElementById('loginResult').innerHTML = 
                        '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } catch (error) {
                    document.getElementById('loginResult').innerHTML = 
                        '<span style="color: red;">错误: ' + error.message + '</span>';
                }
            }
        </script>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}