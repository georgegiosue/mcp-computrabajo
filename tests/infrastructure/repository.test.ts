import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ComputrabajoHttpRepository } from "../../src/infrastructure/http/computrabajo-http.repository";

const fixture = (name: string) =>
  readFileSync(join(import.meta.dir, "../fixtures", name), "utf-8");

const SEARCH_HTML = fixture("search-lima.html");
const PROFILE_HTML = fixture("profile.html");
const CVS_HTML = fixture("attached-cvs.html");

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

type Captured = { url: string; init?: RequestInit };

function stubFetch(response: Response): Captured[] {
  const calls: Captured[] = [];
  globalThis.fetch = (async (
    url: string | URL | Request,
    init?: RequestInit,
  ) => {
    calls.push({ url: String(url), init });
    return response.clone();
  }) as typeof fetch;
  return calls;
}

describe("searchJobs", () => {
  test("parses listings out of the live HTML shape via cheerio/slim", async () => {
    stubFetch(new Response(SEARCH_HTML, { status: 200 }));

    const jobs = await new ComputrabajoHttpRepository({
      defaultCountry: "pe",
    }).searchJobs({ keyword: "software", location: "lima" });

    expect(jobs.length).toBeGreaterThan(0);

    const [first] = jobs;
    expect(first.offerId).toMatch(/^[0-9A-F]{32}$/);
    expect(first.title.length).toBeGreaterThan(0);
    expect(first.company.length).toBeGreaterThan(0);
    expect(first.url).toStartWith("https://pe.computrabajo.com/");
    expect(first.url).not.toContain("#");
  });

  test("reads the location without the rating or raw whitespace", async () => {
    stubFetch(new Response(SEARCH_HTML, { status: 200 }));

    const jobs = await new ComputrabajoHttpRepository({
      defaultCountry: "pe",
    }).searchJobs({ keyword: "software", location: "lima" });

    for (const job of jobs) {
      expect(job.location).not.toMatch(/[\r\n]/);
      expect(job.location).not.toMatch(/^\d+,\d+/);
      expect(job.location).not.toMatch(/ {2}/);
    }
    expect(jobs[0].location).toBe("San Isidro, Lima");
  });

  test("sends the configured cookie and honours the default country", async () => {
    const calls = stubFetch(new Response(SEARCH_HTML, { status: 200 }));

    await new ComputrabajoHttpRepository({
      cookies: "SESSION=abc",
      defaultCountry: "cl",
    }).searchJobs({ keyword: "software" });

    expect(calls[0].url).toBe(
      "https://cl.computrabajo.com/trabajo-de-software",
    );
    expect(new Headers(calls[0].init?.headers).get("cookie")).toBe(
      "SESSION=abc",
    );
  });

  test("omits the cookie header entirely when none is configured", async () => {
    const calls = stubFetch(new Response(SEARCH_HTML, { status: 200 }));

    await new ComputrabajoHttpRepository({ defaultCountry: "pe" }).searchJobs({
      keyword: "software",
    });

    expect(new Headers(calls[0].init?.headers).has("cookie")).toBe(false);
  });

  test("an explicit country argument overrides the default", async () => {
    const calls = stubFetch(new Response(SEARCH_HTML, { status: 200 }));

    await new ComputrabajoHttpRepository({ defaultCountry: "pe" }).searchJobs({
      keyword: "software",
      country: "mx",
    });

    expect(calls[0].url).toStartWith("https://mx.computrabajo.com/");
  });

  test("surfaces a non-ok response as an error", async () => {
    stubFetch(new Response("nope", { status: 503, statusText: "Unavailable" }));

    await expect(
      new ComputrabajoHttpRepository({ defaultCountry: "pe" }).searchJobs({
        keyword: "software",
      }),
    ).rejects.toThrow(/503/);
  });
});

describe("applyToJob", () => {
  test("refuses without a cookie instead of calling Computrabajo", async () => {
    const calls = stubFetch(new Response("{}", { status: 200 }));

    await expect(
      new ComputrabajoHttpRepository({ defaultCountry: "pe" }).applyToJob({
        offerId: "A".repeat(32),
      }),
    ).rejects.toThrow(/session cookie/i);

    expect(calls).toHaveLength(0);
  });

  const apply = () =>
    new ComputrabajoHttpRepository({
      cookies: "SESSION=abc",
      defaultCountry: "pe",
    }).applyToJob({ offerId: "A".repeat(32) });

  test("reports success only on the offerappliedok result code", async () => {
    stubFetch(
      new Response(JSON.stringify({ type: 5, result: "OfferAppliedOk" })),
    );

    expect(await apply()).toEqual({
      success: true,
      message: "Application submitted",
    });
  });

  test("reports failure when the offer is no longer valid", async () => {
    stubFetch(
      new Response(
        JSON.stringify({ type: 7, result: "OfferNotValid", redirect: false }),
      ),
    );

    const result = await apply();

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/no longer accepting/i);
  });

  test("reports failure when Computrabajo rejects the session", async () => {
    stubFetch(new Response(JSON.stringify({ result: "notLoggedUser" })));

    const result = await apply();

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/fresh cookie/i);
  });

  test("prefers the message Computrabajo supplies", async () => {
    stubFetch(
      new Response(
        JSON.stringify({ result: "SomethingElse", message: "Ya postulaste" }),
      ),
    );

    expect(await apply()).toEqual({
      success: false,
      message: "Ya postulaste",
    });
  });

  test("does not claim success when the response is unreadable", async () => {
    stubFetch(new Response("<html>maintenance</html>"));

    const result = await apply();

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/probably not submitted/i);
  });

  test("sends the cookie to the country-specific candidate host", async () => {
    const calls = stubFetch(
      new Response(JSON.stringify({ result: "OfferAppliedOk" })),
    );

    await new ComputrabajoHttpRepository({
      cookies: "SESSION=abc",
      defaultCountry: "pe",
    }).applyToJob({ offerId: "A".repeat(32) });

    expect(calls[0].url).toStartWith("https://candidato.pe.computrabajo.com/");
    expect(new Headers(calls[0].init?.headers).get("cookie")).toBe(
      "SESSION=abc",
    );
  });
});

