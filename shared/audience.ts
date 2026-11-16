// "Who's playing?" Different ages are targeted by different scams, so the app recommends the most
// relevant ones first, and older adults get Easy Mode and read-aloud switched on automatically.
export type Audience = "young" | "adult" | "older";

export const AUDIENCES: Record<Audience, { label: string; ages: string; icon: string; recommended: string[]; why: string }> = {
  young: { label: "Young person", ages: "13–25", icon: "🧑‍🎓", recommended: ["parcel", "investment", "romance"], why: "Fake delivery texts, 'get rich quick' investment ads and online romance scams often target young people." },
  adult: { label: "Adult", ages: "26–64", icon: "🧑‍💼", recommended: ["new_number", "safe_account", "tax"], why: "'Hi Mum' messages, fake bank calls and fake tax refunds often target working adults and parents." },
  older: { label: "Older adult", ages: "65+", icon: "👵", recommended: ["midnight", "courier", "safe_account"], why: "Fake grandchild calls, fake police 'couriers' and fake bank calls often target older people." },
};
export const AUDIENCE_ORDER: Audience[] = ["young", "adult", "older"];
