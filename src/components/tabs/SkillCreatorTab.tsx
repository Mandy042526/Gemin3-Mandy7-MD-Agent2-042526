import { useState } from 'react';
import { useAppContext } from '../../store';
import { generateContent } from '../../services/geminiService';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, Download, Cpu } from 'lucide-react';
import Markdown from 'react-markdown';

export default function SkillCreatorTab() {
  const { language, model: globalModel } = useAppContext();
  const [inputGuidance, setInputGuidance] = useState('');
  const [prompt, setPrompt] = useState('Create a markdown content for a skill.md file that defines a new agent skill. This skill should be designed to generate comprehensive medical device guidance based on the structure and information found in the provided medical device guidance input. Use the standard skill-creator format for the description. Please do ultrathink to get excellent results and add 3 additional wow features in this skill.');
  const [localModel, setLocalModel] = useState(globalModel);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    title: language === 'en' ? 'Skill Creator' : '技能建立器',
    desc: language === 'en' ? 'Generate a skill.md file to define a new agent skill based on medical device guidance.' : '根據醫療器材指引生成 skill.md 檔案以定義新的代理技能。',
    inputLabel: language === 'en' ? 'Input Guidance Structure' : '輸入指引結構',
    promptLabel: language === 'en' ? 'Custom Prompt' : '自訂提示詞',
    generateBtn: language === 'en' ? 'Generate Skill.md' : '生成 Skill.md',
    resultLabel: language === 'en' ? 'Generated Skill (Editable)' : '生成的技能 (可編輯)',
    downloadBtn: language === 'en' ? 'Download skill.md' : '下載 skill.md',
  };

  const handleGenerate = async () => {
    if (!inputGuidance) return;
    setIsLoading(true);
    try {
      const systemInstruction = `You are an expert AI Agent Skill Creator. Your output language must be ${language === 'en' ? 'English' : 'Traditional Chinese (繁體中文)'}. You must output a valid markdown file with YAML frontmatter containing 'name' and 'description'. Add 3 additional WOW features to the skill.`;
      const fullPrompt = `${prompt}\n\nInput Guidance Structure:\n${inputGuidance}`;
      
      const res = await generateContent(localModel, fullPrompt, systemInstruction, false);
      setResult(res);
    } catch (error) {
      console.error(error);
      alert('Error generating skill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skill.md';
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
              value={inputGuidance}
              onChange={(e) => setInputGuidance(e.target.value)}
              placeholder="Paste the guidance structure or previous report here..."
              className="min-h-[200px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.promptLabel}</Label>
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px]"
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

          <Button onClick={handleGenerate} disabled={isLoading || !inputGuidance} className="w-full">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Cpu className="w-4 h-4 mr-2" />}
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
