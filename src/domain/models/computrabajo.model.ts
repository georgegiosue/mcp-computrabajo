import { z } from "zod";

export const jobListingSchema = z.object({
  offerId: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  salary: z.string().optional(),
  modality: z.string().optional(),
  publishedDate: z.string(),
  url: z.string(),
});

export const benefitSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

export const jobDetailSchema = z.object({
  offerId: z.string(),
  title: z.string(),
  company: z.string(),
  companyDescription: z.string(),
  city: z.string(),
  department: z.string(),
  description: z.string(),
  educationLevel: z.string(),
  experienceYears: z.number(),
  vacancies: z.number(),
  salary: z.string(),
  contractType: z.string(),
  workday: z.string(),
  category: z.string(),
  publishedDate: z.string(),
  applyUrl: z.string(),
  benefits: z.array(benefitSchema),
});

export const applicationResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const experienceSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  period: z.string(),
  description: z.string(),
});

export const educationSchema = z.object({
  id: z.string(),
  level: z.string(),
  institution: z.string(),
  period: z.string(),
});

export const languageSchema = z.object({
  language: z.string(),
  level: z.string(),
});

export const skillSchema = z.object({
  name: z.string(),
  group: z.enum(["technical", "interpersonal", "other"]),
});

export const profileSchema = z.object({
  name: z.string(),
  headline: z.string(),
  location: z.string(),
  email: z.string(),
  phone: z.string(),
  photoUrl: z.string(),
  summary: z.string(),
  experiences: z.array(experienceSchema),
  educations: z.array(educationSchema),
  languages: z.array(languageSchema),
  skills: z.array(skillSchema),
});

export const attachedCvSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  isDefault: z.boolean(),
});

export type JobListing = z.infer<typeof jobListingSchema>;
export type Benefit = z.infer<typeof benefitSchema>;
export type JobDetail = z.infer<typeof jobDetailSchema>;
export type ApplicationResult = z.infer<typeof applicationResultSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Language = z.infer<typeof languageSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type AttachedCv = z.infer<typeof attachedCvSchema>;
