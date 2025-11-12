import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import coachSentinelPrompt from '@/prompts/coach-sentinel.md?raw';
import type { ChatMessage } from '@/types';

export class FitnessCoachChain {
  private llm: ChatGoogleGenerativeAI;
  private chatHistory: ChatMessage[] = [];

  constructor(apiKey: string) {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey,
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxRetries: 2,
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      // Build LangChain-style messages: system + history + new human message
      const systemPrompt = this.buildContext();
      const messages: Array<[string, string]> = [
        ['system', systemPrompt],
        ...this.chatHistory.map((msg) => [msg.role === 'user' ? 'human' : 'ai', msg.content] as [string, string]),
        ['human', message],
      ];

      const aiMsg = await this.llm.invoke(messages);
      const text = typeof aiMsg.content === 'string'
        ? aiMsg.content
        : Array.isArray(aiMsg.content)
          ? aiMsg.content.map((c: any) => (typeof c === 'string' ? c : c?.text || '')).join('')
          : '';

      // Update chat history
      this.chatHistory.push({
        id: Date.now().toString(),
        content: message,
        role: 'user',
        timestamp: new Date()
      });

      this.chatHistory.push({
        id: (Date.now() + 1).toString(),
        content: text,
        role: 'assistant',
        timestamp: new Date()
      });

      // Keep only last 10 messages to prevent context from getting too long
      if (this.chatHistory.length > 10) {
        this.chatHistory = this.chatHistory.slice(-10);
      }

      return text;
    } catch (error) {
      console.error('Error sending message via LangChain Gemini:', error);
      throw new Error('Failed to get AI response. Please check your API key and try again.');
    }
  }

  private buildContext(): string {
    return coachSentinelPrompt;
  }

  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  setChatHistory(history: ChatMessage[]): void {
    this.chatHistory = history.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  }
}