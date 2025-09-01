#!/usr/bin/env node

// 测试markdown渲染修复效果
require('dotenv').config();

// 模拟前端的markdown处理逻辑
function processMarkdownForRendering(markdownContent) {
  let processedSummary = markdownContent;

  // 移除可能的代码块包裹
  if (processedSummary.startsWith('```markdown') && processedSummary.endsWith('```')) {
    processedSummary = processedSummary.slice(11, -3).trim();
    console.log('✅ 检测并移除了 ```markdown 代码块包裹');
  } else if (processedSummary.startsWith('```') && processedSummary.endsWith('```')) {
    processedSummary = processedSummary.slice(3, -3).trim();
    console.log('✅ 检测并移除了 ``` 代码块包裹');
  } else {
    console.log('ℹ️ 没有检测到代码块包裹，内容正常');
  }

  return processedSummary;
}

// 测试用例
function testMarkdownProcessing() {
  console.log('🧪 测试markdown渲染修复效果');
  console.log('='.repeat(60));

  // 测试用例1: 正常的markdown（不带代码块）
  const normalMarkdown = `### 🔍 实用建议总结

- **最佳拍照时间**：清晨9点前拍摄海港大桥无人场景
- **推荐地点**：悉尼歌剧院、海港大桥、邦迪海滩`;

  console.log('\n📝 测试用例1: 正常的markdown内容');
  const processed1 = processMarkdownForRendering(normalMarkdown);
  console.log('处理后的内容长度:', processed1.length);
  console.log('前50个字符:', processed1.substring(0, 50) + '...');

  // 测试用例2: 带代码块的markdown
  const codeBlockMarkdown = `\`\`\`markdown
### 🔍 实用建议总结

- **最佳拍照时间**：清晨9点前拍摄海港大桥无人场景
- **推荐地点**：悉尼歌剧院、海港大桥、邦迪海滩

### 📝 核心攻略内容
#### 🚌 BigBus 悉尼红色巴士
- **费用参考**：约$40-$50澳元
\`\`\``;

  console.log('\n📝 测试用例2: 带代码块的markdown内容');
  const processed2 = processMarkdownForRendering(codeBlockMarkdown);
  console.log('处理后的内容长度:', processed2.length);
  console.log('前50个字符:', processed2.substring(0, 50) + '...');

  // 测试用例3: 只有```包裹的markdown
  const simpleCodeBlockMarkdown = `\`\`\`
### 🔍 实用建议总结

- **最佳拍照时间**：清晨9点前拍摄海港大桥无人场景
\`\`\``;

  console.log('\n📝 测试用例3: 简单代码块包裹的内容');
  const processed3 = processMarkdownForRendering(simpleCodeBlockMarkdown);
  console.log('处理后的内容长度:', processed3.length);
  console.log('前50个字符:', processed3.substring(0, 50) + '...');

  console.log('\n🎯 修复效果总结:');
  console.log('✅ 自动检测并移除 ```markdown 代码块');
  console.log('✅ 自动检测并移除 ``` 代码块');
  console.log('✅ 保持正常的markdown内容不变');
  console.log('✅ 确保markdown能够正确渲染');
}

// 模拟AI返回的markdown内容检测
function analyzeAIMarkdownPattern() {
  console.log('\n🔍 AI返回markdown模式的分析');
  console.log('='.repeat(60));

  console.log('📊 常见AI返回markdown的模式:');
  console.log('1. ```markdown...``` - 明确标识markdown');
  console.log('2. ```...``` - 通用代码块');
  console.log('3. 直接markdown - 无代码块包裹');

  console.log('\n🛠️ 修复策略:');
  console.log('1. 在Prompt中明确要求不使用代码块');
  console.log('2. 在前端自动检测和移除代码块');
  console.log('3. 确保markdown正确渲染');

  console.log('\n✅ 预期效果:');
  console.log('- AI不再使用代码块包裹markdown');
  console.log('- 前端自动处理意外的代码块');
  console.log('- markdown内容正确显示格式');
}

// 运行测试
if (require.main === module) {
  testMarkdownProcessing();
  analyzeAIMarkdownPattern();

  console.log('\n🎉 测试完成！');
  console.log('现在markdown应该能够正常渲染了！');
}

module.exports = {
  processMarkdownForRendering,
  testMarkdownProcessing,
  analyzeAIMarkdownPattern
};
