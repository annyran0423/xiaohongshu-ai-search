const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 配置
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const NOTES_DIR = path.join(__dirname, '../../notes');

async function uploadSingleNote(filePath) {
  try {
    const fileName = path.basename(filePath);
    console.log(`📤 正在上传: ${fileName}`);

    // 读取文件内容
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const noteData = JSON.parse(fileContent);

    // 发送 POST 请求
    const response = await axios.post(`${API_BASE_URL}/notes`, noteData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30秒超时
    });

    if (response.status === 201) {
      console.log(`✅ 成功上传: ${fileName} - ${noteData.detail.title}`);
      return { success: true, fileName, noteId: noteData.noteId };
    } else if (response.status === 409) {
      console.log(`⚠️  已存在跳过: ${fileName} - ${noteData.detail.title}`);
      return { success: false, reason: 'exists', fileName, noteId: noteData.noteId };
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log(`⚠️  已存在跳过: ${path.basename(filePath)}`);
      return { success: false, reason: 'exists', fileName: path.basename(filePath) };
    } else {
      console.error(`❌ 上传失败: ${path.basename(filePath)} - ${error.message}`);
      return { success: false, reason: 'error', fileName: path.basename(filePath), error: error.message };
    }
  }
}

async function batchUpload(directory = NOTES_DIR, concurrent = 3) {
  try {
    console.log(`📁 开始批量上传目录: ${directory}`);
    console.log(`🔄 并发数: ${concurrent}`);

    // 读取目录中的所有 JSON 文件
    const files = fs.readdirSync(directory)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(directory, file));

    console.log(`📋 发现 ${files.length} 个 JSON 文件`);

    if (files.length === 0) {
      console.log('❌ 没有找到 JSON 文件');
      return;
    }

    // 分批处理，控制并发数
    const results = {
      success: 0,
      exists: 0,
      errors: 0,
      total: files.length
    };

    for (let i = 0; i < files.length; i += concurrent) {
      const batch = files.slice(i, i + concurrent);
      console.log(`\n🔄 处理批次 ${Math.floor(i / concurrent) + 1}/${Math.ceil(files.length / concurrent)}`);

      // 并发处理当前批次
      const promises = batch.map(file => uploadSingleNote(file));
      const batchResults = await Promise.all(promises);

      // 统计结果
      batchResults.forEach(result => {
        if (result.success) {
          results.success++;
        } else if (result.reason === 'exists') {
          results.exists++;
        } else {
          results.errors++;
        }
      });

      // 批次间暂停，避免服务器压力过大
      if (i + concurrent < files.length) {
        console.log('⏱️  暂停 1 秒...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 输出最终统计
    console.log('\n📊 批量上传完成统计:');
    console.log(`✅ 成功上传: ${results.success} 个`);
    console.log(`⚠️  已存在跳过: ${results.exists} 个`);
    console.log(`❌ 上传失败: ${results.errors} 个`);
    console.log(`📝 总计处理: ${results.total} 个文件`);

    return results;

  } catch (error) {
    console.error('❌ 批量上传过程出错:', error);
    throw error;
  }
}

// 检查服务器连接
async function checkServerConnection() {
  try {
    console.log(`🔍 检查服务器连接: ${API_BASE_URL}`);
    const response = await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
    console.log(`✅ 服务器连接正常: ${response.data.message}`);
    return true;
  } catch (error) {
    console.error(`❌ 无法连接到服务器: ${API_BASE_URL}`);
    console.error(`   错误信息: ${error.message}`);
    console.error(`   请确保服务器已启动并运行在正确的端口上`);
    return false;
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  // 解析参数
  let targetDir = NOTES_DIR;
  let concurrent = 3;

  if (args.length > 0) {
    targetDir = path.resolve(args[0]);
  }

  if (args.length > 1) {
    concurrent = parseInt(args[1]) || 3;
  }

  console.log('🚀 小红书笔记批量上传工具');
  console.log('================================');

  // 检查目录是否存在
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ 目录不存在: ${targetDir}`);
    process.exit(1);
  }

  // 检查服务器连接
  const serverOk = await checkServerConnection();
  if (!serverOk) {
    process.exit(1);
  }

  // 开始批量上传
  try {
    await batchUpload(targetDir, concurrent);
    console.log('\n🎉 批量上传任务完成！');
  } catch (error) {
    console.error('\n💥 批量上传任务失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main().catch(error => {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { batchUpload, uploadSingleNote, checkServerConnection };
