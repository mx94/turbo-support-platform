"use client";

import { useEffect, useState, useRef, type ReactElement } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Bot,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  BarChart3,
  Globe,
  Clock,
  Github,
} from "lucide-react";


const streamingMessages = [
  { role: "user" as const, text: "这个项目的代码结构是怎么划分的？适合拿来二次开发吗？" },
  {
    role: "ai" as const,
    text: "项目采用了 Turborepo 进行包管理。Admin 和 User 两个端作为独立的 Next.js 应用运行，同时复用了位于 packages 目录下的 database 逻辑、ui 组件库和 ts 配置。",
  },
  { role: "user" as const, text: "如果我想替换其中用到的大模型，改动范围大吗？" },
  {
    role: "ai" as const,
    text: "非常小。我们已经在 packages/support 内将对话流与具体的模型提供商进行了解耦封装。您可以直接拔插替换为自己的私有化部署模型，或是其他兼容的 API 服务。",
  },
];

function StreamingChatPreview(): ReactElement {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [currentText, setCurrentText] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages, currentText]);

  useEffect(() => {
    if (visibleMessages >= streamingMessages.length) {
      const timer = setTimeout(() => {
        setVisibleMessages(0);
        setCurrentText("");
      }, 4000);
      return () => { clearTimeout(timer); };
    }

    const msg = streamingMessages[visibleMessages];

    if (msg.role === "user") {
      const timer = setTimeout(() => {
        setVisibleMessages((v) => v + 1);
        setCurrentText("");
      }, 1200);
      return () => { clearTimeout(timer); };
    }

    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < msg.text.length) {
        setCurrentText(msg.text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setVisibleMessages((v) => v + 1);
          setCurrentText("");
        }, 2000);
      }
    }, 25);

    return () => { clearInterval(interval); };
  }, [visibleMessages]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 聊天窗口外框 */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* 窗口标题栏 */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <div className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs font-medium text-muted-foreground">
              项目架构导览
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>

        {/* 消息展示区 */}
        <div 
          ref={scrollContainerRef}
          className="p-4 space-y-4 min-h-[320px] max-h-[320px] overflow-y-auto scrollbar-hide relative"
        >
            {streamingMessages.slice(0, visibleMessages).map((msg) => (
              <div
                key={`${msg.role}-${msg.text.slice(0, 20)}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-secondary text-secondary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {msg.role === "ai" ? (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-secondary" />
                    <span className="text-[10px] font-semibold text-secondary">
                      智能助手
                    </span>
                  </div>
                ) : null}
                {msg.text}
              </div>
            </div>
          ))}

          {/* 当前流式输出的消息 */}
          {visibleMessages < streamingMessages.length &&
            streamingMessages[visibleMessages]?.role === "ai" &&
            currentText !== "" ? (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted text-foreground px-4 py-2.5 text-sm leading-relaxed">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-secondary" />
                    <span className="text-[10px] font-semibold text-secondary">
                      智能助手
                    </span>
                  </div>
                  {currentText}
                  <span className="inline-block w-0.5 h-4 bg-secondary ml-0.5 animate-blink align-middle" />
                </div>
              </div>
            ) : null}

          {/* 打字指示器 */}
          {visibleMessages < streamingMessages.length &&
            streamingMessages[visibleMessages]?.role === "ai" &&
            currentText === "" ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
        </div>

        {/* 输入区域 */}
        <div className="px-4 py-3 border-t border-border/60 bg-muted/20">
          <div className="flex items-center gap-2 rounded-xl bg-background border border-border/60 px-3 py-2">
            <span className="text-sm text-muted-foreground flex-1">
              输入你的问题
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-secondary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


const features = [
  {
    icon: MessageCircle,
    title: "基于 Stream 构建的即时通讯",
    description:
      "使用 Stream Chat SDK 构建并定制了 React 组件库，实现了用户端与管理端的双向实时消息互通、输入状态同步及未读红点处理。",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Sparkles,
    title: "AI 语义分析与意图识别",
    description:
      "引入大模型对用户输入进行意图预判，辅助自动分配工单或提供知识库检索建议，演示了业务端与 LLM 的基础工程化结合。",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-500",
  },
  {
    icon: Shield,
    title: "PostgreSQL 原生 RLS 权限控制",
    description:
      "直接在 Supabase 数据库侧应用 Row-Level Security 策略，确保了工单与消息等核心数据的行级隔离，减少了业务层的鉴权代码堆叠。",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Globe,
    title: "App Router 与 Server Actions",
    description:
      "采用 Next.js 最新的目录结构，大部分数据请求与状态变更均以后端 Server Action 形式处理，降低了客户端 JavaScript 包体积。",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Zap,
    title: "Supabase Realtime 状态下发",
    description:
      "对于消息未读数更新、工单状态流转等低延迟需求场景，系统接入了 WebSocket 通道来替代轮询拉取，减轻了服务端的并发压力。",
    gradient: "from-pink-500/10 to-rose-500/10",
    iconColor: "text-pink-500",
  },
  {
    icon: Clock,
    title: "多端 Monorepo 工程结构",
    description:
      "使用 Turborepo 管理工具，将全栈项目拆解为 admin(客服端)、user(用户端)、database(后端服务)及部分基础组件库模块，方便维护管理。",
    gradient: "from-indigo-500/10 to-violet-500/10",
    iconColor: "text-indigo-500",
  },
];


const integrations = [
  "Vercel",
  "Supabase",
  "Next.js",
  "Stream",
  "Tailwind",
];


export default function Home(): ReactElement {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 背景环境光晕 */}
      <div className="fixed inset-0 bg-hero-glow pointer-events-none" />
      <div className="fixed top-1/3 -right-48 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 -left-48 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />

      {/* ── 导航栏 ── */}
      <nav className="relative z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-violet-700 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Turbo Platform
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              亮点
            </a>
            <a
              href="#demo"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              演示
            </a>
            <a
              href="#integrations"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              生态
            </a>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium hover:bg-secondary/90 transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-[0.98]"
          >
            登 录
          </Link>
        </div>
      </nav>

      {/* ── 核心标题区 ── */}
      <section className="relative z-10 pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* 左侧：文案区 */}
            <div className="space-y-8">
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 border border-secondary/20 px-4 py-1.5 mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-xs font-medium text-secondary">
                    开箱即用的客服工作台方案
                  </span>
                </div>
                <h1 className="text-5xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.2]">
                  基于 Turborepo 架构的<br></br>{" "}
                  <span className="bg-gradient-to-r from-secondary via-violet-400 to-purple-600 bg-clip-text text-transparent">
                    全栈客服系统
                  </span>
                </h1>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg animate-fade-in-up animation-delay-200">
                集成工单流转、实时通讯与知识库管理等核心功能的客服中台骨架。由 Next.js 与 Supabase 原生驱动，为快速构建现代化客户支持方案提供基础底座。
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-secondary-foreground px-8 py-3.5 text-base font-semibold hover:bg-secondary/90 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] active:scale-[0.98] animate-pulse-glow"
                >
                  运行系统演示
                </Link>
                <a
                  href="https://github.com/mx94/turbo-support-platform"
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/50 backdrop-blur-sm text-foreground px-8 py-3.5 text-base font-medium hover:bg-muted/50 transition-all"
                >
                  <Github className="w-4 h-4" />
                  查阅源代码
                </a>
              </div>

              {/* 数据信任展示 */}
              <div className="flex items-center gap-6 pt-4 animate-fade-in-up animation-delay-500">
                <div>
                  <div className="text-2xl font-bold text-foreground">Next.js</div>
                  <div className="text-xs text-muted-foreground">
                    基于 App Router
                  </div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-foreground">双端</div>
                  <div className="text-xs text-muted-foreground">
                    系统分离架构
                  </div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-foreground">WS</div>
                  <div className="text-xs text-muted-foreground">
                    实时状态信道
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：聊天预览 */}
            <div
              className="animate-fade-in-up animation-delay-400 animate-float"
              id="demo"
            >
              <StreamingChatPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── 集成 Logo 展示区 ── */}
      <section
        className="relative z-10 py-16 border-y border-border/40"
        id="integrations"
      >
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground mb-8">
            背后有默默支撑的强大技术底座
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {integrations.map((name) => (
              <span
                key={name}
                className="text-lg font-semibold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors cursor-default select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 特性卡片区 (Bento Grid) ── */}
      <section className="relative z-10 py-24 px-6" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4">
              主要技术实现
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              结合现代 Web 开发生态体系，在性能提升与工程化管理上所作出的实践。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const delayClass = `animation-delay-${String((i + 1) * 100)}`;
              return (
              <div
                key={feature.title}
                className={`group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/5 hover:scale-[1.02] animate-fade-in-up ${delayClass}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 行动召唤区 ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl border border-border/60 bg-gradient-to-b from-secondary/5 to-transparent p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-3xl font-bold tracking-tight text-foreground mb-4">
                开放源代码
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                本项目核心工程已被开源托管。您可以直接获取代码并部署，或在此架构基础上进行二次业务开发。
              </p>
              <a
                href="https://github.com/mx94/turbo-support-platform"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-secondary-foreground px-10 py-4 text-base font-semibold hover:bg-secondary/90 transition-all hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] active:scale-[0.98]"
              >
                <Github className="w-5 h-5" />
                访问 GitHub 仓库
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 页脚 ── */}
      <footer className="relative z-10 border-t border-border/40 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-secondary to-violet-700 flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Turbo Platform
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Turbo Platform. Built with Next.js,
            Supabase & Stream.
          </p>
        </div>
      </footer>
    </div>
  );
}
