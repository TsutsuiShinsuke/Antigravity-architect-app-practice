import Link from 'next/link';
import { ArrowRight, MessageSquare, Star, Info } from 'lucide-react';
import QuestionDisplay from '@/features/questions/components/QuestionDisplay';
import { questionService } from '@/features/questions/services';

export default async function HomePage() {
  const questions = await questionService.getAll();
  const demoQuestion = questions[0]; // Use the first question as demo if available

  return (
    <div className="space-y-12 pb-20">
      <section className="text-center py-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold animate-fade-in">
          <Star size={16} className="fill-current" />
          <span>PoC v0.2: Supabase 統合完了</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent pb-2">
          合格への最短距離を、<br />みんなで創る。
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
          問題一つひとつに対して、磨かれた解法と解説を。学習者同士のインサイトがあなたの実力を引き上げます。
        </p>
      </section>

      {/* Quiz Selection Section */}
      <section className="space-y-8 py-12">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="text-4xl font-black italic tracking-tight">START STUDYING</h2>
          <div className="h-1.5 w-24 bg-primary rounded-full" />
          <p className="text-muted-foreground font-bold">年度と科目を選択して、過去問に挑戦しましょう。</p>
        </div>

        <div className="grid gap-12">
          {[2025, 2024].map((year) => (
            <div key={year} className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-primary/50">令和{year - 2018}年</span>
                <span className="text-sm font-bold bg-muted px-3 py-1 rounded-full">{year}年度</span>
                <div className="flex-grow h-px bg-border/50" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { id: 1, name: '計画' },
                  { id: 2, name: '環境・設備' },
                  { id: 3, name: '法規' },
                  { id: 4, name: '構造' },
                  { id: 5, name: '施工' },
                ].map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/quiz/${year}/${subject.id}`}
                    className="group relative overflow-hidden p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border-2 border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-300 text-center flex flex-col items-center gap-3"
                  >
                    <span className="text-xs font-black text-muted-foreground/50 group-hover:text-primary/50 transition-colors">
                      科目 {subject.id}
                    </span>
                    <span className="text-lg font-black group-hover:scale-110 transition-transform">
                      {subject.name}
                    </span>
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Demo Section */}
      {demoQuestion && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <Info size={24} />
            <h2 className="text-2xl font-black italic uppercase tracking-wider">Featured Question</h2>
          </div>
          <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20">
            <QuestionDisplay question={demoQuestion} />
          </div>
        </section>
      )}

      <section className="grid gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="text-accent" />
            最新の問題
          </h2>
          <button className="text-sm font-bold text-primary hover:underline flex items-center gap-1 transition-all hover:gap-2">
            すべて見る <ArrowRight size={18} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {questions.map((q) => (
            <Link 
              key={q.id} 
              href={`/questions/${q.id}`}
              className="group block p-8 bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-border hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
            >
              <div className="space-y-6">
                <h3 className="font-black text-2xl group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {q.title}
                </h3>
                <p className="text-muted-foreground font-medium line-clamp-3 text-lg leading-relaxed">
                  {q.content}
                </p>
                <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground/80">
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
                    <MessageSquare size={16} className="text-accent" />
                    <span>0 コメント</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span>0 高評価</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

