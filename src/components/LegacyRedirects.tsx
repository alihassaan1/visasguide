import { Navigate, useParams, useLocation } from "react-router-dom";

/** /countries/:country/visa-free  → /countries/:country (country guide has visa-free list) */
export const RedirectVisaFree = () => {
  const { countrySlug } = useParams();
  return <Navigate to={`/countries/${countrySlug}`} replace />;
};

/** /countries/:country/:city  →  /:country/:city (current city URL convention) */
export const RedirectCity = () => {
  const { countrySlug, citySlug } = useParams();
  return <Navigate to={`/${countrySlug}/${citySlug}`} replace />;
};

/** /YYYY/MM/DD/... legacy WordPress date archives → /blog */
export const RedirectDateArchive = () => {
  const { pathname } = useLocation();
  if (/^\/\d{4}\/\d{1,2}(\/\d{1,2})?\/?/.test(pathname)) {
    return <Navigate to="/blog" replace />;
  }
  return null;
};
