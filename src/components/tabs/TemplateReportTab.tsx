import { useState } from 'react';
import { useAppContext } from '../../store';
import { generateContent } from '../../services/geminiService';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, Download, FileCode } from 'lucide-react';
import Markdown from 'react-markdown';

const DEFAULT_TEMPLATE = `骨外固定器查驗登記審查指引與審查清單
本文件旨在規範骨外固定器（Orthopedic External Fixators）於醫療器材查驗登記時之臨床前安全與有效性要求，確保產品符合應有之品質標準。
第一部分：骨外固定器臨床前審查指引 (Review Guidance)
1. 產品規格要求 (Product Specifications)
申請者應提供詳盡之產品資料，以評估其設計之合理性與安全性：
用途說明：詳列臨床適應症、適用對象及預定用途。
組件清單：應包含所有系統組件（如：骨針、連接桿、接合器、夾具等）。
工程圖面：檢附具備關鍵幾何尺寸、公差之主要組件工程圖。
材質證明：所有與人體接觸或具結構功能之材質，應標明符合之國際材質標準（如 ASTM F136, ISO 5832 等）。
等同性比較：與已上市類似品執行規格、設計及材質之列表比較，並針對差異處進評估。
2. 生物相容性評估 (Biocompatibility)
依據產品與人體接觸之性質與時間，進行風險評估：
豁免機制：若採用常用之醫用金屬（如 Ti6Al4V, 316L 不鏽鋼等）且製程未改變，得檢具材質證明申請豁免試驗。
執行標準：依據 ISO 10993 系列標準。重點評估項目包括細胞毒性、敏感試驗、刺激試驗、系統毒性、基因毒性及植入試驗。
3. 滅菌確效 (Sterilization)
無菌標準：無菌包裝產品之無菌保證水準 (Sterility Assurance Level, SAL) 必須符合 10⁻⁶。
滅菌驗證：須依據對應之 ISO 標準（如 17665-1, 11135 或 11137）提供滅菌計畫書與報告。對於非無菌提供之產品，應提供建議之醫事機構滅菌方法。
4. 機械性質評估 (Mechanical Testing)
機械測試應能模擬臨床最壞情況（Worst-case scenario）：
執行標準：建議參考 ASTM F1541。
評估項目：
剛性與屈折測量：評估固定器之結構穩定度。
靜態破壞測試：評估裝置在承受過負荷時之極限強度。
疲勞與鬆脫測試：模擬長期使用下之循環負荷，及接合處是否容易產生鬆動。
5. 特定風險與額外評估 (Special Risks and Additional Evaluations)
針對具備特殊宣稱或設計之產品，應額外提供資料：
脊椎或動態機能：若具備微動或動態機能，應提供相關動態功能測試報告。
MRI 相容性：若宣稱 MRI 安全（MRI Safe）或 MRI 條件（MRI Conditional），須依國際標準提交相關磁共振環境評估報告。
第二部分：骨外固定器查驗登記審查清單 (Review Checklist)
審查項目 審查重點 / 具備文件 審查結果 (符合/不適用/待補) 備註說明
1. 產品規格
1.1 用途說明 是否包含完整臨床適應症與適應對象？ □
1.2 組件目錄 是否列出所有系統組件（錨定、橋接、接合器）？ □
1.3 工程圖 主要組件是否具備詳細尺寸與標註？ □
1.4 設計與組合 是否描述各組件之連接、鎖固機制？ □
1.5 材質證明 是否提供材質證明並符合 ASTM/ISO 國際標準？ □
1.6 等同性比較 是否與 Predicate Device 進行列表比較並評估差異？ □
2. 生物相容性
2.1 測試報告 是否依 ISO 10993 提供細胞毒性、過敏等基本報告？ □
2.2 豁免說明 若申請豁免，是否提供符合常規金屬之佐證資料？ □
3. 滅菌確效
3.1 滅菌標準 無菌保證水準 (SAL) 是否符合 ≤ 10⁻⁶？ □
3.2 驗證報告 是否提供符合 ISO 17665/11135/11137 之驗證資料？ □
4. 機械性質
4.1 剛性測試 是否提供符合 ASTM F1541 之剛性測量報告？ □
4.2 靜態破壞 是否執行裝置整體之靜態破壞試驗？ □
4.3 疲勞測試 是否針對組件間之疲勞與鬆脫進行評估？ □
5. 特定風險
5.1 動態機能 脊椎用或具動態功能者，是否提供風險評估或測試？ □
5.2 結構硬度 若硬度低於市場類似品，是否有安全性合理說明？ □
5.3 MRI 相容性 宣稱 MRI 相容者，是否提交環境相容性評估報告？ □
審查結論：
□ 建議核准
□ 需補件再議（補件項目：____________________）
□ 不予核准
審查人員簽章： ____________________ 日期： 2026-03-13`;

export default function TemplateReportTab() {
  const { language, model: globalModel } = useAppContext();
  const [previousReport, setPreviousReport] = useState('');
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [prompt, setPrompt] = useState('Create a comprehensive report based on the previous comprehensive report using the provided report template. Ensure all sections of the template are filled out accurately based on the provided report.');
  const [localModel, setLocalModel] = useState(globalModel);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    title: language === 'en' ? 'Template-based Report' : '範本報告',
    desc: language === 'en' ? 'Generate a structured report using a specific template and previous research.' : '使用特定範本和先前的研究生成結構化報告。',
    prevReportLabel: language === 'en' ? 'Previous Comprehensive Report' : '先前的綜合報告',
    templateLabel: language === 'en' ? 'Report Template' : '報告範本',
    promptLabel: language === 'en' ? 'Custom Prompt' : '自訂提示詞',
    generateBtn: language === 'en' ? 'Generate Template Report' : '生成範本報告',
    resultLabel: language === 'en' ? 'Generated Report (Editable)' : '生成的報告 (可編輯)',
    downloadBtn: language === 'en' ? 'Download Markdown' : '下載 Markdown',
    useDefault: language === 'en' ? 'Use Default Template' : '使用預設範本',
  };

  const handleGenerate = async () => {
    if (!previousReport || !template) return;
    setIsLoading(true);
    try {
      const systemInstruction = `You are an expert Medical Device Regulatory Affairs Specialist. Your output language must be ${language === 'en' ? 'English' : 'Traditional Chinese (繁體中文)'}.`;
      const fullPrompt = `${prompt}\n\nReport Template:\n${template}\n\nPrevious Comprehensive Report:\n${previousReport}`;
      
      const res = await generateContent(localModel, fullPrompt, systemInstruction, false);
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
    a.download = 'template_report.md';
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.prevReportLabel}</Label>
              <Textarea 
                value={previousReport}
                onChange={(e) => setPreviousReport(e.target.value)}
                placeholder="Paste the comprehensive report generated in the previous step..."
                className="min-h-[300px]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t.templateLabel}</Label>
                <Button variant="ghost" size="sm" onClick={() => setTemplate(DEFAULT_TEMPLATE)}>
                  {t.useDefault}
                </Button>
              </div>
              <Textarea 
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="min-h-[300px] font-mono text-xs"
              />
            </div>
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

          <Button onClick={handleGenerate} disabled={isLoading || !previousReport || !template} className="w-full">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileCode className="w-4 h-4 mr-2" />}
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
