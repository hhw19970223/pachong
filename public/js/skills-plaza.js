// Skills 广场主要JavaScript代码
let allSkills = [];
let filteredSkills = [];
let currentPage = 1;
const skillsPerPage = 12;

// API地址
const API_BASE = 'http://98.88.137.186:3001';

// 加载技能数据
async function loadSkills() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const grid = document.getElementById('skillsGrid');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    grid.style.display = 'none';

    try {
        // 先尝试缓存接口
        let response = await fetch(`${API_BASE}/api/skills/cache`);
        let data = await response.json();
        
        // 如果缓存为空，直接从实时接口获取
        if (!data.success || !data.data || !data.data.sources || data.data.sources.length === 0) {
            console.log('缓存为空，使用实时数据...');
            response = await fetch(`${API_BASE}/api/skills/scrape?source=skills.sh&limit=20`);
            data = await response.json();
            
            if (data.success && data.data && data.data.result && data.data.result.skills) {
                allSkills = data.data.result.skills.map((skill, index) => ({
                    ...skill,
                    weeklyDownloads: skill.stats ? skill.stats.installsWeekly : 0,
                    stars: skill.stats ? skill.stats.stars : 0,
                    auditStatus: getAuditStatus(skill.audits),
                    description: skill.summary || skill.skillFile?.rawText?.substring(0, 200) || '',
                    installCommand: skill.installCommand,
                    repository: skill.raw?.repositoryUrl || `https://github.com/${skill.repository}`,
                    author: skill.owner,
                    name: skill.name,
                    rank: skill.rank || (index + 1),
                    lastUpdated: skill.firstSeen
                }));
            } else {
                throw new Error('实时数据获取失败');
            }
        } else {
            // 使用缓存数据
            allSkills = data.data.sources[0].skills || [];
        }
        
        filteredSkills = [...allSkills];
        updateStats();
        displaySkills();
        
        loading.style.display = 'none';
        grid.style.display = 'grid';
        
    } catch (err) {
        console.error('加载失败:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
    }
}

// 获取审计状态
function getAuditStatus(audits) {
    if (!audits || audits.length === 0) return 'yellow';
    
    const passCount = audits.filter(audit => audit.status === 'Pass').length;
    const warnCount = audits.filter(audit => audit.status === 'Warn').length;
    
    if (passCount === audits.length) return 'green';
    if (warnCount > 0) return 'yellow';
    return 'red';
}

// 更新统计数据
function updateStats() {
    const totalSkills = allSkills.length;
    const totalDownloads = allSkills.reduce((sum, skill) => sum + (skill.weeklyDownloads || 0), 0);
    const avgStars = totalSkills > 0 ? Math.round(allSkills.reduce((sum, skill) => sum + (skill.stars || 0), 0) / totalSkills) : 0;

    document.getElementById('total-skills').textContent = totalSkills;
    document.getElementById('total-downloads').textContent = formatNumber(totalDownloads);
    document.getElementById('avg-stars').textContent = avgStars;
}

// 格式化数字
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// 显示技能
function displaySkills() {
    const grid = document.getElementById('skillsGrid');
    const startIndex = (currentPage - 1) * skillsPerPage;
    const endIndex = startIndex + skillsPerPage;
    const skillsToShow = filteredSkills.slice(startIndex, endIndex);

    grid.innerHTML = skillsToShow.map(skill => createSkillCard(skill)).join('');
    updatePagination();
}

// 创建技能卡片
function createSkillCard(skill) {
    const auditClass = `audit-${skill.auditStatus || 'yellow'}`;
    const lastUpdated = skill.lastUpdated ? new Date(skill.lastUpdated).toLocaleDateString('zh-CN') : '未知';
    
    return `
        <div class="skill-card">
            <div class="skill-header">
                <div class="skill-rank">${skill.rank || '?'}</div>
                <div class="skill-info">
                    <h3>${skill.name}</h3>
                    <div class="skill-author">by ${skill.author}</div>
                </div>
            </div>
            
            <p class="skill-description">${skill.description || '暂无描述'}</p>
            
            <div class="skill-stats">
                <div class="stat">
                    <i class="fas fa-download"></i>
                    ${formatNumber(skill.weeklyDownloads || 0)}/周
                </div>
                <div class="stat">
                    <i class="fas fa-star"></i>
                    ${skill.stars || 0}
                </div>
                <div class="stat">
                    <span class="audit-status ${auditClass}">
                        ${skill.auditStatus || 'unknown'}
                    </span>
                </div>
            </div>
            
            <div class="skill-actions">
                <button class="install-btn" onclick="copyInstallCommand('${skill.installCommand}')">
                    <i class="fas fa-download"></i> 安装
                </button>
                ${skill.repository ? `<a href="${skill.repository}" target="_blank" class="repo-link">
                    <i class="fab fa-github"></i>
                </a>` : ''}
                <small style="color: #999; margin-left: auto;">更新: ${lastUpdated}</small>
            </div>
        </div>
    `;
}

// 复制安装命令
function copyInstallCommand(command) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(command).then(() => {
            alert('安装命令已复制到剪贴板！\n' + command);
        });
    } else {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = command;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('安装命令已复制到剪贴板！\n' + command);
    }
}

// 搜索技能
function searchSkills() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!query) {
        filteredSkills = [...allSkills];
    } else {
        filteredSkills = allSkills.filter(skill => 
            skill.name.toLowerCase().includes(query) ||
            skill.description.toLowerCase().includes(query) ||
            skill.author.toLowerCase().includes(query)
        );
    }
    
    currentPage = 1;
    displaySkills();
    
    // 更新过滤器按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
}

// 过滤技能
function filterSkills(type) {
    // 更新按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // 清空搜索框
    document.getElementById('searchInput').value = '';
    
    switch (type) {
        case 'all':
            filteredSkills = [...allSkills];
            break;
        case 'high-download':
            filteredSkills = allSkills.filter(skill => (skill.weeklyDownloads || 0) > 10000);
            break;
        case 'high-stars':
            filteredSkills = allSkills.filter(skill => (skill.stars || 0) > 10);
            break;
        case 'green-audit':
            filteredSkills = allSkills.filter(skill => skill.auditStatus === 'green');
            break;
    }
    
    currentPage = 1;
    displaySkills();
}

// 更新分页
function updatePagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredSkills.length / skillsPerPage);
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    let paginationHTML = '';
    
    // 上一页
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">‹</button>`;
    }
    
    // 页码
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-btn active">${i}</button>`;
        } else {
            paginationHTML += `<button class="page-btn" onclick="goToPage(${i})">${i}</button>`;
        }
    }
    
    // 下一页
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">›</button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

// 跳转页面
function goToPage(page) {
    currentPage = page;
    displaySkills();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 页面初始化
function initializePage() {
    // 搜索框回车事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchSkills();
            }
        });
    }
    
    // 加载技能数据
    loadSkills();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}