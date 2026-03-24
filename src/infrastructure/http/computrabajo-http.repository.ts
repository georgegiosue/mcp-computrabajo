import * as cheerio from "cheerio";
import { api } from "../../config/api";
import type {
  ApplicationResult,
  Benefit,
  JobDetail,
  JobListing,
} from "../../domain/models/computrabajo.model";
import type { ComputrabajoRepository } from "../../domain/ports/computrabajo.repository";
import {
  buildApplyUrl,
  buildDetailUrl,
  buildSearchUrl,
} from "../../shared/utils";

export class ComputrabajoHttpRepository implements ComputrabajoRepository {
  async searchJobs(params: {
    keyword: string;
    location?: string;
    country?: string;
    page?: number;
  }): Promise<JobListing[]> {
    const country = params.country || api.getDefaultCountry();
    const url = buildSearchUrl(
      country,
      params.keyword,
      params.location,
      params.page,
    );

    const cookies = api.getCookies();
    const res = await fetch(url, {
      headers: {
        ...api.headers,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...(cookies ? { Cookie: cookies } : {}),
      },
    });

    if (!res.ok) {
      throw new Error(`Search failed: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    return $("article.box_offer")
      .map((_, el) => {
        const $el = $(el);
        const offerId = $el.attr("data-id") || "";
        const $link = $el.find("h2 a.js-o-link");
        const title = $link.text().trim();
        const href = $link.attr("href") || "";

        const $company = $el.find("[offer-grid-article-company-url]");
        const company =
          $company.length > 0
            ? $company.text().trim()
            : $el.find("p.dFlex.vm_fx").first().text().trim();

        const location = $el.find("p.fs16.fc_base.mt5 span.mr10").text().trim();

        const $salaryIcon = $el.find(".icon.i_salary");
        const salary =
          $salaryIcon.length > 0
            ? $salaryIcon.parent().text().trim()
            : undefined;

        const $modalityIcon = $el.find(".icon.i_home_office, .icon.i_home");
        const modality =
          $modalityIcon.length > 0
            ? $modalityIcon.parent().text().trim()
            : undefined;

        const publishedDate = $el.find("p.fs13.fc_aux").text().trim();

        return {
          offerId,
          title,
          company,
          location,
          salary,
          modality,
          publishedDate,
          url: `https://${country}.computrabajo.com${href.split("#")[0]}`,
        } satisfies JobListing;
      })
      .get();
  }

  async getJobDetail(params: {
    offerId: string;
    country?: string;
  }): Promise<JobDetail> {
    const country = params.country || api.getDefaultCountry();
    const url = buildDetailUrl(params.offerId);

    const res = await fetch(url, {
      headers: {
        ...api.headers,
        Accept: "*/*",
        Origin: `https://${country}.computrabajo.com`,
        Referer: `https://${country}.computrabajo.com/`,
      },
    });

    if (!res.ok) {
      throw new Error(`Detail fetch failed: ${res.status} ${res.statusText}`);
    }

    type OfferResponse = {
      o: {
        eoi: string;
        ltr: string;
        t: string;
        cn: string;
        c: string;
        l: string;
        ld: string;
        me: string;
        ey: number;
        v: number;
        lss: string;
        lsj: string;
        lset: string;
        cat: string;
        st: string;
        lha: string;
      };
      c: {
        dc: string;
        b?: {
          pbc?: { d: string; cb: { bd: string }[] }[];
        };
      };
    };

    const data = (await res.json()) as OfferResponse;
    const o = data.o;
    const c = data.c;

    const benefits: Benefit[] = (c?.b?.pbc || []).map((b) => ({
      category: b.d,
      items: b.cb.map((item) => item.bd),
    }));

    return {
      offerId: o.eoi,
      title: o.ltr || o.t,
      company: o.cn,
      companyDescription: c?.dc || "",
      city: o.c,
      department: o.l,
      description: o.ld,
      educationLevel: o.me || "",
      experienceYears: o.ey || 0,
      vacancies: o.v || 0,
      salary: o.lss || "",
      contractType: o.lsj || "",
      workday: o.lset || "",
      category: o.cat || "",
      publishedDate: o.st || "",
      applyUrl: o.lha || "",
      benefits,
    };
  }

  async applyToJob(params: {
    offerId: string;
    country?: string;
  }): Promise<ApplicationResult> {
    const country = params.country || api.getDefaultCountry();
    const applyUrl = buildApplyUrl(country, params.offerId);

    const body = new URLSearchParams();
    body.append("url", applyUrl);
    body.append(
      "urlLogin",
      `https://candidato.${country}.computrabajo.com/acceso/`,
    );
    body.append("ismobile", "false");
    body.append("oi", params.offerId);
    body.append("p", "280");
    body.append("idb", "1");
    body.append("d", "33");
    body.append("lc", "ListOffers");

    const res = await fetch(applyUrl, {
      method: "POST",
      headers: {
        ...api.headers,
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: api.requireCookies(),
        Origin: `https://${country}.computrabajo.com`,
        Referer: `https://${country}.computrabajo.com/`,
      },
      body: body.toString(),
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Application failed: ${res.status} ${res.statusText}`,
      };
    }

    try {
      const data = await res.json();
      return {
        success: true,
        message:
          typeof data === "object"
            ? JSON.stringify(data)
            : "Application submitted successfully",
      };
    } catch {
      return {
        success: true,
        message: "Application submitted successfully",
      };
    }
  }
}
