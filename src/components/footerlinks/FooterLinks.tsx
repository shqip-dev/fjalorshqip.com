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
    <>
      {props.links.map((link) =>
        // prettier-ignore
        <> [ <a href={link.url} target={link.target}>{link.label}</a> ] </>
      )}
    </>
  );
};

export default FooterLinks;
