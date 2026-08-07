export const SERVER_INSTRUCTIONS = `Computrabajo job search for Latin America (Peru, Colombia, Mexico, Argentina, Chile, Ecuador).

Typical flow: call search-jobs with a keyword, then get-job-detail with an offerId from those results to read the full posting before deciding anything.

Notes on arguments:
- Keywords and locations are URL slugs. Lowercase them and join words with hyphens ("desarrollador de software" becomes "desarrollador-de-software").
- The keyword is matched against the job title, so its wording decides result quality. For software and IT work use "desarrollador-...", "programador", "analista-programador", or a bare noun like "software", "java", "qa". Do not use "ingeniero-de-software": in Latin America "ingeniero de ..." reads as civil, mechanical, electrical or mining engineering, and that search returns mostly unrelated postings.
- A user asking for "ingeniero de software" or "software engineer" means "desarrollador-de-software". Translate the intent rather than transliterating the phrase, and if results still look off-topic, retry with another form before reporting that nothing matched.
- Locations can be broad or specific: "lima", "arequipa", "la-libertad-en-trujillo".
- offerId is the 32-character hexadecimal id returned by search-jobs. It is not the job URL.
- search-jobs and get-job-detail read public listings and need no credentials.

get-profile and list-attached-cvs read the user's own Computrabajo CV and need a session cookie. Use get-profile to tailor a search to the user's actual experience and skills rather than guessing.

apply-to-job submits the user's CV to an employer and cannot be undone. Always confirm the specific offer with the user before calling it, and never call it speculatively or in a loop over search results. It needs a Computrabajo session cookie; if none is configured the tool returns an error explaining how to supply one.`;
