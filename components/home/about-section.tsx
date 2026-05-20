export function AboutSection() {
  return (
    <section className="mx-auto w-full py-12 md:py-16">
      <h3 className="mt-4 text-center text-3xl font-bold text-[#111f3a] sm:text-5xl">
        About Tech Saksham
      </h3>

      <div className="mx-auto mt-3 h-1 w-24 rounded bg-[#1f9deb]" />

      <div className="mt-8 overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-md">
        <div className="bg-gradient-to-r from-[#1961df] to-[#1294be] px-8 py-4 text-3xl font-bold text-white">
          Overview
        </div>

        <div className="space-y-5 px-6 py-7 text-[15px] leading-8 text-slate-600 sm:px-8">
          <p>
            <span className="font-semibold text-[#1750ce]">
              Tech Saksham
            </span>{" "}
            is a dynamic platform designed to foster learning, innovation,
            collaboration, and knowledge sharing across diverse domains of
            technology and digital transformation. The initiative aims to bring
            together professionals, experts, students, institutions, and
            organizations through impactful events, workshops, seminars, panel
            discussions, and interactive sessions.
          </p>

          <p>
            With a focus on emerging technologies, industry trends, skill
            development, and future-ready solutions, the platform serves as a
            bridge between ideas and implementation. Each event under Tech
            Saksham is curated to encourage meaningful engagement, practical
            insights, and collaborative growth.
          </p>

          <p>
            Through thoughtfully designed sessions and expert-led discussions,
            Tech Saksham aspires to create an ecosystem that empowers
            participants with knowledge, awareness, and opportunities to adapt
            and thrive in the evolving digital landscape.
          </p>
        </div>

        <div className="space-y-5 px-6 pb-7 text-[15px] leading-8 text-slate-600 sm:px-8">
          <h1 className="text-start text-lg font-bold text-[#111f3a] sm:text-xl">
            What We Offer
          </h1>

          <div>
            <p>
              Tech Saksham hosts a wide range of events and engagement
              activities, including:
            </p>

            <ul className="list-inside list-disc px-4">
              <li>Technology workshops and training sessions</li>
              <li>Expert talks and keynote sessions</li>
              <li>Panel discussions and networking opportunities</li>
              <li>Innovation and skill development programs</li>
              <li>Industry, academic, and community collaborations</li>
            </ul>

            <p>
              The platform is committed to building a collaborative environment
              where participants can exchange ideas, explore innovations, and
              gain valuable insights into the technologies shaping the future.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
