import {ManualProfileForm, ResumePreviewData, emptyManualProfileForm} from '../types/forms';

const deriveExperienceFromSummary = (summary: string) => {
  const match = summary.match(/(\d+)(?:\+)?\s*(?:years|yrs)/i);
  if (match) return `${match[1]}+`;
  return '';
};

const deriveWorkPreference = (location: string, summary: string) => {
  const source = `${location} ${summary}`.toLowerCase();
  if (source.includes('remote')) return 'remote';
  if (source.includes('hybrid')) return 'hybrid';
  return 'onsite';
};

export const resumePreviewToManualForm = (resume: ResumePreviewData): ManualProfileForm => {
  const experience = deriveExperienceFromSummary(resume.summary);
  return {
    ...emptyManualProfileForm,
    fullName: resume.fullName || emptyManualProfileForm.fullName,
    email: resume.email || emptyManualProfileForm.email,
    phone: resume.phone ?? emptyManualProfileForm.phone,
    location: resume.location || emptyManualProfileForm.location,
    currentTitle: resume.title || emptyManualProfileForm.currentTitle,
    experience,
    workPreference: deriveWorkPreference(resume.location, resume.summary),
    skills: resume.skills.join(', '),
    notes: resume.summary || emptyManualProfileForm.notes,
  };
};
