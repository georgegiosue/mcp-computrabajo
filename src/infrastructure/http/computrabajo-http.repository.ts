import * as cheerio from "cheerio/slim";
import {
  api,
  type ComputrabajoConfig,
  type CountryCode,
} from "../../config/api";
import type {
  ApplicationResult,
  AttachedCv,
  Benefit,
  Education,
  Experience,
  JobDetail,
  JobListing,
  Language,
  Profile,
  Skill,
} from "../../domain/models/computrabajo.model";
import type { ComputrabajoRepository } from "../../domain/ports/computrabajo.repository";
import {
  buildApplyUrl,
  buildAttachedCvsUrl,
  buildDetailUrl,
  buildProfileUrl,
  buildSearchUrl,
} from "../../shared/utils";

const SKILL_GROUPS = [
  { selector: ".jsHardSkills", group: "technical" },
  { selector: ".jsSoftSkills", group: "interpersonal" },
  { selector: ".jsOtherSkills", group: "other" },
] as const satisfies readonly { selector: string; group: Skill["group"] }[];

type ApplyResponse = { type?: number; result?: string; message?: string };

const APPLY_OK = "offerappliedok";

const APPLY_ERRORS: Record<string, string> = {
  offernotvalid:
    "The offer is no longer accepting applications, or the offer ID is wrong.",
  notloggeduser:
    "Computrabajo did not recognise the session. Reconnect and paste a fresh cookie.",
};

const INVALID_SESSION =
  "Computrabajo did not return the signed-in page — the session cookie is expired or invalid. Reconnect the connector and paste a fresh cookie.";

const MISSING_COOKIES =
  "No Computrabajo session cookie available. On the remote server, reconnect the connector and paste your session cookie when prompted. Running locally, set the CT_COOKIES environment variable.";

export class ComputrabajoHttpRepository implements ComputrabajoRepository {
  constructor(private readonly config: ComputrabajoConfig) {}

  private requireCookies(): string {
    const { cookies } = this.config;
    if (!cookies) throw new Error(MISSING_COOKIES);
    return cookies;
  }

  private async fetchAuthenticatedPage(
    url: string,
    country: CountryCode,
  ): Promise<string> {
    const cookies = this.requireCookies();

    const res = await fetch(url, {
      headers: {
        ...api.headers,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        Cookie: cookies,
        Referer: `https://candidato.${country}.computrabajo.com/candidate/home`,
      },
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    const finalUrl = res.url || url;
    if (finalUrl.includes("/acceso") || finalUrl.includes("/login")) {
      throw new Error(INVALID_SESSION);
    }

    return res.text();
  }

  async searchJobs(params: {
    keyword: string;
    location?: string;
    country?: CountryCode;
    page?: number;
  }): Promise<JobListing[]> {
    const country = params.country || this.config.defaultCountry;
    const url = buildSearchUrl(
      country,
      params.keyword,
      params.location,
      params.page,
    );

    const { cookies } = this.config;
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

        const location = $el
          .find("p.fs16.fc_base.mt5:not(.dFlex) span.mr10")
          .first()
          .text()
          .replace(/\s+/g, " ")
          .trim();

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
    country?: CountryCode;
  }): Promise<JobDetail> {
    const country = params.country || this.config.defaultCountry;
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
    country?: CountryCode;
  }): Promise<ApplicationResult> {
    const country = params.country || this.config.defaultCountry;
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
        Cookie: this.requireCookies(),
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

    let data: ApplyResponse;
    try {
      data = (await res.json()) as ApplyResponse;
    } catch {
      return {
        success: false,
        message:
          "Computrabajo returned a response that could not be read. The application was probably not submitted — check the offer on the site.",
      };
    }

    const code = typeof data.result === "string" ? data.result : "";
    const success = code.toLowerCase() === APPLY_OK;
    const detail = typeof data.message === "string" ? data.message.trim() : "";

    if (success) {
      return { success, message: detail || "Application submitted" };
    }

    return {
      success,
      message:
        detail ||
        APPLY_ERRORS[code.toLowerCase()] ||
        `Computrabajo rejected the application: ${code || "unknown reason"}`,
    };
  }

