import { useEffect } from 'react';
import { AppProvider, useAppContext } from './store';
import { PAINTER_STYLES } from './lib/painter-styles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { ScrollArea } from './components/ui/scroll-area';
import { Button } from './components/ui/button';
import { Palette, Globe, Moon, Sun, Cpu, FileText, FileCode, Sparkles } from 'lucide-react';

// Import Tab Components (to be created)
import GuidanceAnalysisTab from './components/tabs/GuidanceAnalysisTab';
import TemplateReportTab from './components/tabs/TemplateReportTab';
import SkillCreatorTab from './components/tabs/SkillCreatorTab';
import WowFeaturesTab from './components/tabs/WowFeaturesTab';

function AppContent() {
  const { theme, setTheme, language, setLanguage, painterStyle, setPainterStyle, model, setModel } = useAppContext();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Remove all painter styles
    PAINTER_STYLES.forEach((style) => {
      if (style.class) root.classList.remove(style.class);
    });

    // Add selected painter style
    const selectedStyle = PAINTER_STYLES.find((s) => s.id === painterStyle);
    if (selectedStyle && selectedStyle.class) {
      root.classList.add(selectedStyle.class);
    }
  }, [theme, painterStyle]);

  const t = {
    settings: language === 'en' ? 'Settings' : '設定',
    theme: language === 'en' ? 'Theme' : '主題',
    language: language === 'en' ? 'Language' : '語言',
    painterStyle: language === 'en' ? 'Painter Style' : '畫家風格',
    model: language === 'en' ? 'Model' : '模型',
    tabs: {
      guidance: language === 'en' ? 'Guidance Analysis' : '指引分析',
      template: language === 'en' ? 'Template Report' : '範本報告',
      skill: language === 'en' ? 'Skill Creator' : '技能建立器',
      wow: language === 'en' ? 'WOW Features' : 'WOW 功能',
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 flex flex-col gap-6 overflow-y-auto">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="w-6 h-6 text-primary" />
          <span>Agentic Reviewer</span>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{t.settings}</h3>
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {t.theme}
            </Label>
            <Switch 
              checked={theme === 'dark'} 
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
            />
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t.language}
            </Label>
            <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh-TW">繁體中文</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Painter Style */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              {t.painterStyle}
            </Label>
            <Select value={painterStyle} onValueChange={setPainterStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAINTER_STYLES.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              {t.model}
            </Label>
            <Select value={model} onValueChange={(v: any) => setModel(v)}>
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Tabs defaultValue="guidance" className="flex-1 flex flex-col w-full">
          <div className="border-b px-4 py-2 bg-card/50 backdrop-blur-sm">
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
              <TabsTrigger value="guidance" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">{t.tabs.guidance}</span>
              </TabsTrigger>
              <TabsTrigger value="template" className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                <span className="hidden sm:inline">{t.tabs.template}</span>
              </TabsTrigger>
              <TabsTrigger value="skill" className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span className="hidden sm:inline">{t.tabs.skill}</span>
              </TabsTrigger>
              <TabsTrigger value="wow" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">{t.tabs.wow}</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-5xl mx-auto">
              <TabsContent value="guidance" className="mt-0">
                <GuidanceAnalysisTab />
              </TabsContent>
              <TabsContent value="template" className="mt-0">
                <TemplateReportTab />
              </TabsContent>
              <TabsContent value="skill" className="mt-0">
                <SkillCreatorTab />
              </TabsContent>
              <TabsContent value="wow" className="mt-0">
                <WowFeaturesTab />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
