import { type ReactElement } from "react";
import { Bot } from "lucide-react";

export default function AIChatPage(): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 space-y-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
        <Bot className="w-8 h-8 text-emerald-500" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">智能助手</h2>
      <p className="text-muted-foreground max-w-md">
        与 AI 助手自由交流，获取即时帮助和专业建议。
      </p>
    </div>
  );
}
