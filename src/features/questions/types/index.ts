export type ChoiceKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  year?: number;
  subject?: number;
  question_number?: number;
  title: string;
  content: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice?: ChoiceKey;
  explanation?: string;
  created_at: string;
}
