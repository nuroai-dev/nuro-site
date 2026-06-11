import Image from "next/image";

import Reveal from "@/components/motion/reveal";
import { InstagramIcon, LinkedInIcon } from "@/components/nav/social-icons";
import styles from "./footer.module.css";

/**
 * Footer — SPEC §4 Footer.
 *
 * Server component on the dark `--night` surface: pastel logo + "Nuro"
 * wordmark, Instagram + LinkedIn icon links (same URLs as the nav), and the
 * verbatim copyright line. Both rows enter via the shared <Reveal> blur-up
 * with a small stagger, per the "reveal applies" acceptance criterion.
 */

const INSTAGRAM_URL = "https://www.instagram.com/nuroai.dev/";
const LINKEDIN_URL = "https://www.linkedin.com/company/nuroaidev/";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Reveal className={styles.row}>
          <div className={styles.brand}>
            <Image
              src="/brand/logo-footer.svg"
              alt="Nuro"
              width={125}
              height={36}
              className={styles.logo}
            />
          </div>

          <div className={styles.socials}>
            <a
              className={styles.social}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nuro on Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              className={styles.social}
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nuro on LinkedIn"
            >
              <LinkedInIcon />
            </a>
          </div>
        </Reveal>

        <Reveal as="p" delay={0.08} className={styles.copyright}>
          © 2026 Nuro. All rights reserved.
        </Reveal>
      </div>
    </footer>
  );
}
