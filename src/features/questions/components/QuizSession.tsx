'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, RotateCcw, Award, Filter, ExternalLink } from 'lucide-react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Question, ChoiceKey } from '../types';
import { questionService } from '../services';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuizSessionProps {
  questions: Question[];
  year: number;
  subjectName: string;
}

export default function QuizSession({ questions, year, subjectName }: QuizSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ChoiceKey>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    questions: Record<string, { is_correct: boolean; correct_choice: string; explanation: string }>;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `quiz_session_${year}_${questions[0]?.subject || 'unknown'}`;

  // Restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const { answers: savedAnswers, currentIndex: savedIndex, isFinished: savedFinished } = JSON.parse(saved);
        setAnswers(savedAnswers || {});
        setCurrentIndex(savedIndex || 0);
        setIsFinished(savedFinished || false);
      } catch (e) {
        console.error('Failed to parse saved quiz session', e);
      }
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(storageKey, JSON.stringify({ answers, currentIndex, isFinished }));
    }
  }, [answers, currentIndex, isFinished, isLoaded, storageKey]);

  // Fetch results when finished (on mount or transition)
  useEffect(() => {
    if (isLoaded && isFinished && !results && !isValidating && !error) {
      fetchResults();
    }
  }, [isLoaded, isFinished, results, isValidating, error]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleChoiceSelect = (choice: ChoiceKey) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: choice }));
  };

  const nextQuestion = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
      await fetchResults();
    }
  };

  const fetchResults = async () => {
    setIsValidating(true);
    setError(null);
    try {
      const userAnswers = questions.map(q => ({
        id: q.id,
        choice: answers[q.id] || ''
      }));
      const data = await questionService.getSessionResults(userAnswers);
      
      // Convert array to record for easier lookup
      const questionsMap: Record<string, { is_correct: boolean; correct_choice: string; explanation: string }> = {};
      data.questions.forEach(q => {
        questionsMap[q.id] = {
          is_correct: q.is_correct,
          correct_choice: q.correct_choice,
          explanation: q.explanation
        };
      });

      setResults({
        score: data.score,
        questions: questionsMap
      });
    } catch (e: any) {
      console.error('Failed to fetch quiz results:', e);
      setError(e.message || '採点結果の取得に失敗しました。');
    } finally {
      setIsValidating(false);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetQuiz = () => {
    if (confirm('クイズをリセットして最初から解き直しますか？')) {
      setAnswers({});
      setCurrentIndex(0);
      setIsFinished(false);
      setResults(null);
      localStorage.removeItem(storageKey);
    }
  };

  // No longer needed: calculateScore is handled by the server
  // const calculateScore = () => { ... }

  if (!isLoaded) return null;

  if (totalQuestions === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
        <p className="text-xl font-bold opacity-50">この年度・科目の問題はまだ登録されていません。</p>
      </div>
    );
  }

  if (isFinished) {
    if (isValidating || !results) {
      return (
        <div className="flex flex-col items-center justify-center py-40 space-y-8 glass rounded-[3rem] border-2 border-primary/10">
          {error ? (
            <>
              <XCircle className="text-red-500 mb-2" size={64} />
              <div className="text-center space-y-4">
                <p className="text-xl font-bold text-red-500">{error}</p>
                <p className="text-sm opacity-60">Supabase RPC のデプロイを確認してください。</p>
              </div>
              <button 
                onClick={fetchResults}
                className="px-8 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <RotateCcw size={18} />
                再試行
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xl font-bold animate-pulse text-muted-foreground italic tracking-widest uppercase">Validating Answers...</p>
            </>
          )}
        </div>
      );
    }

    const score = results.score;
    const filteredQuestions = questions.filter(q => {
      const res = results.questions[q.id];
      if (filter === 'all') return true;
      const isCorrect = res?.is_correct ?? false;
      return filter === 'correct' ? isCorrect : !isCorrect;
    });

    return (
      <div className="space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="p-12 glass rounded-[3rem] text-center space-y-6 border-4 border-primary/20">
          <Award className="mx-auto text-primary" size={80} />
          <h2 className="text-4xl font-black italic">QUIZ RESULT</h2>
          <div className="space-y-2">
            <p className="text-6xl font-black text-primary">
              {score} <span className="text-2xl text-muted-foreground">/ {totalQuestions}</span>
            </p>
            <p className="text-xl font-bold text-muted-foreground">
              正解率: {Math.round((score / totalQuestions) * 100)}%
            </p>
          </div>
          <button 
            onClick={resetQuiz} 
            className="flex items-center gap-2 mx-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/25"
          >
            <RotateCcw size={20} />
            最初から解き直す
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sticky top-4 z-10 py-4 bg-background/80 backdrop-blur-md rounded-2xl border border-border/50">
            <h3 className="text-2xl font-black uppercase tracking-widest">Review</h3>
            <div className="flex items-center bg-muted p-1 rounded-xl">
              {(['all', 'correct', 'incorrect'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize",
                    filter === f ? "bg-white dark:bg-slate-800 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f === 'all' ? 'すべて' : f === 'correct' ? '正解' : '不正解'}
                </button>
              ))}
            </div>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed opacity-50 font-bold">
              該当する問題はありません
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const userAnswer = answers[q.id];
              const res = results.questions[q.id];
              const isCorrect = res?.is_correct ?? false;
              const correctChoice = res?.correct_choice;
              const explanation = res?.explanation;

              return (
                <div key={q.id} className={cn(
                  "p-8 rounded-[2.5rem] border-2 transition-all group",
                  isCorrect ? "border-green-500/30 bg-green-500/5 shadow-sm" : "border-red-500/30 bg-red-500/5 shadow-sm"
                )}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <span className="font-black text-xl">第{q.question_number}問</span>
                      {isCorrect ? (
                        <div className="flex items-center gap-2 text-green-600 font-bold bg-green-500/10 px-4 py-1.5 rounded-full text-sm">
                          <CheckCircle2 size={18} /> 正解
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600 font-bold bg-red-500/10 px-4 py-1.5 rounded-full text-sm">
                          <XCircle size={18} /> 不正解
                        </div>
                      )}
                    </div>
                    <Link 
                      href={`/questions/${q.id}?from=quiz&year=${year}&subject=${q.subject}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-background border-2 border-border hover:border-primary/40 hover:text-primary rounded-full text-sm font-bold transition-all shadow-sm"
                    >
                      <ExternalLink size={16} />
                      解説・コメントを見る
                    </Link>
                  </div>
                  <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                    <ReactMarkdown>{q.content}</ReactMarkdown>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(['A', 'B', 'C', 'D'] as ChoiceKey[]).map(key => {
                      const choiceText = (q as any)[`choice_${key.toLowerCase()}`];
                      return (
                        <div key={key} className={cn(
                          "p-4 rounded-2xl border-2 flex items-center gap-4 text-sm font-bold transition-all",
                          key === correctChoice ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300" :
                          key === userAnswer ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300" :
                          "border-border/40 bg-muted/20 opacity-60"
                        )}>
                          <span className={cn(
                            "w-8 h-8 rounded-lg border-2 flex items-center justify-center font-black transition-all",
                            key === correctChoice ? "bg-green-500 border-green-500 text-white" :
                            key === userAnswer ? "bg-red-500 border-red-500 text-white" : ""
                          )}>
                            {key}
                          </span>
                          <span>{choiceText}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-8 p-8 bg-muted/30 rounded-[2rem] border border-border/40">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      <p className="text-xs font-black uppercase tracking-widest text-primary/70">Explanation</p>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                      <ReactMarkdown>{explanation || ''}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  const choices: { key: ChoiceKey; text: string }[] = [
    { key: 'A', text: currentQuestion.choice_a },
    { key: 'B', text: currentQuestion.choice_b },
    { key: 'C', text: currentQuestion.choice_c },
    { key: 'D', text: currentQuestion.choice_d },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Quiz Header */}
      <div className="flex items-center justify-between px-4">
        <div className="space-y-1">
          <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">令和{year-2018}年 {subjectName}</p>
          <div className="flex items-end gap-2">
            <h2 className="text-4xl font-black italic">QUESTION {currentQuestion.question_number}</h2>
            <span className="text-muted-foreground font-bold pb-1.5">/ {totalQuestions}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="p-3 bg-muted hover:bg-muted/80 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextQuestion}
            disabled={!answers[currentQuestion.id]}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {currentIndex === totalQuestions - 1 ? '採点する' : '次の問題へ'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-muted rounded-full overflow-hidden mx-4">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-8 md:p-12 glass rounded-[3rem] space-y-8 shadow-2xl border-2 border-primary/5">
        <div className="prose prose-slate dark:prose-invert max-w-none text-xl leading-relaxed font-medium">
          <ReactMarkdown>{currentQuestion.content}</ReactMarkdown>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {choices.map((choice) => {
            const isSelected = answers[currentQuestion.id] === choice.key;
            return (
              <button
                key={choice.key}
                onClick={() => handleChoiceSelect(choice.key)}
                className={cn(
                  "group flex items-center gap-6 w-full p-6 text-left rounded-[2rem] border-2 transition-all duration-300",
                  isSelected 
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" 
                    : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/20"
                )}
              >
                <span className={cn(
                  "flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl border-2 font-black text-xl transition-all duration-300",
                  isSelected 
                    ? "bg-primary border-primary text-primary-foreground scale-110" 
                    : "bg-white dark:bg-slate-900 border-border group-hover:border-primary/50 group-hover:text-primary"
                )}>
                  {choice.key}
                </span>
                <div className="flex-grow prose prose-sm dark:prose-invert pointer-events-none text-base font-semibold">
                  <ReactMarkdown>{choice.text}</ReactMarkdown>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
