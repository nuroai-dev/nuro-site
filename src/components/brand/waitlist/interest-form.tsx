import type * as React from "react";
import { ArrowLeft, ArrowRight, Check } from "@/components/site/icons";
import { useTranslation } from "@/components/site/language";
import { WAITLIST_AGES, WAITLIST_ROLES } from "@/lib/waitlist/client";
import { useMotionStill } from "@/components/system/grammar/use-motion-still";
import type { WaitlistFlow } from "./use-waitlist";

export function InterestForm({ flow }: { flow: WaitlistFlow }) {
  const { t } = useTranslation();
  const still = useMotionStill();
  const isRoles = flow.step === "roles";
  const selected = isRoles ? flow.draft.roles.length : flow.draft.student_ages.length;
  const next = isRoles ? "ages" : "done";

  return <form className="landing-interests" data-still={still} onSubmit={(event) => {
    event.preventDefault(); void flow.save(next);
  }}>
    <p id="landing-optional" role="status" className="landing-step-meta landing-step-reveal">
      {t(selected ? "landingWaitlist.selected" : "landingWaitlist.optional", { count: selected })}
    </p>
    <fieldset disabled={flow.busy} aria-describedby="landing-optional">
      <legend className="sr-only">{t(isRoles ? "landingWaitlist.rolesLabel" : "landingWaitlist.agesLabel")}</legend>
      <div className="landing-chips">
        {isRoles ? WAITLIST_ROLES.map((role, index) => <label key={role} className="landing-chip landing-step-reveal" style={delay(60 + index * 45)}>
          <input type="checkbox" name="roles" value={role} checked={flow.draft.roles.includes(role)} onChange={() => flow.toggleRole(role)} />
          <span className="landing-chip-check" aria-hidden="true"><Check size={14} strokeWidth={2} /></span>
          <span>{t(`landingWaitlist.roles.${role}`)}</span>
        </label>) : WAITLIST_AGES.map((age, index) => <label key={age} className="landing-chip landing-step-reveal" style={delay(60 + index * 45)}>
          <input type="checkbox" name="student_ages" value={age} checked={flow.draft.student_ages.includes(age)} onChange={() => flow.toggleAge(age)} />
          <span className="landing-chip-check" aria-hidden="true"><Check size={14} strokeWidth={2} /></span>
          <span>{t(`landingWaitlist.ages.${age}`)}</span>
        </label>)}
      </div>
    </fieldset>
    {flow.error && <p id="landing-waitlist-error" className="landing-error landing-step-reveal" role="alert">{t("landingWaitlist.saveError")}</p>}
    <div className="landing-choice-footer landing-step-reveal" style={delay(310)}>
      {!isRoles && <button className="landing-back" type="button" onClick={flow.back} disabled={flow.busy}
        aria-label={t("landingWaitlist.back")} title={t("landingWaitlist.back")}>
        <ArrowLeft className="site-arrow" data-direction="left" size={18} aria-hidden="true" />
      </button>}
      {/* Nothing chosen yet: a quiet outlined Skip; otherwise a solid Continue. */}
      <button className="landing-primary" data-variant={selected ? undefined : "quiet"} type="submit" disabled={flow.busy}>
        {selected ? <>
          {t(flow.busy ? "landingWaitlist.joining" : "landingWaitlist.continue")}
          <ArrowRight className="site-arrow" data-direction="right" size={16} aria-hidden="true" />
        </> : t(flow.busy ? "landingWaitlist.joining" : "landingWaitlist.skip")}
      </button>
    </div>
  </form>;
}

function delay(ms: number) { return { "--reveal-delay": `${ms}ms` } as React.CSSProperties; }
