import { useState } from 'react';
import { useAppContext } from '../../store';
import { generateContent } from '../../services/geminiService';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, Download, Search } from 'lucide-react';
import Markdown from 'react-markdown';

export default function GuidanceAnalysisTab() {
  const { language, model: globalModel } = useAppContext();
  const [input, setInput] = useState('');
  const [prompt, setPrompt] = useState('Analyze the provided medical device guidance. Search for related FDA information (510(k) summary, guidance, standards). Create a comprehensive report in markdown (2000-3000 words) synthesizing the input with external research findings.');
  const [localModel, setLocalModel] = useState(globalModel);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    title: language === 'en' ? 'Guidance Analysis & Research' : '指引分析與研究',
    desc: language === 'en' ? 'Paste or upload published guidance, and let the agent research FDA info to create a comprehensive report.' : '貼上或上傳發布的指引，讓代理搜尋 FDA 資訊以建立綜合報告。',
    inputLabel: language === 'en' ? 'Input Guidance (Text/Markdown)' : '輸入指引 (文字/Markdown)',
    promptLabel: language === 'en' ? 'Custom Prompt' : '自訂提示詞',
    generateBtn: language === 'en' ? 'Analyze & Generate Report' : '分析並生成報告',
    resultLabel: language === 'en' ? 'Generated Report (Editable)' : '生成的報告 (可編輯)',
    downloadBtn: language === 'en' ? 'Download Markdown' : '下載 Markdown',
  };

  const handleGenerate = async () => {
    if (!input) return;
    setIsLoading(true);
    try {
      const systemInstruction = `You are an expert Medical Device Regulatory Affairs Specialist. Your output language must be ${language === 'en' ? 'English' : 'Traditional Chinese (繁體中文)'}.`;
      const fullPrompt = `${prompt}\n\nInput Guidance:\n${input}`;
      
      const res = await generateContent(localModel, fullPrompt, systemInstruction, true);
      setResult(res);
    } catch (error) {
      console.error(error);
      alert('Error generating report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guidance_report.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.inputLabel}</Label>
            <Textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste guidance text here..."
              className="min-h-[200px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.promptLabel}</Label>
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Model Override</Label>
              <Select value={localModel} onValueChange={(v: any) => setLocalModel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-3.1-pro-preview">Gemini 3.1 Pro</SelectItem>
                  <SelectItem value="gemini-3.1-flash-preview">Gemini 3.1 Flash</SelectItem>
                  <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isLoading || !input} className="w-full">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            {t.generateBtn}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t.resultLabel}</CardTitle>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              {t.downloadBtn}
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit">
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-4">
                <Textarea 
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <div className="prose dark:prose-invert max-w-none p-4 border rounded-md bg-muted/50">
                  <Markdown>{result}</Markdown>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
