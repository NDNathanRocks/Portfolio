import ContactForm from "./ContactForm";
import HelloRotator from "./HelloRotator";
import Landing, { LandingCube } from "./story/Landing";
import ActKicker from "./story/ActKicker";
import WarpFlash from "./story/WarpFlash";
import Ascent from "./story/Ascent";
import { taglines } from "@/lib/story";
import { profile } from "@/lib/content";
import { resumePath } from "@/lib/site";

const mono = "font-mono text-xs uppercase tracking-[0.14em]";
const link = "underline-offset-4 hover:underline focus-visible:underline";

export default function Contact() {
  return (
    <Landing id="contact" className="overflow-hidden bg-accent px-6 pb-10 pt-20 text-ink md:px-14 md:pt-24">
      <WarpFlash />
      <ActKicker index={5} line={taglines.landing} className="mb-10" kickerClass="text-ink" lineClass="text-ink/80" />
      <HelloRotator />

      <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="max-w-[28ch] font-display text-2xl font-light leading-snug md:text-3xl">
            Send a note and I&rsquo;ll reply to the address you give.
          </p>
          <dl className={`mt-10 space-y-6 ${mono}`}>
            <div>
              <dt className="mb-1 opacity-80">Email</dt>
              <dd><a href={`mailto:${profile.email}`} className={`break-all ${link}`}>{profile.email}</a></dd>
            </div>
            <div>
              <dt className="mb-1 opacity-80">LinkedIn</dt>
              <dd><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={link}>/in/nathannicholasdsouza</a></dd>
            </div>
            <div>
              <dt className="mb-1 opacity-80">GitHub</dt>
              <dd><a href={profile.github} target="_blank" rel="noopener noreferrer" className={link}>/NDNathanRocks</a></dd>
            </div>
            <div>
              <dt className="mb-1 opacity-80">Resume</dt>
              <dd><a href={resumePath} download="Nathan_DSouza_Resume.pdf" className={link}>Download PDF ↓</a></dd>
            </div>
            <div>
              <dt className="mb-1 opacity-80">Based in</dt>
              <dd>{profile.location}</dd>
            </div>
          </dl>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <ContactForm />
        </div>
      </div>

      <div className="mt-20 flex items-end justify-between gap-6">
        <div className={`flex flex-wrap items-center gap-x-8 gap-y-3 ${mono}`}>
          <p>&copy; 2026 {profile.fullName}</p>
          <Ascent className={`-my-3 inline-flex min-h-11 items-center ${link}`} />
        </div>
        <LandingCube />
      </div>
    </Landing>
  );
}
