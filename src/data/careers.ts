// Open roles on /career and /sv/career, newest first; an empty list shows only the open application.
// Each role also becomes a schema.org JobPosting on the page (JobPostingSchema.astro).

export type CareerRoleCopy = {
  title: string;
  /** Short facts shown as pills under the title: place, kind of role, start. */
  meta: string[];
  intro: string[];
  doLead: string;
  doItems: string[];
  youLead: string;
  youItems: string[];
  bonus: string;
  /** The application sentence up to the email address, which the page links. */
  apply: string;
  share: string;
};

export type CareerRole = {
  /** Anchor on the page, e.g. /career#developer-intern. */
  id: string;
  /** ISO date (YYYY-MM-DD) the role was posted. */
  datePosted: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "INTERN" | "CONTRACTOR" | "TEMPORARY";
  locality: string;
  en: CareerRoleCopy;
  sv: CareerRoleCopy;
};

export const CAREER_ROLES: CareerRole[] = [
  {
    id: "developer-intern",
    datePosted: "2026-10-29",
    employmentType: "INTERN",
    locality: "Stockholm",
    en: {
      title: "Developer intern",
      meta: ["Stockholm", "Internship", "Start: immediately"],
      intro: [
        "We’re looking for a developer intern who wants to help build Sweden’s next unicorn.",
        "Nuro is a learning platform for students of all ages with ADHD, autism and dyslexia. Nuro adapts schoolwork to each student’s strengths, needs, interests and goals.",
        "The team is based in Stockholm, and AI is as natural a part of our workflow as git. Now we’re looking for someone who wants to help make Nuro better for every student who uses it.",
      ],
      doLead: "With us, you won’t be the one fetching coffee. You will:",
      doItems: [
        "Build the next generation of learning tools and make a real difference for people",
        "Review code, both the team’s and the code AI tools write (AI is very productive; you make sure it’s right)",
        "Test, find bugs and figure out why something broke",
        "Learn to work with AI as a tool, without letting go of responsibility for the code",
      ],
      youLead: "We think you:",
      youItems: [
        "Study computer science, computer engineering or something similar at a university",
        "Can already program and have built something you’re proud of",
        "Have high goals and the discipline to reach them",
        "Would rather read the code one more time than guess",
        "Speak Swedish and English",
      ],
      bonus: "Bonus if you’ve built for the web, already code with AI tools, or care about school and learning.",
      apply: "Send a link to your GitHub or something you’ve built, plus a few lines about yourself, to",
      share: "Know someone who should see this? Send them this page.",
    },
    sv: {
      title: "Utvecklarpraktikant",
      meta: ["Stockholm", "Praktik", "Start: omgående"],
      intro: [
        "Vi på Nuro söker en utvecklarpraktikant som vill vara med och utveckla Sveriges nästa unicorn!",
        "Nuro är en inlärningsplattform för elever i alla åldrar med NPF (adhd, autism och dyslexi). Nuro anpassar skolarbetet efter varje elevs styrkor, behov, intressen och mål.",
        "Teamet sitter i Stockholm och AI är lika självklart i vårt arbetsflöde som git. Nu söker vi någon som vill vara med och göra Nuro bättre för varje elev som använder det.",
      ],
      doLead: "Hos oss blir du inte den som hämtar kaffe. Du kommer att:",
      doItems: [
        "Bygga nästa generations verktyg för lärande och göra skillnad för människor på riktigt",
        "Granska kod, både teamets och den som AI-verktygen skriver (AI är väldigt produktiv, du ser till att det blir rätt)",
        "Testa, hitta buggar och ta reda på varför något gick sönder",
        "Lära dig jobba med AI som verktyg, utan att släppa ansvaret för koden",
      ],
      youLead: "Vi tror att du:",
      youItems: [
        "Pluggar datavetenskap, datateknik eller liknande på universitet eller högskola",
        "Redan kan programmera och har byggt något du är stolt över",
        "Har höga mål och disciplinen att nå dem",
        "Hellre läser koden en gång till än att gissa",
        "Pratar svenska och engelska",
      ],
      bonus: "Extra plus om du har byggt för webben, redan kodar med AI-verktyg eller tycker att skola och lärande är viktigt.",
      apply: "Skicka en länk till din GitHub eller något du har byggt, plus ett par rader om dig själv, till",
      share: "Känner du någon som borde se det här? Skicka sidan vidare!",
    },
  },
];
