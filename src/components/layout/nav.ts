import { copy } from "@/data/site";
import { paths } from "@/lib/paths";

/** The main pages, in this order in the header, the phone menu and the footer. */
export function mainNav(): { label: string; to: string }[] {
  return [
    { label: copy.nav.services, to: paths.services },
    { label: copy.nav.builder, to: paths.builder },
    { label: copy.nav.projects, to: paths.projects },
    { label: copy.nav.blog, to: paths.blog },
    { label: copy.nav.about, to: paths.about },
    { label: copy.nav.careers, to: paths.careers },
    { label: copy.nav.contact, to: paths.contact },
  ];
}
