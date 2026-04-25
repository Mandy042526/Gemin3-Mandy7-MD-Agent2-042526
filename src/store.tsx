import { createContext, useContext, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'zh-TW';
export type Model = 'gemini-2.5-flash' | 'gemini-3.1-flash-preview' | 'gemini-3.1-pro-preview';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  painterStyle: string;
  setPainterStyle: (style: string) => void;
  model: Model;
  setModel: (model: Model) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('zh-TW');
  const [painterStyle, setPainterStyle] = useState<string>('default');
  const [model, setModel] = useState<Model>('gemini-3.1-pro-preview');

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        painterStyle,
        setPainterStyle,
        model,
        setModel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
