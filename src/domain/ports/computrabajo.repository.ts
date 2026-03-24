import type {
  ApplicationResult,
  JobDetail,
  JobListing,
} from "../models/computrabajo.model";

export interface ComputrabajoRepository {
  searchJobs(params: {
    keyword: string;
    location?: string;
    country?: string;
    page?: number;
  }): Promise<JobListing[]>;

  getJobDetail(params: {
    offerId: string;
    country?: string;
  }): Promise<JobDetail>;

  applyToJob(params: {
    offerId: string;
    country?: string;
  }): Promise<ApplicationResult>;
}
