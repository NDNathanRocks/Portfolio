import ContactForm from "./ContactForm";
import HelloRotator from "./HelloRotator";
import { profile } from "@/lib/content";

const mono = "font-mono text-xs uppercase tracking-[0.14em]";
const link = "underline-offset-4 hover:underline focus-visible:underline";

export default function Contact() {
  return (
    <section id="contact" className="overflow-hidden bg-accent px-6 pb-10 pt-20 text-ink md:px-14 md:pt-24">
      <HelloRotator />

      <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="max-w-[28ch] font-display text-2xl font-light leading-snug md:text-3xl">
            Send a note and I&rsquo;ll reply to the address you give.
          </p>
          <dl className={`mt-10 space-y-6 ${mono}`}>
            <div>
              <dt className="mb-1 opacity-60">Email</dt>
              <dd><a href={`mailto:${profile.email}`} className={`break-all ${link}`}>{profile.email}</a></dd>
            </div>
            <div>
              <dt className="mb-1 opacity-60">LinkedIn</dt>
              <dd><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={link}>/in/nathannicholasdsouza</a></dd>
            </div>
            <div>
              <dt className="mb-1 opacity-60">GitHub</dt>
              <dd><a href={profile.github} target="_blank" rel="noopener noreferrer" className={link}>/NDNathanRocks</a></dd>
            </div>
            <div>
              <dt className="mb-1 opacity-60">Based in</dt>
              <dd>{profile.location}</dd>
            </div>
          </dl>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <ContactForm />
        </div>
      </div>

      <p className={`mt-20 ${mono}`}>&copy; 2026 {profile.fullName}</p>
    </section>
  );
}
