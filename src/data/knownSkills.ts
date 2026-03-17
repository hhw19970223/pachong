/**
 * 已知的优质技能仓库列表
 * 这些是从各种来源收集的高质量技能库
 */
export const knownSkillRepositories = [
  // Microsoft 官方技能
  'microsoft/github-copilot-for-azure',
  'microsoft/azure-skills', 
  'microsoft/semantic-kernel',
  'microsoft/autogen',
  'microsoft/TaskWeaver',
  'microsoft/JARVIS',
  'microsoft/PromptCraft-Robotics',

  // OpenAI 相关
  'openai/openai-python',
  'openai/openai-cookbook',

  // Anthropic
  'anthropics/anthropic-sdk-python',

  // 其他知名AI技能项目
  'langchain-ai/langchain',
  'run-llama/llama_index',
  'guidance-ai/guidance',
  'huggingface/transformers',
  'yoheinakajima/babyagi',
  'Significant-Gravitas/Auto-GPT',
  
  // Skills.sh 相关
  'inferen-sh/skills',
  'pbakaus/impeccable',
  'supercent-io/skills-template',
  'coreyhaines31/marketingskills',

  // 其他实用技能库
  'microsoft/playwright',
  'microsoft/vscode',
  'vercel/ai',
  'google/generative-ai',
  'aws/aws-sdk-js-v3',
];

/**
 * 按分类组织的技能仓库
 */
export const categorizedSkills = {
  'AI/ML工具': [
    'microsoft/semantic-kernel',
    'langchain-ai/langchain',
    'run-llama/llama_index',
    'guidance-ai/guidance',
    'huggingface/transformers',
  ],
  
  '微软技能': [
    'microsoft/github-copilot-for-azure',
    'microsoft/azure-skills',
    'microsoft/autogen',
    'microsoft/TaskWeaver',
    'microsoft/JARVIS',
  ],
  
  'OpenAI生态': [
    'openai/openai-python',
    'openai/openai-cookbook',
    'anthropics/anthropic-sdk-python',
  ],
  
  '自动化代理': [
    'yoheinakajima/babyagi',
    'Significant-Gravitas/Auto-GPT',
    'microsoft/PromptCraft-Robotics',
  ],

  '技能平台': [
    'inferen-sh/skills',
    'pbakaus/impeccable',
    'supercent-io/skills-template',
    'coreyhaines31/marketingskills',
  ],

  '开发工具': [
    'microsoft/playwright',
    'microsoft/vscode',
    'vercel/ai',
  ],

  '云服务SDK': [
    'google/generative-ai',
    'aws/aws-sdk-js-v3',
  ],
};

/**
 * 热门技能仓库 (基于常见使用情况)
 */
export const popularSkills = [
  'microsoft/semantic-kernel',
  'langchain-ai/langchain', 
  'openai/openai-python',
  'microsoft/autogen',
  'huggingface/transformers',
  'run-llama/llama_index',
  'microsoft/github-copilot-for-azure',
  'microsoft/azure-skills',
  'yoheinakajima/babyagi',
  'Significant-Gravitas/Auto-GPT',
];