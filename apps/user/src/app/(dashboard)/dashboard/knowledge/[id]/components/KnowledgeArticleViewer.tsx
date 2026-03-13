"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye, ThumbsUp, Calendar, BookOpen, ArrowUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
import { incrementViewCount } from "../actions";
import { useRef } from "react";

const CAT_STYLE: Record<string, string> = {
  general: "bg-slate-50 text-slate-600",
  billing: "bg-emerald-50 text-emerald-600",
  technical: "bg-blue-50 text-blue-600",
  account: "bg-primary/10 text-primary",
  feature: "bg-amber-50 text-amber-600",
};

export function KnowledgeArticleViewer({ article }: { article: any }) {
  const router = useRouter();
  const [viewCount, setViewCount] = useState(article.view_count || 0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 组件挂载时触发异步自增阅读量
    let mounted = true;
    incrementViewCount(article.id).then((res) => {
      if (res.success && mounted) {
        setViewCount((prev: number) => prev + 1);
      }
    });

    const mainScrollContainer = document.querySelector('main.overflow-y-auto') as HTMLElement;
    const target = mainScrollContainer || window;

    const handleScroll = () => {
      const scrollPos = mainScrollContainer ? mainScrollContainer.scrollTop : window.scrollY;
      setShowScrollTop(scrollPos > 300);
    };
    
    target.addEventListener("scroll", handleScroll as EventListener);

    return () => { 
      mounted = false; 
      target.removeEventListener("scroll", handleScroll as EventListener);
    };
  }, [article.id]);

  const scrollToTop = () => {
    const mainScrollContainer = document.querySelector('main.overflow-y-auto');
    if (mainScrollContainer) {
      mainScrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const style = CAT_STYLE[article.category] ?? CAT_STYLE.general;
  const publishDate = new Date(article.updated_at || article.created_at).toLocaleDateString("zh-CN", { 
    year: "numeric", month: "long", day: "numeric" 
  });

  return (
    <>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        {/* ── 导航与返回 ── */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回知识库
        </button>

      {/* ── 文章头部信源 ── */}
      <div className="space-y-4 border-b border-border/40 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5 ${style}`}>
            <BookOpen className="w-3.5 h-3.5" />
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {publishDate}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 ml-auto">
            <Eye className="w-4 h-4" /> {viewCount} 次阅读
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {article.title}
        </h1>
      </div>

      {/* ── Markdown 渲染正文 ── */}
      <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert prose-indigo max-w-none prose-headings:font-bold prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </div>

      {/* ── 底部互动 ── */}
      <div className="pt-10 pb-20 border-t border-border/40 mt-12 flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-medium text-muted-foreground">这篇文章对您有帮助吗？</p>
        <div className="flex gap-3">
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-muted/50 px-6 text-sm font-medium text-foreground hover:bg-emerald-50 hover:text-emerald-600 transition-colors border border-transparent hover:border-emerald-100">
            <ThumbsUp className="w-4 h-4" />
            有帮助 ({article.helpful_count || 0})
          </button>
        </div>
      </div>
    </div>

      {/* ── 回到顶部悬浮按钮 ── */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-3 rounded-full bg-primary/90 text-primary-foreground shadow-xl hover:bg-primary transition-all duration-300 z-50 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="回到顶部"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </>
  );
}
