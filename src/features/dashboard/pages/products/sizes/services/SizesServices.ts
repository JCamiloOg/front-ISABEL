import api from "../../../../../../app/api/api";

export interface SizeRecord {
  id: number;
  sizeNumber: string;
  gender: string;
  internationalSize: string;
  variantsCount: number;
}

export interface CreateSizeDTO {
  sizeNumber: string;
  gender: string;
  internationalSize: string;
}

export interface UpdateSizeDTO {
  sizeNumber?: string;
  gender?: string;
  internationalSize?: string;
}

const KIDS_US_SIZE_MAP: Record<number, string> = {
  16: "US 1C",
  17: "US 2C",
  18: "US 3C",
  19: "US 4C",
  20: "US 5C",
  21: "US 5.5C",
  22: "US 6C",
  23: "US 7C",
  24: "US 8C",
  25: "US 8.5C",
  26: "US 9.5C",
  27: "US 10C",
  28: "US 11C",
  29: "US 11.5C",
  30: "US 12.5C",
  31: "US 13C",
  32: "US 1Y",
};

const MALE_US_SIZE_MAP: Record<number, string> = {
  33: "US 1.5Y",
  34: "US 2.5Y",
  35: "US 3.5Y",
  36: "US 4Y",
  37: "US 5",
  38: "US 6",
  39: "US 6.5",
  40: "US 7",
  41: "US 8",
  42: "US 8.5",
  43: "US 9.5",
  44: "US 10.5",
  45: "US 11",
  46: "US 12",
  47: "US 13",
};

const FEMALE_US_SIZE_MAP: Record<number, string> = {
  33: "US 3.5",
  34: "US 4",
  35: "US 5",
  36: "US 6",
  37: "US 6.5",
  38: "US 7.5",
  39: "US 8.5",
  40: "US 9",
  41: "US 10",
  42: "US 10.5",
  43: "US 11.5",
  44: "US 12",
  45: "US 13",
};

/**
 * Convierte cualquier talla nacional (infantil, juvenil o adulto) a su equivalencia internacional (US) según el género.
 */
export function getInternationalSize(sizeNumber: string, gender: string): string {
  const trimmed = sizeNumber.trim();
  if (!trimmed) return "";

  const normalizedInput = trimmed.replace(",", ".");
  const parsed = Number(normalizedInput);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return trimmed.toUpperCase().slice(0, 10);
  }

  const roundedInt = Math.floor(parsed);
  if (KIDS_US_SIZE_MAP[roundedInt]) {
    return KIDS_US_SIZE_MAP[roundedInt];
  }

  const lowerGender = gender.trim().toLowerCase();
  const isFemale = lowerGender === "femenino" || lowerGender === "mujer";
  const table = isFemale ? FEMALE_US_SIZE_MAP : MALE_US_SIZE_MAP;

  if (table[parsed]) {
    return table[parsed];
  }

  if (parsed < 16) {
    return `US ${parsed}`.slice(0, 10);
  }

  const offset = isFemale ? 30.5 : 33;
  const computed = Math.round((parsed - offset) * 2) / 2;
  if (computed > 0) {
    return `US ${computed}`.slice(0, 10);
  }

  return `EU ${parsed}`.slice(0, 10);
}

export async function getSizes(params?: { search?: string; gender?: string }) {
  return await api.get<{
    message: string;
    nextId: number;
    sizes: SizeRecord[];
  }>("/products/sizes", {
    params:
      params && (params.search?.trim() || params.gender?.trim())
        ? {
            ...(params.search?.trim() ? { search: params.search.trim() } : {}),
            ...(params.gender?.trim() ? { gender: params.gender.trim() } : {}),
          }
        : undefined,
  });
}

export async function getNextSizeId() {
  return await api.get<{
    message: string;
    nextId: number;
  }>("/products/sizes/next-id");
}

export async function getSizeById(id: number) {
  return await api.get<{
    message: string;
    size: SizeRecord;
  }>(`/products/sizes/${id}`);
}

export async function createSize(data: CreateSizeDTO) {
  return await api.post<{
    message: string;
    size: Omit<SizeRecord, "variantsCount">;
  }>("/products/sizes", data);
}

export async function updateSize(id: number, data: UpdateSizeDTO) {
  return await api.put<{
    message: string;
    size: Omit<SizeRecord, "variantsCount">;
  }>(`/products/sizes/${id}`, data);
}

export async function deleteSize(id: number) {
  return await api.delete<{
    message: string;
  }>(`/products/sizes/${id}`);
}
