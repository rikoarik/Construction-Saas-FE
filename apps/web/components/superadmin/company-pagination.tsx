"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Dropdown } from "@/components/ui/primitives";
import { useCompanyCopy } from "./locale";
import { companyPageNumbers, companyPageRange, maxCompanyOffset, pageSizes } from "./company-page-utils";

export function CompanyPagination({ total, count, hasMore, offset, limit, onPage, onLimit }: {
  total: number;
  count: number;
  hasMore: boolean;
  offset: number;
  limit: number;
  onPage: (offset: number) => void;
  onLimit: (limit: number) => void;
}) {
  const c = useCompanyCopy();
  const { start, end } = companyPageRange(total, limit, offset, count);
  const page = Math.floor(offset / limit) + 1;
  const pages = companyPageNumbers(total, limit, offset);
  const canGoNext = hasMore && offset + limit <= maxCompanyOffset;
  return <footer className="sa-company-pagination">
    <p>{c.showingRows.replace("{start}", String(start)).replace("{end}", String(end)).replace("{total}", String(total))}</p>
    <div className="sa-company-pagination__controls">
      <div className="sa-company-pagination__size"><span>{c.rowsPerPage}:</span><Dropdown label={c.rowsPerPage} value={String(limit)} options={pageSizes.map((size) => ({ value: String(size), label: `${size} ${c.rows}` }))} onChange={(value) => onLimit(Number(value))} align="end" /></div>
      <nav className="sa-company-pagination__pages" aria-label={c.page}>
        <Button className="sa-company-pagination__arrow" aria-label={c.previous} disabled={offset === 0} onClick={() => onPage(offset - limit)}><ChevronLeft size={18} aria-hidden="true" /></Button>
        {pages.map((number) => <Button key={number} className="sa-company-pagination__number" aria-label={c.goToPage.replace("{page}", String(number))} aria-current={number === page ? "page" : undefined} disabled={number > page && !canGoNext} onClick={() => onPage((number - 1) * limit)}>{number}</Button>)}
        <Button className="sa-company-pagination__arrow" aria-label={c.next} disabled={!canGoNext} onClick={() => onPage(offset + limit)}><ChevronRight size={18} aria-hidden="true" /></Button>
      </nav>
    </div>
  </footer>;
}
