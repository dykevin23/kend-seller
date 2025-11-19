import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("common/pages/home-page.tsx"),

  /* 상품 */
  ...prefix("products", [
    // 상품등록 화면
    route("/submit", "features/products/pages/submit-product-page.tsx"),
  ]),
] satisfies RouteConfig;
