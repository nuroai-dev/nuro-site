import Nav from "@/components/nav/nav";
import Hero from "@/components/hero/hero";
import Problem from "@/components/problem/problem";
import BusinessCase from "@/components/business-case/business-case";
import Solution from "@/components/solution/solution";
import AudiencesPoster from "@/components/audiences-poster/audiences-poster";
import Waitlist from "@/components/waitlist/waitlist";
import Footer from "@/components/footer/footer";

/**
 * Full-page assembly (SPEC §6 N-11): sections composed in spec order.
 * Anchor ids (#problem, #business-case, #features, #waitlist) live inside
 * each section component; the fixed-nav scroll offset (scroll-margin-top)
 * is defined once in globals.css.
 */
export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <BusinessCase />
        <Solution />
        <AudiencesPoster />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