describe("getProfile", () => {
  const authed = () =>
    new ComputrabajoHttpRepository({
      cookies: "SESSION=abc",
      defaultCountry: "pe",
    });

  test("parses the CV page into a structured profile", async () => {
    stubFetch(new Response(PROFILE_HTML, { status: 200 }));

    const profile = await authed().getProfile({});

    expect(profile.name).toBe("Ada Lovelace");
    expect(profile.headline).toBe("Ingeniera de software");
    expect(profile.location).toBe("Miraflores");
    expect(profile.email).toBe("ada@example.com");
    expect(profile.phone).toBe("+51-900000000");
    expect(profile.photoUrl).toStartWith("https://");
    expect(profile.summary).toContain("compiladores");
  });

  test("reads experiences in order and skips the add-new placeholder", async () => {
    stubFetch(new Response(PROFILE_HTML, { status: 200 }));

    const { experiences } = await authed().getProfile({});

    expect(experiences).toHaveLength(2);
    expect(experiences[0]).toEqual({
      id: "AAAA1111",
      title: "Ingeniera Backend",
      company: "Analytical Engines S.A.C.",
      period: "Enero 2024 - Actualmente",
      description: "Diseño de servicios distribuidos en Rust y PostgreSQL.",
    });
  });

  test("takes the untruncated description, not the 'ver más' copy", async () => {
    stubFetch(new Response(PROFILE_HTML, { status: 200 }));

    const { experiences } = await authed().getProfile({});

    expect(experiences[0].description).not.toContain("...");
    expect(experiences[0].description).not.toContain("ver más");
  });

  test("reads educations and skips the add-new placeholder", async () => {
    stubFetch(new Response(PROFILE_HTML, { status: 200 }));

    const { educations } = await authed().getProfile({});

    expect(educations).toHaveLength(1);
    expect(educations[0].institution).toBe("Universidad Nacional de Trujillo");
    expect(educations[0].period).toBe("Junio 2016 - Diciembre 2020");
  });

  test("splits languages into name and level", async () => {
    stubFetch(new Response(PROFILE_HTML, { status: 200 }));

    const { languages } = await authed().getProfile({});

    expect(languages).toEqual([
      { language: "Español", level: "Nativo" },
      { language: "Inglés", level: "Avanzado" },
    ]);
  });

  test("groups skills and drops the duplicates Computrabajo emits", async () => {
    stubFetch(new Response(PROFILE_HTML, { status: 200 }));

    const { skills } = await authed().getProfile({});

    expect(skills).toEqual([
      { name: "Rust", group: "technical" },
      { name: "PostgreSQL", group: "technical" },
      { name: "Trabajo en equipo", group: "interpersonal" },
      { name: "Licencia de conducir", group: "other" },
    ]);
  });

  test("refuses without a cookie", async () => {
    const calls = stubFetch(new Response(PROFILE_HTML, { status: 200 }));

    await expect(
      new ComputrabajoHttpRepository({ defaultCountry: "pe" }).getProfile({}),
    ).rejects.toThrow(/session cookie/i);

    expect(calls).toHaveLength(0);
  });

  test("rejects a 200 page with no CV on it instead of returning blanks", async () => {
    stubFetch(new Response("<html><body>Inicia sesión</body></html>"));

    await expect(authed().getProfile({})).rejects.toThrow(
      /expired or invalid/i,
    );
  });

  test("reports an expired session rather than parsing the login page", async () => {
    globalThis.fetch = (async () =>
      Object.defineProperty(
        new Response("<html>login</html>", { status: 200 }),
        "url",
        { value: "https://candidato.pe.computrabajo.com/acceso/" },
      )) as unknown as typeof fetch;

    await expect(authed().getProfile({})).rejects.toThrow(
      /expired or invalid/i,
    );
  });
});

describe("listAttachedCvs", () => {
  test("lists uploaded CVs and flags the default one", async () => {
    stubFetch(new Response(CVS_HTML, { status: 200 }));

    const cvs = await new ComputrabajoHttpRepository({
      cookies: "SESSION=abc",
      defaultCountry: "pe",
    }).listAttachedCvs({});

    expect(cvs).toEqual([
      { id: "CV1111", fileName: "LOVELACE_CV.pdf", isDefault: true },
      { id: "CV2222", fileName: "LOVELACE_CV_EN.docx", isDefault: false },
    ]);
  });

  test("rejects a page without the CV table rather than reporting zero CVs", async () => {
    stubFetch(new Response("<html><body>Inicia sesión</body></html>"));

    await expect(
      new ComputrabajoHttpRepository({
        cookies: "SESSION=abc",
        defaultCountry: "pe",
      }).listAttachedCvs({}),
    ).rejects.toThrow(/expired or invalid/i);
  });

  test("hits the uploadcv page on the configured country host", async () => {
    const calls = stubFetch(new Response(CVS_HTML, { status: 200 }));

    await new ComputrabajoHttpRepository({
      cookies: "SESSION=abc",
      defaultCountry: "pe",
    }).listAttachedCvs({ country: "ar" });

    expect(calls[0].url).toBe(
      "https://candidato.ar.computrabajo.com/candidate/cv/uploadcv",
    );
  });
});
