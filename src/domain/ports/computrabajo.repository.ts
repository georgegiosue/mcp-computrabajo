import type { CountryCode } from "../../config/api";
import type {
  ApplicationResult,
  AttachedCv,
  JobDetail,
  JobListing,
  Profile,
} from "../models/computrabajo.model";

export interface ComputrabajoRepository {
  searchJobs(params: {
    keyword: string;
    location?: string;
    country?: CountryCode;
    page?: number;
  }): Promise<JobListing[]>;

  getJobDetail(params: {
    offerId: string;
    country?: CountryCode;
  }): Promise<JobDetail>;

  applyToJob(params: {
    offerId: string;
    country?: CountryCode;
  }): Promise<ApplicationResult>;

  getProfile(params: { country?: CountryCode }): Promise<Profile>;

  listAttachedCvs(params: { country?: CountryCode }): Promise<AttachedCv[]>;
}
