import { createContext, useContext, useState } from "react";

export type ColorValue = string;

type ColorProviderValue = {
  background: ColorValue;
  text: ColorValue;
  primary: ColorValue;
  setTheme: (background: ColorValue, text: ColorValue, primary: ColorValue) => void;
};

export const ColorProviderContext = createContext<ColorProviderValue | null>(null);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [background, setBackground] = useState<ColorValue>("#000000"); // Colors.black
  const [text, setText] = useState<ColorValue>("#FFFFFF"); // Colors.white
  const [primary, setPrimary] = useState<ColorValue>("#C15D42"); // 0xFFC15D42

  const setTheme = (bg: ColorValue, tx: ColorValue, pr: ColorValue) => {
    setBackground(bg);
    setText(tx);
    setPrimary(pr);
  };

  return (
    <ColorProviderContext.Provider
      value={{
        background,
        text,
        primary,
        setTheme,
      }}
    >
      {children}
    </ColorProviderContext.Provider>
  );
}

export function useColorProvider() {
  const ctx = useContext(ColorProviderContext);
  if (!ctx) throw new Error("useColorProvider must be used inside <ColorProvider>");
  return ctx;
}
