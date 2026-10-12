// Browser: each page is its own chunk, so phones only download what they open.
import { lazy } from "react";
import type { Pages } from "@/App";

export const lazyPages: Pages = {
  Home: lazy(() => import("./Home")),
  ServicesIndex: lazy(() => import("./ServicesIndex")),
  ServicePage: lazy(() => import("./ServicePage")),
  Offers: lazy(() => import("./Offers")),
  Projects: lazy(() => import("./Projects")),
  Builder: lazy(() => import("./Builder")),
  Cart: lazy(() => import("./Cart")),
  AreaPage: lazy(() => import("./AreaPage")),
  BlogIndex: lazy(() => import("./BlogIndex")),
  BlogPost: lazy(() => import("./BlogPost")),
  Careers: lazy(() => import("./Careers")),
  About: lazy(() => import("./About")),
  Contact: lazy(() => import("./Contact")),
  LegalPage: lazy(() => import("./LegalPage")),
  NotFound: lazy(() => import("./NotFound")),
};
