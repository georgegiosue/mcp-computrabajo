export type JobListing = {
  offerId: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  modality?: string;
  publishedDate: string;
  url: string;
};

export type JobDetail = {
  offerId: string;
  title: string;
  company: string;
  companyDescription: string;
  city: string;
  department: string;
  description: string;
  educationLevel: string;
  experienceYears: number;
  vacancies: number;
  salary: string;
  contractType: string;
  workday: string;
  category: string;
  publishedDate: string;
  applyUrl: string;
  benefits: Benefit[];
};

export type Benefit = {
  category: string;
  items: string[];
};

export type ApplicationResult = {
  success: boolean;
  message: string;
};
