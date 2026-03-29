import { questionService } from '@/features/questions/services';
import QuizSession from '@/features/questions/components/QuizSession';
import { notFound } from 'next/navigation';
import { Trophy } from 'lucide-react';

interface QuizPageProps {
  params: Promise<{ year: string; subject: string }>;
}

const SUBJECT_MAP: Record<number, string> = {
  1: '計画',
  2: '環境・設備',
  3: '法規',
  4: '構造',
  5: '施工',
};

export default async function QuizPage({ params }: QuizPageProps) {
  const { year, subject } = await params;
  const yearNum = parseInt(year);
  const subjectNum = parseInt(subject);

  if (isNaN(yearNum) || isNaN(subjectNum)) {
    notFound();
  }

  const questions = await questionService.getByYearAndSubject(yearNum, subjectNum);
  const subjectName = SUBJECT_MAP[subjectNum] || '不明な科目';

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 mt-8">
      {/* Header Decorative */}
      <div className="flex items-center justify-center gap-4 text-primary font-black uppercase tracking-[0.4em] opacity-40">
        <Trophy size={20} />
        <span>Architect Master Exam Study</span>
        <Trophy size={20} />
      </div>

      <QuizSession 
        questions={questions} 
        year={yearNum} 
        subjectName={subjectName} 
      />
    </div>
  );
}
