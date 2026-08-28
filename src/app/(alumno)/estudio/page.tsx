import { getPublishedCurriculum } from "@/server/use-cases/academic-content";
import { requireUser } from "@/lib/authorization";

export default async function EstudioPage() {
  await requireUser();
  const subjects = await getPublishedCurriculum();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-pizarron">Estudio por materia</h1>
      <div className="mt-8 space-y-8">
        {subjects.map((subject) => (
          <section key={subject.id}>
            <h2 className="font-display text-xl text-pizarron">{subject.name}</h2>
            <ul className="mt-2 space-y-3">
              {subject.topics.map((topic) => (
                <li key={topic.id}>
                  <p className="font-medium text-ink">{topic.name}</p>
                  <ul className="ml-4 mt-1 list-disc text-sm text-ink/80">
                    {topic.lessons.map((lesson) => (
                      <li key={lesson.id}>{lesson.title}</li>
                    ))}
                    {topic.lessons.length === 0 && (
                      <li className="list-none text-ink/50">Sin lecciones publicadas todavía.</li>
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
