"use client";

import { useState } from "react";
import { Plus, Globe, Search, Eye, ThumbsUp, Pencil, Trash2, GlobeLock, Link, Loader2 } from "lucide-react";
import { toast } from "@repo/ui/components/ui/toast";
import { scrapeAndImportArticle, updateArticle, deleteArticle } from "../actions";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  is_published: boolean;
  view_count: number;
  helpful_count: number;
  updated_at: string;
}

interface Props {
  list: Article[];
  adminUserId: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function AdminKnowledgeClient({ list, adminUserId }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredList = list.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statData = [
    { label: "全部文章", value: list.length, color: "text-foreground" },
    { label: "已发布", value: list.filter(a => a.is_published).length, color: "text-emerald-600" },
    { label: "草稿", value: list.filter(a => !a.is_published).length, color: "text-amber-600" },
  ];

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) {
      toast({ title: "错误", description: "请输入有效的网页链接", variant: "error" });
      return;
    }

    setIsScraping(true);
    try {
      const result = await scrapeAndImportArticle(scrapeUrl.trim(), adminUserId);
      if (result.success) {
        toast({ title: "导入成功", description: result.message });
        setIsModalOpen(false);
        setScrapeUrl("");
      } else {
        toast({ title: "导入失败", description: result.message, variant: "error" });
      }
    } catch (error) {
       toast({ title: "导入失败", description: "发生未知网络错误", variant: "error" });
    } finally {
      setIsScraping(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("确定要删除这篇文章吗？操作不可恢复。")) return;
    
    setIsDeleting(id);
    try {
      const res = await deleteArticle(id);
      if (res.success) {
        toast({ title: "删除成功", description: "文章已从知识库中移除" });
      } else {
        toast({ title: "删除失败", description: res.message, variant: "error" });
      }
    } catch (err) {
      toast({ title: "删除失败", description: "网络错误", variant: "error" });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingArticle) return;
    
    setIsSaving(true);
    try {
      const res = await updateArticle(editingArticle.id, {
        title: editingArticle.title,
        content: editingArticle.content,
        category: editingArticle.category,
        is_published: editingArticle.is_published
      });
      if (res.success) {
        toast({ title: "保存成功", description: "文章更新已生效" });
        setEditingArticle(null);
      } else {
        toast({ title: "保存失败", description: res.message, variant: "error" });
      }
    } catch (err) {
      toast({ title: "保存失败", description: "网络错误", variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* ── 头部 ── */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div className="page-header">
          <div className="page-badge">
            <Globe className="w-3 h-3" />
            <span>知识库管理</span>
          </div>
          <h1 className="page-title">文章管理</h1>
          <p className="page-subtitle">创建和管理帮助中心的知识库文章。</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-indigo-50 px-4 text-xs font-medium text-indigo-600 cursor-pointer border border-indigo-100 hover:bg-indigo-100 transition-all"
           >
            <Link className="w-3.5 h-3.5" />
            外部链接入库
          </button>
          <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground cursor-pointer hover:bg-primary/90 shadow-sm transition-all">
            <Plus className="w-3.5 h-3.5" />
            新建文章
          </button>
        </div>
      </div>

      {/* ── 统计 ── */}
      <div className="grid grid-cols-3 gap-3">
        {statData.map((s, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="stat-card-label">{s.label}</span>
            <span className={`stat-card-value ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── 搜索 ── */}
      <div className="relative animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索文章标题..."
          className="w-full h-10 pl-11 pr-4 glass-card rounded-xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* ── 文章列表 ── */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "260ms" }}>
        {filteredList.map((article: any, i: number) => (
          <div
            key={article.id}
            onClick={() => setEditingArticle(article)}
            className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer ${
              i !== list.length - 1 ? "border-b border-border/20" : ""
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              article.is_published ? "bg-emerald-50" : "bg-amber-50"
            }`}>
              {article.is_published ? (
                 <Globe className="w-4 h-4 text-emerald-600" />
              ) : (
                <GlobeLock className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-semibold text-foreground truncate">{article.title}</h3>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  article.is_published ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                }`}>
                  {article.is_published ? "已发布" : "草稿"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{article.content?.substring(0, 80)}...</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground/60">
                <span className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px]">{article.category}</span>
                <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{article.view_count}</span>
                <span className="flex items-center gap-0.5"><ThumbsUp className="w-3 h-3" />{article.helpful_count}</span>
                <span>更新于 {formatDate(article.updated_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button 
                onClick={(e) => { e.stopPropagation(); setEditingArticle(article); }}
                className="w-7 h-7 rounded-lg hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="编辑文章"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => handleDelete(article.id, e)}
                disabled={isDeleting === article.id}
                className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer transition-colors disabled:opacity-50"
                title="删除文章"
              >
                {isDeleting === article.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}

        {filteredList.length === 0 && (
          <div className="empty-state py-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <GlobeLock className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <p className="font-medium text-sm text-foreground">暂无文章</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">点击右上角「外部链接入库」快速抓取一篇吧。</p>
          </div>
        )}
      </div>

       {/* ── 抓取文章对话框 ── */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !isScraping && setIsModalOpen(false)} />
          <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <Link className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">抓取外部文章</h3>
                  <p className="text-sm text-muted-foreground mt-1">自动提取排版干净的 Markdown 并作为草稿保存到本系统的知识库。</p>
                </div>
              </div>
              
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">源文章链接 (URL)</label>
                  <input
                    type="url"
                    placeholder="https://help.example.com/article"
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                    disabled={isScraping}
                    className="w-full h-10 px-3 flex rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  disabled={isScraping}
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 rounded-md border border-input bg-background text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={isScraping}
                  onClick={handleScrape}
                  className="h-9 px-4 rounded-md bg-indigo-600 text-primary-foreground text-sm font-medium shadow hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {isScraping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      提取中...
                    </>
                  ) : (
                    "开始抓取"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 编辑文章对话框 ── */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !isSaving && setEditingArticle(null)} />
          <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-border/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">编辑文章</h3>
                <p className="text-sm text-muted-foreground mt-0.5">修改知识库文章的标题、类别与正文详细内容。</p>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">标题</label>
                <input
                  type="text"
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                  className="w-full h-10 px-3 flex rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">分类</label>
                  <input
                    type="text"
                    value={editingArticle.category}
                    onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})}
                    className="w-full h-10 px-3 flex rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">状态</label>
                  <div className="flex h-10 items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input 
                        type="radio" 
                        name="article-status" 
                        checked={editingArticle.is_published}
                        onChange={() => setEditingArticle({...editingArticle, is_published: true})}
                        className="accent-primary"
                      />
                      <span className={editingArticle.is_published ? "text-emerald-600 font-medium" : ""}>已发布</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input 
                        type="radio" 
                        name="article-status" 
                        checked={!editingArticle.is_published}
                        onChange={() => setEditingArticle({...editingArticle, is_published: false})}
                        className="accent-primary"
                      />
                      <span className={!editingArticle.is_published ? "text-amber-600 font-medium" : ""}>草稿</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Markdown 正文</label>
                <textarea
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                  className="w-full min-h-[300px] p-3 flex rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono resize-y"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border/50 bg-muted/20 flex justify-end gap-3 mt-auto">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setEditingArticle(null)}
                className="h-9 px-4 rounded-md border border-input bg-background text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEdit}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "保存修改"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
