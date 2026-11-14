"use client";

import { useEffect, RefObject } from "react";

/**
 * Modern Web Guidance (`validate-input-after-interaction` & `accessible-error-announcement`):
 *
 * Bridges CSS `:user-invalid` with programmatic `aria-invalid` and dynamic `aria-describedby`
 * error message linking so screen readers never announce "invalid entry" prematurely on page load
 * before the user has interacted with a required field.
 */
export function useAriaFormValidation(formRef: RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const dirtyState = new WeakMap<Element, { hasInteracted: boolean; hasBlurred: boolean }>();
    const supportsUserInvalid =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("selector(:user-invalid)");

    const linkError = (el: HTMLElement, shown: boolean) => {
      const errorId = el.dataset.error;
      if (!errorId) return;
      const ids = (el.getAttribute("aria-describedby") || "")
        .split(/\s+/)
        .filter((id) => id && id !== errorId);
      if (shown) ids.push(errorId);
      if (ids.length) el.setAttribute("aria-describedby", ids.join(" "));
      else el.removeAttribute("aria-describedby");
    };

    const syncAria = (target: EventTarget | null, eventType?: string) => {
      if (!(target instanceof HTMLElement)) return;
      if (!target.matches("input, select, textarea")) return;

      const inputEl = target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

      if (!supportsUserInvalid) {
        const current = dirtyState.get(inputEl) || { hasInteracted: false, hasBlurred: false };
        if (eventType === "invalid") {
          current.hasInteracted = true;
          current.hasBlurred = true;
        } else if (eventType === "input" || eventType === "change") {
          current.hasInteracted = true;
        } else if (eventType === "blur") {
          current.hasBlurred = true;
        }
        dirtyState.set(inputEl, current);

        if (current.hasInteracted && current.hasBlurred) {
          const valid = inputEl.validity.valid;
          inputEl.classList.toggle("user-invalid-fallback", !valid);
          inputEl.classList.toggle("user-valid-fallback", valid);
          inputEl.setAttribute("aria-invalid", valid ? "false" : "true");
          linkError(inputEl, !valid);
        }
        return;
      }

      const invalid = inputEl.matches(":user-invalid");
      if (invalid) {
        inputEl.setAttribute("aria-invalid", "true");
        linkError(inputEl, true);
      } else {
        inputEl.setAttribute("aria-invalid", "false");
        linkError(inputEl, false);
      }
    };

    // Start every field at aria-invalid="false" so Firefox/Safari don't announce empty required fields as invalid on load
    form.querySelectorAll("input, select, textarea").forEach((el) => {
      el.setAttribute("aria-invalid", "false");
    });

    const onBlur = (e: Event) => syncAria(e.target, "blur");
    const onInput = (e: Event) => syncAria(e.target, "input");
    const onChange = (e: Event) => syncAria(e.target, "change");
    const onInvalid = (e: Event) => syncAria(e.target, "invalid");

    form.addEventListener("blur", onBlur, true);
    form.addEventListener("input", onInput);
    form.addEventListener("change", onChange, true);
    form.addEventListener("invalid", onInvalid, true);

    return () => {
      form.removeEventListener("blur", onBlur, true);
      form.removeEventListener("input", onInput);
      form.removeEventListener("change", onChange, true);
      form.removeEventListener("invalid", onInvalid, true);
    };
  }, [formRef]);
}
