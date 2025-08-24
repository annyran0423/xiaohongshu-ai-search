const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 简化版批量上传脚本
async function quickUpload() {
  const notesDir = path.join(__dirname, '../../notes');
  const apiUrl = 'http://localhost:3000/notes';

  console.log('🚀 开始批量上传小红书笔记...\n');

  try {
    // 读取所有 JSON 文件
    const files = fs.readdirSync(notesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(notesDir, file));

    console.log(`📁 发现 ${files.length} 个文件\n`);

    let success = 0, exists = 0, errors = 0;

    // 逐个上传文件
    for (const file of files) {
      const fileName = path.basename(file);

      try {
        // 读取并解析 JSON
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));

        // 发送请求
        const response = await axios.post(apiUrl, data, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });

        console.log(`✅ ${fileName} - ${data.detail.title}`);
        success++;

      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️  ${fileName} - 已存在，跳过`);
          exists++;
        } else {
          console.log(`❌ ${fileName} - 上传失败: ${error.message}`);
          errors++;
        }
      }

      // 每次上传后暂停 500ms，避免服务器压力
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 输出统计结果
    console.log('\n📊 上传完成统计:');
    console.log(`✅ 成功: ${success} 个`);
    console.log(`⚠️  跳过: ${exists} 个`);
    console.log(`❌ 失败: ${errors} 个`);
    console.log(`📝 总计: ${files.length} 个`);

  } catch (error) {
    console.error('💥 批量上传失败:', error.message);
  }
}

// 运行脚本
quickUpload();