  async getProfile(params: { country?: CountryCode }): Promise<Profile> {
    const country = params.country || this.config.defaultCountry;
    const html = await this.fetchAuthenticatedPage(
      buildProfileUrl(country),
      country,
    );
    const $ = cheerio.load(html);

    const header = $(".form_header");
    const name = header.find(".info_user p.fs20").first().text().trim();

    if (!name) throw new Error(INVALID_SESSION);

    const contact = (icon: string) =>
      header.find(`.ico_cv.${icon}`).parent().find(".pl10px").text().trim();

    const headlineBlock = $("p.title_cv")
      .filter((_, el) => {
        const text = $(el).text().trim();
        return text !== "" && !text.startsWith("Mis ");
      })
      .first()
      .closest(".form_fields");

    const experiences: Experience[] = $("#experiences-container > li")
      .filter((_, el) => $(el).attr("id") !== "add-experience-container")
      .map((_, el) => {
        const $el = $(el);
        return {
          id: $el.attr("id") || "",
          title: $el.find("p.fs15").first().text().trim(),
          company: $el.find("p.fc80").not(".mt5").first().text().trim(),
          period: $el.find("p.fc80.mt5").first().text().trim(),
          description: $el
            .find("p[it-show-preview]")
            .first()
            .text()
            .replace(/\s+/g, " ")
            .trim(),
        } satisfies Experience;
      })
      .get();

    const educations: Education[] = $("#educations-container > li")
      .filter((_, el) => $(el).attr("id") !== "add-education-container")
      .map((_, el) => {
        const $el = $(el);
        return {
          id: $el.attr("id") || "",
          level: $el.find("p.fs15").first().text().trim(),
          institution: $el.find("p.fc80").not(".mt5").first().text().trim(),
          period: $el.find("p.fc80.mt5").first().text().trim(),
        } satisfies Education;
      })
      .get();

    const languages: Language[] = $("[data-language-item]")
      .map((_, el) => {
        const raw = $(el).clone().children().remove().end().text().trim();
        const [language, ...rest] = raw.split(" - ");
        return {
          language: language.trim(),
          level: rest.join(" - ").trim(),
        } satisfies Language;
      })
      .get()
      .filter((entry) => entry.language.length > 0);

    const skills: Skill[] = [];
    const seenSkills = new Set<string>();
    for (const { selector, group } of SKILL_GROUPS) {
      $(`${selector} [data-skill-item]`).each((_, el) => {
        const name = ($(el).attr("data-skill-item-text") || "").trim();
        const key = `${group}:${name.toLowerCase()}`;
        if (!name || seenSkills.has(key)) return;
        seenSkills.add(key);
        skills.push({ name, group });
      });
    }

    return {
      name,
      headline: headlineBlock.find("p.title_cv").first().text().trim(),
      location: header.find(".info_user p.fs15").first().text().trim(),
      email: contact("i_mail"),
      phone: contact("i_telf"),
      photoUrl: header.find(".photo_user img").attr("src") || "",
      summary: headlineBlock
        .find("p")
        .not(".title_cv")
        .first()
        .text()
        .replace(/\s+/g, " ")
        .trim(),
      experiences,
      educations,
      languages,
      skills,
    };
  }

  async listAttachedCvs(params: {
    country?: CountryCode;
  }): Promise<AttachedCv[]> {
    const country = params.country || this.config.defaultCountry;
    const html = await this.fetchAuthenticatedPage(
      buildAttachedCvsUrl(country),
      country,
    );
    const $ = cheerio.load(html);

    if ($(".box_hojadevida").length === 0) throw new Error(INVALID_SESSION);

    return $(".box_hojadevida ul.fila_tabla")
      .map((_, el) => {
        const $el = $(el);
        const $file = $el.find("a.it-file");
        if ($file.length === 0) return null;

        return {
          id: $file.attr("data-filecandidateid") || "",
          fileName: $file.text().trim(),
          isDefault: $el.find("input[name='rbPrincipal']").is("[checked]"),
        } satisfies AttachedCv;
      })
      .get()
      .filter((cv): cv is AttachedCv => cv !== null);
  }
}
