'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Question, ChoiceKey } from '../types';
import { questionService } from '../services';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuestionDisplayProps {
  question: Question;
}

const SUBJECT_MAP: Record<number, string> = {
  1: '計画',
  2: '環境・設備',
  3: '法規',
  4: '構造',
  5: '施工',
};

export default function QuestionDisplay({ question }: QuestionDisplayProps) {
  const [selectedChoice, setSelectedChoice] = useState<ChoiceKey | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    is_correct: boolean;
    correct_choice: string;
    explanation: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const subjectName = question.subject ? SUBJECT_MAP[question.subject] : '不明な科目';
  const displayTitle = question.year && question.question_number 
    ? `令和${question.year - 2018}年 ${subjectName} 第${question.question_number}問`
    : question.title;

  const choices: { key: ChoiceKey; text: string }[] = [
    { key: 'A', text: question.choice_a },
    { key: 'B', text: question.choice_b },
    { key: 'C', text: question.choice_c },
    { key: 'D', text: question.choice_d },
  ];

  const handleChoiceSelect = async (key: ChoiceKey) => {
    if (selectedChoice || isValidating) return;
    
    setSelectedChoice(key);
    setIsValidating(true);
    
    try {
      const result = await questionService.validateAnswer(question.id, key);
      setValidationResult(result);
      setShowExplanation(true);
    } catch (error) {
      console.error('Failed to validate answer:', error);
      // Fallback for error state - maybe allow retry or show error
      setSelectedChoice(null); 
    } finally {
      setIsValidating(false);
    }
  };

  const isCorrect = validationResult?.is_correct ?? false;
  const correctChoice = validationResult?.correct_choice;
  const explanation = validationResult?.explanation;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 p-8 glass rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Title & Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
            {question.year ? `西暦 ${question.year}年` : 'Certification Exam'}
          </span>
          <h2 className="text-xl font-bold text-foreground/90">{displayTitle}</h2>
        </div>
        <div className="prose prose-slate dark:prose-invert max-w-none text-lg leading-relaxed">
          <ReactMarkdown>{question.content}</ReactMarkdown>
        </div>
      </div>

      {/* Choices */}
      <div className="grid grid-cols-1 gap-4">
        {choices.map((choice) => {
          const isSelected = selectedChoice === choice.key;
          const isChoiceCorrect = choice.key === correctChoice;
          const isWrongSelection = isSelected && validationResult && !isChoiceCorrect;

          return (
            <button
              key={choice.key}
              onClick={() => handleChoiceSelect(choice.key)}
              disabled={!!selectedChoice}
              className={cn(
                "group relative w-full p-6 text-left rounded-2xl border-2 transition-all duration-300",
                "hover:border-primary/50 hover:bg-primary/5",
                !selectedChoice && "active:scale-[0.99] hover:shadow-md",
                selectedChoice && "cursor-default",
                // Correct choice styling after selection
                validationResult && isChoiceCorrect && "border-green-500 bg-green-500/10 shadow-sm shadow-green-500/20",
                // User's wrong choice styling
                isWrongSelection && "border-red-500 bg-red-500/10 shadow-sm shadow-red-500/20",
                // Unselected choices after selection
                validationResult && !isChoiceCorrect && !isSelected && "opacity-50 border-transparent bg-muted/30"
              )}
            >
              <div className="flex items-center gap-5">
                <span className={cn(
                  "flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border-2 font-bold text-xl transition-all duration-300",
                  !selectedChoice && "bg-muted/50 border-border group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
                  validationResult && isChoiceCorrect && "border-green-500 bg-green-500 text-white",
                  isWrongSelection && "border-red-500 bg-red-500 text-white",
                  validationResult && !isChoiceCorrect && !isSelected && "border-muted text-muted-foreground bg-muted/20"
                )}>
                  {choice.key}
                </span>
                <div className="flex-grow prose prose-sm dark:prose-invert pointer-events-none text-base font-medium">
                  <ReactMarkdown>{choice.text}</ReactMarkdown>
                </div>
                {isValidating && isSelected && (
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                {validationResult && isChoiceCorrect && <CheckCircle2 className="text-green-500 animate-in zoom-in duration-300" size={28} />}
                {validationResult && isWrongSelection && <XCircle className="text-red-500 animate-in zoom-in duration-300" size={28} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Result & Explanation */}
      {validationResult && (
        <div className={cn(
          "overflow-hidden rounded-3xl border-2 animate-in slide-in-from-top-4 duration-500",
          isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
        )}>
          <div className={cn(
            "p-6 flex items-center justify-between",
            isCorrect ? "bg-green-500/10" : "bg-red-500/10"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-full",
                isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
              )}>
                {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
              <div>
                <p className="text-sm font-bold opacity-70 uppercase tracking-widest">
                  {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
                </p>
                <p className="text-xl font-black">
                   正解は <span className="text-2xl underline decoration-wavy underline-offset-4">{correctChoice}</span> です
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="px-4 py-2 bg-background/50 hover:bg-background rounded-full text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              解説を{showExplanation ? '隠す' : '表示'}
              {showExplanation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {showExplanation && explanation && (
            <div className="p-8 prose dark:prose-invert max-w-none bg-muted/20 border-t border-border/50 animate-in fade-in duration-500">
              <ReactMarkdown>{explanation}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
