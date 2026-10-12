// Prerender: plain imports, so nothing suspends and every page is written as finished HTML.
import type { Pages } from "@/App";
import About from "./About";
import AreaPage from "./AreaPage";
import BlogIndex from "./BlogIndex";
import BlogPost from "./BlogPost";
import Builder from "./Builder";
import Cart from "./Cart";
import Careers from "./Careers";
import Contact from "./Contact";
import Home from "./Home";
import LegalPage from "./LegalPage";
import NotFound from "./NotFound";
import Offers from "./Offers";
import Projects from "./Projects";
import ServicePage from "./ServicePage";
import ServicesIndex from "./ServicesIndex";

export const eagerPages: Pages = {
  Home,
  ServicesIndex,
  ServicePage,
  Offers,
  Projects,
  Builder,
  Cart,
  AreaPage,
  BlogIndex,
  BlogPost,
  Careers,
  About,
  Contact,
  LegalPage,
  NotFound,
};
