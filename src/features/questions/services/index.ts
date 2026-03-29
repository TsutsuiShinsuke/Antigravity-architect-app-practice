import { supabase } from '@/lib/supabase';
import { Question } from '../types';

export const questionService = {
  async getAll(): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('id, title, content, choice_a, choice_b, choice_c, choice_d, year, subject, question_number, created_at')
      .order('year', { ascending: false })
      .order('subject', { ascending: true })
      .order('question_number', { ascending: true });

    if (error) throw error;
    return data as Question[];
  },

  async getById(id: string): Promise<Question | null> {
    const { data, error } = await supabase
      .from('questions')
      .select('id, title, content, choice_a, choice_b, choice_c, choice_d, year, subject, question_number, created_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Question;
  },

  async getByYearAndSubject(year: number, subject: number): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('id, title, content, choice_a, choice_b, choice_c, choice_d, year, subject, question_number, created_at')
      .eq('year', year)
      .eq('subject', subject)
      .order('question_number', { ascending: true });

    if (error) throw error;
    return data as Question[];
  },
  
  async validateAnswer(questionId: string, selectedChoice: string): Promise<{ is_correct: boolean; correct_choice: string; explanation: string }> {
    const { data, error } = await supabase.rpc('validate_answer', {
      p_question_id: questionId,
      p_selected_choice: selectedChoice
    });

    if (error) throw error;
    return data;
  },

  async getSessionResults(userAnswers: { id: string; choice: string }[]): Promise<{ score: number; questions: { id: string; is_correct: boolean; correct_choice: string; explanation: string }[] }> {
    const { data, error } = await supabase.rpc('get_session_results', {
      p_user_answers: userAnswers
    });

    if (error) throw error;
    return data;
  }
};
