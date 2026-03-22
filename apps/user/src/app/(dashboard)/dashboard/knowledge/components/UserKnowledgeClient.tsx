"use client";

import { useState } from "react";
import { 
  BookOpen, Search, Eye, ThumbsUp, ChevronRight 
} from "lucide-react";
import Link from "next/link";

const CAT_STYLE: Record<string, string> = {
  general: "bg-slate-50 text-slate-600",
  billing: "bg-emerald-50 text-emerald-600",
  technical: "bg-blue-50 text-blue-600",
  account: "bg-primary/10 text-primary",
  feature: "bg-amber-50 text-amber-600",
};

export function UserKnowledgeClient({ articles, categories }: { articles: any[], categories: string[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredArticles = articles.filter(a => {
    const matchCat = activeCategory === "all" || a.category === activeCategory;
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* ── 头部 ── */}
        <div className="page-header animate-fade-in-up">
          <div className="page-badge">
            <BookOpen className="w-3 h-3" />
            <span>知识库</span>
          </div>
          <h1 className="page-title">文档中心</h1>
          <p className="page-subtitle">浏览文章与信息，学习知识与技巧</p>
        </div>

        {/* ── 搜索 ── */}
        <div className="relative animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索帮助文章..."
            className="w-full h-11 pl-11 pr-4 glass-card rounded-xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>

        {/* ── 分类标签 ── */}
        <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {cat === "all" ? "全部" : cat}
            </button>
          ))}
        </div>

        {/* ── 文章网格 ── */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article: any, i: number) => {
              const style = CAT_STYLE[article.category] ?? CAT_STYLE.general;
              return (
                <Link
                  key={article.id}
                  href={`/dashboard/knowledge/${article.id}`}
                  className="group glass-card rounded-2xl p-5 cursor-pointer hover-lift animate-fade-in-up block"
                  style={{ animationDelay: `${(i + 3) * 60}ms` }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${style}`}>
                        {article.category}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {article.content?.substring(0, 120)}...
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3.5 text-[11px] text-muted-foreground/60">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {article.helpful_count}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/50 font-medium">
                        {new Date(article.updated_at || article.created_at).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-2xl animate-fade-in-up">
            <div className="empty-state py-12">
              <div className="empty-state-icon">
                <BookOpen className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="empty-state-title text-sm">暂无匹配文章</p>
              <p className="empty-state-desc mt-1">没有找到符合条件的内容或知识库尚为空。</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
