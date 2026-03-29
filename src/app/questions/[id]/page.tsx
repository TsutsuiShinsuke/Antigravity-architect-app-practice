import { questionService } from '@/features/questions/services';
import QuestionDisplay from '@/features/questions/components/QuestionDisplay';
import CommentSection from '@/features/comments/components/CommentSection';
import { notFound } from 'next/navigation';
import { BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface QuestionDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; year?: string; subject?: string }>;
}

export default async function QuestionDetailPage({ params, searchParams }: QuestionDetailPageProps) {
  const { id } = await params;
  const { from, year, subject } = await searchParams;
  const question = await questionService.getById(id);

  if (!question) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-primary font-black uppercase tracking-tighter">
          <BookOpen size={24} />
          <span className="text-lg">Question Details</span>
        </div>

        {from === 'quiz' && year && subject && (
          <Link 
            href={`/quiz/${year}/${subject}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-primary text-primary rounded-full font-bold hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95"
          >
            <ArrowLeft size={18} />
            採点結果に戻る
          </Link>
        )}
      </div>

      {/* Question Section */}
      <section className="p-1 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 shadow-xl">
        <QuestionDisplay question={question} />
      </section>

      <hr className="border-t-2 border-dashed border-border/50" />

      {/* Comment Section */}
      <div className="px-4">
        <CommentSection questionId={id} />
      </div>
    </div>
  );
}

