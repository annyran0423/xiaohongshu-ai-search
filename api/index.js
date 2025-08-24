// Vercel Serverless Function - 主页
module.exports = (req, res) => {
  res.status(200).json({
    message: '小红书AI搜索服务已启动',
    timestamp: new Date().toISOString(),
    environment: 'Vercel Serverless'
  });
};
