import { QuestionBank } from "@/components/question-bank";

export default function BancoPage({ searchParams }: { searchParams: { tema?: string } }) {
  return <QuestionBank key={searchParams.tema ?? "all"} initialTopic={searchParams.tema} />;
}
