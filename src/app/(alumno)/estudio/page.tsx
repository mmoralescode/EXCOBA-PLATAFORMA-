import { getPublishedCurriculum } from "@/server/use-cases/academic-content";
import { CurriculumBrowser } from "@/components/curriculum-browser";

export default async function EstudioPage() {
  const subjects = await getPublishedCurriculum();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-pizarron">Tu ruta de estudio EXCOBA</h1>
      <CurriculumBrowser />
      <h2 className="mt-12 font-display text-2xl text-pizarron">Lecciones publicadas</h2>
      <div className="mt-8 space-y-8">
        {subjects
          .filter((s) => s.topics.some((t) => t.lessons.length > 0))
          .map((subject) => (
            <section key={subject.id}>
              <h2 className="font-display text-xl text-pizarron">{subject.name}</h2>
              <ul className="mt-2 space-y-3">
                {subject.topics
                  .filter((t) => t.lessons.length > 0)
                  .map((topic) => (
                    <li key={topic.id}>
                      <p className="font-medium text-ink">{topic.name}</p>
                      <ul className="ml-4 mt-1 list-disc text-sm text-ink/80">
                        {topic.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <details>
                              <summary className="cursor-pointer">{lesson.title}</summary>
                              <p className="mt-3 whitespace-pre-wrap leading-relaxed">
                                {lesson.content}
                              </p>
                            </details>
                          </li>
                        ))}
                        {topic.lessons.length === 0 && (
                          <li className="list-none text-ink/50">
                            Sin lecciones publicadas todavía.
                          </li>
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
