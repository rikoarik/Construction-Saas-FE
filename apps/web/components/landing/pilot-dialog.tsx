"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, ChevronDown, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface PilotDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PilotDialog({ isOpen, onClose }: PilotDialogProps) {
  const t = useTranslations("landing.dialog");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [projectTypeOpen, setProjectTypeOpen] = useState(false);
  const [activeOption, setActiveOption] = useState(0);
  const selectRef = useRef<HTMLButtonElement>(null);
  const projectTypes = ["building", "infra", "industrial"] as const;
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    projectType: "building",
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    setSubmitted(false);
    setProjectTypeOpen(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is explicitly a local demonstration, not a network submission.
    setSubmitted(true);
  };

  return (
    <dialog
      ref={dialogRef}
      className="pilot-dialog"
      onClose={handleClose}
      aria-labelledby="pilot-dialog-title"
      aria-describedby="pilot-dialog-desc"
    >
      <div className="pilot-dialog__inner">
        <header className="pilot-dialog__header">
          <div>
            <h2 id="pilot-dialog-title" className="pilot-dialog__title">
              {t("title")}
            </h2>
            <p id="pilot-dialog-desc" className="pilot-dialog__description">
              {t("description")}
            </p>
          </div>
          <button
            type="button"
            className="pilot-dialog__close"
            onClick={handleClose}
            aria-label={t("close")}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {submitted ? (
          <div className="pilot-dialog__success" role="status">
            <CheckCircle2 size={32} className="pilot-dialog__success-icon" aria-hidden="true" />
            <p>{t("successMessage")}</p>
            <button
              type="button"
              className="button button--primary"
              onClick={handleClose}
            >
              {t("close")}
            </button>
          </div>
        ) : (
          <form className="pilot-dialog__form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="company-name">{t("companyNameLabel")}</label>
              <input
                id="company-name"
                type="text"
                required
                placeholder={t("companyNamePlaceholder")}
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-name">{t("contactNameLabel")}</label>
              <input
                id="contact-name"
                type="text"
                required
                placeholder={t("contactNamePlaceholder")}
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="work-email">{t("emailLabel")}</label>
              <input
                id="work-email"
                type="email"
                required
                placeholder={t("emailPlaceholder")}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="project-type">{t("projectTypeLabel")}</label>
              <input type="hidden" name="projectType" value={formData.projectType} />
              <div className="pilot-select" onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setProjectTypeOpen(false);
              }}>
                <button
                  ref={selectRef}
                  id="project-type"
                  type="button"
                  className="pilot-select__trigger"
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-expanded={projectTypeOpen}
                  aria-controls="project-type-options"
                  aria-activedescendant={projectTypeOpen ? `project-type-${projectTypes[activeOption]}` : undefined}
                  onClick={() => {
                    setActiveOption(projectTypes.indexOf(formData.projectType as typeof projectTypes[number]));
                    setProjectTypeOpen((open) => !open);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape" && projectTypeOpen) {
                      event.preventDefault();
                      event.stopPropagation();
                      setProjectTypeOpen(false);
                    }
                    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                      event.preventDefault();
                      setProjectTypeOpen(true);
                      const direction = event.key === "ArrowDown" ? 1 : -1;
                      setActiveOption(event.key === "Home" ? 0 : event.key === "End" ? 2 : projectTypeOpen ? (activeOption + direction + 3) % 3 : projectTypes.indexOf(formData.projectType as typeof projectTypes[number]));
                    }
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (projectTypeOpen) setFormData({ ...formData, projectType: projectTypes[activeOption] });
                      setProjectTypeOpen(!projectTypeOpen);
                    }
                  }}
                >
                  <span>{t(`projectType${formData.projectType[0].toUpperCase()}${formData.projectType.slice(1)}`)}</span>
                  <ChevronDown size={17} aria-hidden="true" />
                </button>
                {projectTypeOpen && (
                  <div id="project-type-options" className="pilot-select__options" role="listbox" aria-labelledby="project-type">
                    {projectTypes.map((value, index) => (
                      <button
                        id={`project-type-${value}`}
                        key={value}
                        type="button"
                        className={`pilot-select__option${activeOption === index ? " is-active" : ""}`}
                        role="option"
                        tabIndex={-1}
                        aria-selected={formData.projectType === value}
                        onClick={() => {
                          setFormData({ ...formData, projectType: value });
                          setProjectTypeOpen(false);
                          selectRef.current?.focus();
                        }}
                      >
                        <span>{t(`projectType${value[0].toUpperCase()}${value.slice(1)}`)}</span>
                        {formData.projectType === value && <Check size={16} aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pilot-dialog__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={handleClose}
              >
                {t("close")}
              </button>
              <button
                type="submit"
                className="button button--primary"
              >
                {t("submitButton")}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
