export const pageSizes = [10, 20, 50, 100] as const;
export const maxCompanyOffset = 10000;

export function companyPageNumbers(total: number, limit: number, offset: number) {
  const current = Math.floor(offset / limit) + 1;
  const last = Math.min(Math.max(1, Math.ceil(total / limit)), Math.floor(maxCompanyOffset / limit) + 1);
  const start = Math.max(1, Math.min(current - 1, last - 2));
  const end = Math.min(last, start + 2);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function companyPageRange(total: number, limit: number, offset: number, count: number) {
  return { start: count ? offset + 1 : 0, end: count ? offset + count : 0, total };
}
