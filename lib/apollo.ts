/* ───────────────────────────────────────────
   Apollo.io People Enrichment
   SECURITY: Only used in API routes (server-side).
   Never import this file in client components.
   ─────────────────────────────────────────── */

const APOLLO_API_URL = "https://api.apollo.io/api/v1/people/match";

interface ApolloPersonInput {
  firstName?: string;
  lastName?: string;
  company?: string;
  linkedinUrl?: string;
  email?: string;
}

export interface ApolloPersonResult {
  found: boolean;
  person: {
    id?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    title?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    city?: string;
    state?: string;
    country?: string;
    organizationName?: string;
    organizationWebsite?: string;
    organizationIndustry?: string;
    organizationSize?: string;
    organizationDescription?: string;
    headline?: string;
    photoUrl?: string;
  } | null;
  raw?: Record<string, unknown>;
}

function getApolloKey(): string {
  const key = process.env.APOLLO_API_KEY;
  if (!key) {
    throw new Error("APOLLO_API_KEY is not set");
  }
  return key;
}

/**
 * Enrich a person via Apollo.io People Match API.
 * Requires at least one of:
 *   - firstName + lastName + company
 *   - linkedinUrl
 *   - email
 */
export async function enrichPerson(
  input: ApolloPersonInput
): Promise<ApolloPersonResult> {
  const apiKey = getApolloKey();

  /* Build request body based on available data */
  const body: Record<string, unknown> = {
    reveal_personal_emails: false,
    reveal_phone_number: true,
  };

  if (input.linkedinUrl) {
    body.linkedin_url = input.linkedinUrl;
  }

  if (input.email) {
    body.email = input.email;
  }

  if (input.firstName && input.lastName) {
    body.first_name = input.firstName;
    body.last_name = input.lastName;
  }

  if (input.company) {
    body.organization_name = input.company;
  }

  /* Make the API call */
  const response = await fetch(APOLLO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Apollo API error (${response.status}):`, errorText);
    return { found: false, person: null };
  }

  const data = await response.json();
  const p = data.person;

  if (!p) {
    return { found: false, person: null };
  }

  /* Map Apollo response to our clean interface */
  return {
    found: true,
    person: {
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      fullName: p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim(),
      title: p.title,
      email: p.email,
      phone: p.phone_number || p.sanitized_phone,
      linkedinUrl: p.linkedin_url,
      city: p.city,
      state: p.state,
      country: p.country,
      organizationName: p.organization?.name,
      organizationWebsite: p.organization?.website_url,
      organizationIndustry: p.organization?.industry,
      organizationSize: p.organization?.estimated_num_employees
        ? `${p.organization.estimated_num_employees} employees`
        : undefined,
      organizationDescription: p.organization?.short_description,
      headline: p.headline,
      photoUrl: p.photo_url,
    },
    raw: p,
  };
}

/**
 * Parse a full name into first + last.
 * Handles "John Smith", "Dr. Jane Doe-Smith", etc.
 */
export function parseName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}
