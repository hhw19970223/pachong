import { skillsShScraper } from '../src/services/skillsShScraper';
import logger from '../src/utils/logger';

async function testSkillsScraper() {
  console.log('🕷️ 开始测试 Skills.sh 爬虫...\n');

  try {
    // 测试1: 爬取前5个技能
    console.log('📋 测试1: 爬取 Skills.sh 前5个技能');
    console.log('='.repeat(50));
    
    const topSkills = await skillsShScraper.scrapeTopSkills(5);
    
    console.log(`✅ 成功爬取 ${topSkills.skills.length} 个技能:`);
    console.log(`📅 爬取时间: ${topSkills.scrapedAt}`);
    console.log();

    topSkills.skills.forEach((skill, index) => {
      console.log(`🏆 第${skill.rank}名: ${skill.title}`);
      console.log(`👤 作者: ${skill.author}`);
      console.log(`📝 描述: ${skill.description.substring(0, 100)}${skill.description.length > 100 ? '...' : ''}`);
      console.log(`🔗 仓库: ${skill.repository}`);
      console.log(`⭐ 星标: ${skill.stars}`);
      if (skill.tags && skill.tags.length > 0) {
        console.log(`🏷️ 标签: ${skill.tags.join(', ')}`);
      }
      console.log();
    });

    // 测试2: 爬取指定仓库
    console.log('\n📋 测试2: 爬取指定GitHub仓库技能信息');
    console.log('='.repeat(50));
    
    const specificRepos = [
      'microsoft/github-copilot-for-azure',
      'inferen-sh/skills',
      'microsoft/azure-skills',
      'pbakaus/impeccable',
      'supercent-io/skills-template'
    ];

    console.log(`🎯 目标仓库: ${specificRepos.length} 个`);
    specificRepos.forEach(repo => console.log(`   - ${repo}`));
    console.log();

    const repoSkills = await skillsShScraper.scrapeSkillsFromRepos(specificRepos);
    
    console.log(`✅ 成功处理 ${repoSkills.skills.length} 个仓库:`);
    console.log();

    repoSkills.skills.forEach(skill => {
      console.log(`📦 ${skill.title}`);
      console.log(`👤 作者: ${skill.author}`);
      console.log(`📝 描述: ${skill.description.substring(0, 80)}${skill.description.length > 80 ? '...' : ''}`);
      console.log(`🔗 仓库: ${skill.repository}`);
      console.log(`⭐ 星标: ${skill.stars}`);
      if (skill.lastUpdated) {
        console.log(`🕐 更新: ${new Date(skill.lastUpdated).toLocaleDateString()}`);
      }
      if (skill.tags && skill.tags.length > 0) {
        console.log(`🏷️ 标签: ${skill.tags.slice(0, 5).join(', ')}`);
      }
      console.log();
    });

    // 汇总信息
    console.log('📊 爬取汇总:');
    console.log('='.repeat(50));
    console.log(`🎯 Skills.sh爬取: ${topSkills.skills.length} 个技能`);
    console.log(`📦 GitHub仓库爬取: ${repoSkills.skills.length} 个技能`);
    console.log(`⭐ 平均星标数: ${Math.round(repoSkills.skills.reduce((sum, s) => sum + s.stars, 0) / repoSkills.skills.length)}`);
    console.log(`🏷️ 总标签数: ${repoSkills.skills.reduce((sum, s) => sum + (s.tags?.length || 0), 0)}`);

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

async function main() {
  await testSkillsScraper();
  process.exit(0);
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

export { testSkillsScraper };