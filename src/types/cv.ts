export interface Link {
  label: string;
  url: string;
}

export interface Basics {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  links: Link[];
}

export interface Bullet {
  id: string;
  text: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  location: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  /** Honors, GPA, thesis — one line. */
  detail: string;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  location: string;
  role: string;
  /** Free text such as "Jan 2025"; "Present" for a current role. */
  start: string;
  end: string;
  bullets: Bullet[];
}

export interface SkillGroup {
  id: string;
  label: string;
  items: string[];
}

/** Certifications, awards, languages, anything else — a titled list. */
export interface Extra {
  id: string;
  title: string;
  items: string[];
}

export interface Cv {
  basics: Basics;
  summary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillGroup[];
  extras: Extra[];
}

export function emptyCv(): Cv {
  return {
    basics: { fullName: '', email: '', phone: '', location: '', links: [] },
    summary: '',
    education: [],
    experience: [],
    skills: [],
    extras: [],
  };
}
