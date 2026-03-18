// Skills广场脚本加载器 - 解决协议混合内容问题
// 强制使用HTTP协议加载主要脚本文件，避免HTTPS/HTTP冲突

(function() {
    'use strict';
    
    // 强制使用HTTP协议加载Skills广场主脚本
    function loadSkillsPlazaScript() {
        const script = document.createElement('script');
        
        // 构建HTTP协议的脚本URL，确保与HTTP-only服务器兼容
        const httpUrl = 'http://' + window.location.host + '/js/skills-plaza.js';
        
        script.src = httpUrl;
        script.async = true; // 异步加载，不阻塞页面渲染
        
        // 加载成功处理
        script.onload = function() {
            console.log('✅ Skills广场脚本加载成功:', httpUrl);
            
            // 触发加载完成事件，通知页面脚本已就绪
            if (typeof window.onSkillsScriptLoaded === 'function') {
                window.onSkillsScriptLoaded();
            }
        };
        
        // 加载失败处理
        script.onerror = function() {
            console.error('❌ Skills广场脚本加载失败:', httpUrl);
            
            // 创建用户友好的错误提示
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(45deg, #ff6b6b, #ee5a52);
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                font-family: 'Segoe UI', sans-serif;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                max-width: 90%;
                text-align: center;
            `;
            
            errorDiv.innerHTML = `
                <strong>⚠️ 脚本加载失败</strong><br>
                <small>请尝试直接访问: http://${window.location.host}</small>
            `;
            
            document.body.appendChild(errorDiv);
            
            // 5秒后自动隐藏错误提示
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 5000);
        };
        
        // 添加到页面头部
        document.head.appendChild(script);
        
        console.log('🔄 开始加载Skills广场脚本:', httpUrl);
    }
    
    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSkillsPlazaScript);
    } else {
        loadSkillsPlazaScript();
    }
})();