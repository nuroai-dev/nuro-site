import { Check, Pencil } from "@/components/site/icons";
import { useTranslation } from "@/components/site/language";
import type { WaitlistFlow } from "./use-waitlist";

export function WaitlistConfirmation({ flow }: { flow: WaitlistFlow }) {
  const { t } = useTranslation();
  return <div className="landing-confirmation">
    <div className="landing-receipt landing-step-reveal">
      <span className="landing-receipt-check" aria-hidden="true"><Check size={20} strokeWidth={1.8} /></span>
      <div>
        <p>{t("landingWaitlist.registeredEmail")}</p>
        <strong>{flow.entry?.email}</strong>
      </div>
    </div>
    <div className="landing-done-actions landing-step-reveal">
      {flow.entry?.editToken && <button className="landing-edit" type="button" onClick={flow.back}>
        <Pencil size={14} aria-hidden="true" />{t("landingWaitlist.edit")}
      </button>}
      <button className="landing-text-button" type="button" onClick={flow.reset}>{t("landingWaitlist.anotherEmail")}</button>
    </div>
  </div>;
}
