export type Language = "shona" | "ndebele";
export type Level = "beginner" | "intermediate" | "advanced";

export type PassageSummary = {
  id: string;
  language: Language;
  level: Level;
  title: string;
  summary: string;
  minutes: number;
};

export type Passage = PassageSummary & {
  paragraphs: string[];
  vocabulary: { word: string; meaning: string }[];
  question: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
};
