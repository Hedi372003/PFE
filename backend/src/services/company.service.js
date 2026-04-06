const prisma = require("../config/prisma");

const DEFAULT_COMPANY_PROFILE = {
  id: "default",
  name: "TeleBot",
  supportEmail: "operations@telebot.local",
  supportPhone: "+216 70 000 000",
  hours: "Monday to Friday, 08:00 to 18:00",
  products: [
    "Remote visitor reception",
    "Hybrid collaboration sessions",
    "Facility robot supervision",
  ],
  welcomeMessage:
    "Operate telepresence robots, communicate in real time, and supervise visits from one secure administration console.",
  lobbyInstructions:
    "Visitors receive approval, a robot assignment, and live communication support before entering the remote experience.",
};

const mapCompanyProfile = (profile) => ({
  id: profile.id,
  name: profile.name,
  supportEmail: profile.supportEmail,
  supportPhone: profile.supportPhone,
  hours: profile.hours,
  products: Array.isArray(profile.products) ? profile.products : [],
  welcomeMessage: profile.welcomeMessage,
  lobbyInstructions: profile.lobbyInstructions,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

const sanitizeProducts = (products) => {
  if (!Array.isArray(products)) {
    return DEFAULT_COMPANY_PROFILE.products;
  }

  const normalized = products
    .map((product) => String(product || "").trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : DEFAULT_COMPANY_PROFILE.products;
};

async function ensureCompanyProfile() {
  const profile = await prisma.companyProfile.upsert({
    where: { id: DEFAULT_COMPANY_PROFILE.id },
    update: {},
    create: DEFAULT_COMPANY_PROFILE,
  });

  return mapCompanyProfile(profile);
}

async function getCompanyProfile() {
  return ensureCompanyProfile();
}

async function updateCompanyProfile(payload) {
  const nextProfile = await prisma.companyProfile.upsert({
    where: { id: DEFAULT_COMPANY_PROFILE.id },
    update: {
      name: String(payload.name || DEFAULT_COMPANY_PROFILE.name).trim(),
      supportEmail: String(payload.supportEmail || DEFAULT_COMPANY_PROFILE.supportEmail)
        .trim()
        .toLowerCase(),
      supportPhone: String(payload.supportPhone || DEFAULT_COMPANY_PROFILE.supportPhone).trim(),
      hours: String(payload.hours || DEFAULT_COMPANY_PROFILE.hours).trim(),
      products: sanitizeProducts(payload.products),
      welcomeMessage: String(payload.welcomeMessage || DEFAULT_COMPANY_PROFILE.welcomeMessage).trim(),
      lobbyInstructions: String(
        payload.lobbyInstructions || DEFAULT_COMPANY_PROFILE.lobbyInstructions,
      ).trim(),
    },
    create: {
      ...DEFAULT_COMPANY_PROFILE,
      name: String(payload.name || DEFAULT_COMPANY_PROFILE.name).trim(),
      supportEmail: String(payload.supportEmail || DEFAULT_COMPANY_PROFILE.supportEmail)
        .trim()
        .toLowerCase(),
      supportPhone: String(payload.supportPhone || DEFAULT_COMPANY_PROFILE.supportPhone).trim(),
      hours: String(payload.hours || DEFAULT_COMPANY_PROFILE.hours).trim(),
      products: sanitizeProducts(payload.products),
      welcomeMessage: String(payload.welcomeMessage || DEFAULT_COMPANY_PROFILE.welcomeMessage).trim(),
      lobbyInstructions: String(
        payload.lobbyInstructions || DEFAULT_COMPANY_PROFILE.lobbyInstructions,
      ).trim(),
    },
  });

  return mapCompanyProfile(nextProfile);
}

module.exports = {
  DEFAULT_COMPANY_PROFILE,
  ensureCompanyProfile,
  getCompanyProfile,
  updateCompanyProfile,
};
