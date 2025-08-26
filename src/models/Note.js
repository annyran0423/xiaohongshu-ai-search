const mongoose = require('mongoose');

// 小红书笔记数据模型
const noteSchema = new mongoose.Schema({
  noteId: { type: String, required: true, unique: true },
  originalInput: { type: String },
  timestamp: { type: Date, default: Date.now },
  detail: {
    id: { type: String },
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    stats: {
      likes: { type: String, default: "0" },
      comments: { type: String, default: "0" },
      collects: { type: String, default: "0" }
    },
    images: [{ type: String }],
    url: { type: String }
  },
  comments: [{ type: mongoose.Schema.Types.Mixed }],
  vector: { type: [Number], default: [] },
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

// 添加索引提高查询性能
noteSchema.index({ noteId: 1 }, { unique: true });
noteSchema.index({ 'detail.author': 1 });
noteSchema.index({ 'detail.title': 'text', 'detail.content': 'text' });
noteSchema.index({ createdAt: -1 });

// 实例方法：生成摘要
noteSchema.methods.getSummary = function () {
  return {
    id: this._id,
    noteId: this.noteId,
    title: this.detail.title,
    author: this.detail.author,
    createdAt: this.createdAt,
    hasVector: this.vector && this.vector.length > 0
  };
};

// 静态方法：查找相似笔记
noteSchema.statics.findByAuthor = function (author) {
  return this.find({ 'detail.author': new RegExp(author, 'i') });
};

// 静态方法：全文搜索
noteSchema.statics.searchByKeyword = function (keyword) {
  return this.find({
    $text: { $search: keyword }
  });
};

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
