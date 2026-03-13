"use server";

import { createAdminClient } from "@repo/database/server";
import { revalidatePath } from "next/cache";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

export async function scrapeAndImportArticle(url: string, adminUserId: string) {
  try {
    // 1. 本地直连抓取原始 HTML 内容
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`获取源网页失败: HTTP ${response.status}`);
    }

    const htmlContent = await response.text();
    
    // 2. 使用原生 DOM 解析和 Mozilla 的阅读模式引擎清洗杂散元素
    const doc = new JSDOM(htmlContent, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article || !article.content) {
      throw new Error("无法从该网页中识别出有效的文章正文");
    }

    let title = article.title || "Imported Article";

    // 3. 将干净的 HTML 转换为完美的 Markdown 文本
    const turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });

    // 过滤并还原第三方平台的重定向外链
    // 采用易于扩展的映射表结构：Key 为重定向平台的特征域名/路径，Value 为真正目标链接所在的 URL 参数名
    const REDIRECT_PLATFORMS: Record<string, string> = {
      // 掘金
      'link.juejin.cn': 'target',
      // 知乎
      'link.zhihu.com': 'target',
      // 简书
      'links.jianshu.com/go': 'to',      
      'jianshu.com/go-wild': 'url',      
      // CSDN
      'link.csdn.net': 'target',
      // Gitee
      'gitee.com/link': 'target',
      // OSChina (开源中国)
      'oschina.net/action/GoToLink': 'url',
      // 腾讯云开发者社区
      'cloud.tencent.com/developer/tools/blog-entry': 'target',
      // 少数派
      'sspai.com/link': 'target',
      // InfoQ
      'infoq.cn/link': 'target',
      // 微博
      'weibo.cn/sinaurl': 'u',
      // 哔哩哔哩 (专栏等)
      'bilibili.com/blackboard/dynamic': 'target'
    };

    turndownService.addRule('redirect-links', {
      filter: 'a',
      replacement: function (content, node) {
        let href = (node as HTMLAnchorElement).getAttribute('href');
        if (href) {
          try {
            const urlObj = new URL(href, 'https://example.com');
            // 遍历拦截规则表
            for (const [platformRule, targetParam] of Object.entries(REDIRECT_PLATFORMS)) {
              // 检测 URL 整体路径（hostname + pathname）是否包含该前缀特征
              const fullPathUrl = urlObj.hostname + urlObj.pathname;
              if (fullPathUrl.includes(platformRule) || urlObj.hostname.includes(platformRule)) {
                const realTarget = urlObj.searchParams.get(targetParam);
                if (realTarget) {
                  href = decodeURIComponent(realTarget);
                  break; // 成功解析后退出循环
                }
              }
            }
          } catch (e) {
            // 原链接如果并非有效的 url obj，则直接静默捕获，保持原本的原样抓取兜底
          }
        }
        const title = (node as HTMLAnchorElement).title ? ` "${(node as HTMLAnchorElement).title}"` : '';
        return href ? `[${content}](${href}${title})` : `[${content}]`;
      }
    });
    
    // 优化：去除首尾空格
    const markdownContent = turndownService.turndown(article.content).trim();
    
    if (markdownContent.length < 10) {
      throw new Error("文章提纯后内容过短，抓取取消");
    }

    // 2. 将文章存入 Supabase Database 
    const supabaseAdmin = createAdminClient();
    const { error: insertError } = await supabaseAdmin.from("knowledge_base").insert({
      title: title,
      content: markdownContent,
      author_id: adminUserId,
      category: "Imported",     // 默认分类
      is_published: false,       // 默认存为草稿，需审阅后发布
    });

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      throw new Error("Failed to insert article into database");
    }

    // 3. 刷新相关页面缓存
    revalidatePath("/knowledge");

    return { success: true, message: "文章已成功抓取并作为草稿入库" };
  } catch (error: any) {
    console.error("Error scraping and importing:", error);
    return { success: false, message: error.message || "请求失败" };
  }
}

export async function updateArticle(id: string, updates: any) {
  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("knowledge_base").update(updates).eq("id", id);
    if (error) throw error;
    revalidatePath("/knowledge");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating article:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteArticle(id: string) {
  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("knowledge_base").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/knowledge");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting article:", error);
    return { success: false, message: error.message };
  }
}
