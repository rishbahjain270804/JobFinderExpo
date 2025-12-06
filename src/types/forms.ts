export type ManualProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentTitle: string;
  experience: string;
  workPreference: string;
  targetSalary: string;
  skills: string;
  availability: string;
  notes: string;
};

export type ManualProfilePrefill = Partial<ManualProfileForm>;

export type ResumePreviewData = {
  fileName: string;
  fullName: string;
  email: string;
  phone?: string;
  title: string;
  location: string;
  skills: string[];
  summary: string;
};

export const emptyManualProfileForm: ManualProfileForm = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  currentTitle: '',
  experience: '',
  workPreference: 'remote',
  targetSalary: '',
  skills: '',
  availability: '',
  notes: '',
};
