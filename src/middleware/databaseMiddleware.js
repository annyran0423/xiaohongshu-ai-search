const Note = require('../models/Note');

// 中间件：验证输入数据
const validateNoteInput = (req, res, next) => {
  try {
    const { noteId, detail } = req.body;

    if (!noteId) {
      return res.status(400).json({ error: '缺少 noteId' });
    }

    if (!detail || !detail.title || !detail.content || !detail.author) {
      return res.status(400).json({ error: '缺少必要的笔记信息' });
    }

    console.log('✅ 输入验证通过');
    next(); // 继续到下一个中间件
  } catch (error) {
    console.error('输入验证失败:', error);
    res.status(400).json({ error: '输入验证失败' });
  }
};

// 中间件：检查重复
const checkDuplicateNote = async (req, res, next) => {
  try {
    const { noteId } = req.body;

    const existingNote = await Note.findOne({ noteId });
    if (existingNote) {
      return res.status(409).json({
        message: '笔记已存在',
        noteId,
        existingNote: existingNote._id
      });
    }

    console.log('✅ 重复检查通过');
    next(); // 继续到下一个中间件
  } catch (error) {
    console.error('重复检查失败:', error);
    res.status(500).json({ error: '重复检查失败' });
  }
};

// 中间件：保存到数据库
const saveToDatabase = async (req, res, next) => {
  try {
    const { noteId, originalInput, timestamp, detail, comments } = req.body;

    const note = new Note({
      noteId,
      originalInput,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      detail,
      comments: comments || [],
      vector: req.vectorizedData || [] // 使用向量化中间件的结果
    });

    await note.save();

    // 将保存的笔记添加到请求对象中
    req.savedNote = note;

    console.log('✅ 数据库保存成功');
    next(); // 继续到下一个中间件
  } catch (error) {
    console.error('保存到数据库失败:', error);
    res.status(500).json({ error: '保存失败' });
  }
};

// 中间件：发送响应
const sendSuccessResponse = (req, res) => {
  // 最后一个中间件，发送成功响应
  res.status(201).json({
    message: '笔记数据保存成功',
    note: {
      id: req.savedNote._id,
      noteId: req.savedNote.noteId,
      title: req.savedNote.detail.title,
      author: req.savedNote.detail.author,
      createdAt: req.savedNote.createdAt,
      hasVector: req.vectorizedData ? true : false
    }
  });
  // 注意：最后一个中间件不需要调用 next()
};

module.exports = {
  validateNoteInput,
  checkDuplicateNote,
  saveToDatabase,
  sendSuccessResponse
};
