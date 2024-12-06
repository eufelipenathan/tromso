export const FORM_MODES = {
  STANDALONE: "standalone",
  COMPANY_NEW: "company-new", 
  COMPANY_EDIT: "company-edit",
  DEAL: "deal"
} as const;

export type FormMode = typeof FORM_MODES[keyof typeof FORM_MODES];

export function getCompanyFieldVisibility(mode: FormMode): "search" | "hidden" | "readonly" {
  switch (mode) {
    case FORM_MODES.STANDALONE:
      return "search";
    case FORM_MODES.COMPANY_NEW:
      return "hidden";
    case FORM_MODES.COMPANY_EDIT:
    case FORM_MODES.DEAL:
      return "readonly";
    default:
      return "search";
  }
}