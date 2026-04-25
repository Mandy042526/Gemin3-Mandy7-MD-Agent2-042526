import { useState } from 'react';
import { useAppContext } from '../../store';
import { generateContent } from '../../services/geminiService';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, MessageSquare, CheckSquare, Map } from 'lucide-react';
import Markdown from 'react-markdown';

export default function WowFeaturesTab() {
  const { language, model } = useAppContext();
  const [context, setContext] = useState('');
  
  // Chatbot State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  // Checklist State
  const [checklist, setChecklist] = useState<{item: string, done: boolean}[]>([]);
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);

  // Gap Analysis State
  const [gapAnalysis, setGapAnalysis] = useState('');
  const [isGeneratingGap, setIsGeneratingGap] = useState(false);

  const t = {
    title: language === 'en' ? 'WOW AI Features' : 'WOW AI 功能',
    desc: language === 'en' ? 'Explore advanced AI features based on your guidance context.' : '探索基於您的指引上下文的進階 AI 功能。',
    contextLabel: language === 'en' ? 'Context (Guidance/Report)' : '上下文 (指引/報告)',
    chatTitle: language === 'en' ? 'Interactive Q&A Chatbot' : '互動式問答聊天機器人',
    checklistTitle: language === 'en' ? 'Auto-generate Submission Checklist' : '自動生成提交清單',
    gapTitle: language === 'en' ? 'AI Compliance Gap Analysis' : 'AI 合規差距分析',
    generateBtn: language === 'en' ? 'Generate' : '生成',
  };

  const handleChat = async () => {
    if (!chatInput || !context) return;
    const newHistory = [...chatHistory, { role: 'user' as const, text: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsChatting(true);

    try {
      const systemInstruction = `You are a helpful AI assistant answering questions based on the provided context. Output language: ${language === 'en' ? 'English' : 'Traditional Chinese'}.`;
      const prompt = `Context:\n${context}\n\nUser Question: ${chatInput}`;
      const res = await generateContent(model, prompt, systemInstruction, false);
      setChatHistory([...newHistory, { role: 'ai', text: res }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatting(false);
    }
  };

  const handleGenerateChecklist = async () => {
    if (!context) return;
    setIsGeneratingChecklist(true);
    try {
      const systemInstruction = `Extract actionable submission checklist items from the context. Output ONLY a JSON array of strings. Language: ${language === 'en' ? 'English' : 'Traditional Chinese'}.`;
      const prompt = `Context:\n${context}\n\nExtract checklist items.`;
      const res = await generateContent(model, prompt, systemInstruction, false);
      
      // Try to parse JSON array
      const jsonMatch = res.match(/\\[.*\\]/s);
      if (jsonMatch) {
        const items = JSON.parse(jsonMatch[0]);
        setChecklist(items.map((item: string) => ({ item, done: false })));
      } else {
        // Fallback: split by newlines
        const items = res.split('\\n').filter(line => line.trim().length > 0).map(line => line.replace(/^[-*\\d.]\\s*/, ''));
        setChecklist(items.map((item: string) => ({ item, done: false })));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingChecklist(false);
    }
  };

  const handleGenerateGap = async () => {
    if (!context) return;
    setIsGeneratingGap(true);
    try {
      const systemInstruction = `Perform a compliance gap analysis based on the context. Identify missing information, potential risks, and areas needing clarification. Output in Markdown format. Language: ${language === 'en' ? 'English' : 'Traditional Chinese'}.`;
      const prompt = `Context:\n${context}\n\nPerform Gap Analysis.`;
      const res = await generateContent(model, prompt, systemInstruction, false);
      setGapAnalysis(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingGap(false);
    }
  };

  const toggleChecklistItem = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index].done = !newChecklist[index].done;
    setChecklist(newChecklist);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>{t.contextLabel}</Label>
            <Textarea 
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Paste the guidance or report here to enable WOW features..."
              className="min-h-[150px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chatbot */}
        <Card className="flex flex-col h-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {t.chatTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 pr-4 mb-4">
              <div className="space-y-4">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <div className="prose dark:prose-invert text-sm max-w-none">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex gap-2 mt-auto">
              <Input 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                placeholder="Ask a question..." 
                disabled={!context || isChatting}
              />
              <Button onClick={handleChat} disabled={!context || !chatInput || isChatting}>Send</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          {/* Checklist */}
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                {t.checklistTitle}
              </CardTitle>
              <Button size="sm" onClick={handleGenerateChecklist} disabled={!context || isGeneratingChecklist}>
                {isGeneratingChecklist ? <Loader2 className="w-4 h-4 animate-spin" /> : t.generateBtn}
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px]">
                {checklist.length > 0 ? (
                  <div className="space-y-2">
                    {checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <input 
                          type="checkbox" 
                          checked={item.done} 
                          onChange={() => toggleChecklistItem(i)}
                          className="mt-1"
                        />
                        <span className={`text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                          {item.item}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Click generate to extract checklist items.
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Gap Analysis */}
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                {t.gapTitle}
              </CardTitle>
              <Button size="sm" onClick={handleGenerateGap} disabled={!context || isGeneratingGap}>
                {isGeneratingGap ? <Loader2 className="w-4 h-4 animate-spin" /> : t.generateBtn}
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px]">
                {gapAnalysis ? (
                  <div className="prose dark:prose-invert text-sm max-w-none">
                    <Markdown>{gapAnalysis}</Markdown>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Click generate to perform gap analysis.
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
