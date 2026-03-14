import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export interface ArticleFormData {
  id?: string;
  title: string;
  category: string;
  content: string;
  is_published: boolean;
}

interface ArticleEditorModalProps {
  isOpen: boolean;
  initialData: ArticleFormData | null;
  onClose: () => void;
  onSave: (data: ArticleFormData) => Promise<void>;
}

export function ArticleEditorModal({ isOpen, initialData, onClose, onSave }: ArticleEditorModalProps) {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    category: "",
    content: "",
    is_published: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(initialData);
    } else if (!isOpen) {
      // 重置表单以防下次打开遗留老数据
      setFormData({ title: "", category: "", content: "", is_published: false });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isCreating = !formData.id;

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !isSaving && onClose()} />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-border/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{isCreating ? "新建文章" : "编辑文章"}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isCreating ? "撰写一篇新的知识库文章。" : "修改知识库文章的标题、类别与正文详细内容。"}
            </p>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full h-10 px-3 flex rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="例如：如何重置密码？"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">分类</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full h-10 px-3 flex rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="例如：常见问题"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">状态</label>
              <div className="flex h-10 items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="radio" 
                    name="article-status" 
                    checked={formData.is_published}
                    onChange={() => setFormData({...formData, is_published: true})}
                    className="accent-primary"
                  />
                  <span className={formData.is_published ? "text-emerald-600 font-medium" : ""}>已发布</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="radio" 
                    name="article-status" 
                    checked={!formData.is_published}
                    onChange={() => setFormData({...formData, is_published: false})}
                    className="accent-primary"
                  />
                  <span className={!formData.is_published ? "text-amber-600 font-medium" : ""}>草稿</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Markdown 正文</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full min-h-[300px] p-3 flex rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono resize-y"
              placeholder="在此输入 Markdown 格式的文章正文..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/50 bg-muted/20 flex justify-end gap-3 mt-auto">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-input bg-background text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSubmit}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </>
            ) : (
              "保存"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
