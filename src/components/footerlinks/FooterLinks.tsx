import { Fragment } from 'react';
import styles from './FooterLinks.module.scss';

interface FooterLink {
  label: string;
  url: string;
  target?: string;
}
interface FooterLinksProps {
  links: FooterLink[];
}

const FooterLinks = (props: FooterLinksProps) => {
  return (
    <nav className={styles.links} aria-label="Lidhjet e faqes">
      {props?.links?.map((link, idx) => (
        <Fragment key={`link-${idx}`}>
          {idx !== 0 && (
            <span className={styles.separator} aria-hidden="true">
              ·
            </span>
          )}
          <a href={link.url} target={link.target}>
            {link.label}
          </a>
        </Fragment>
      ))}
    </nav>
  );
};

export default FooterLinks;
