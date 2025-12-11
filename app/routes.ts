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
    // 카테고리
    ...prefix("category", [
      index("features/products/pages/categories-page.tsx"),
    ]),
  ]),

  /* 판매자정보 */
  ...prefix("seller", [
    route("/address", "features/seller/pages/address-list-page.tsx"),
  ]),

  /* 시스템관리 */
  ...prefix("system", [
    // 서비스 관리
    ...prefix("services", [
      index("features/system/pages/services-page.tsx"),
      route("/submit", "features/system/pages/submit-service-page.tsx"),
    ]),
    // 옵션 관리
    ...prefix("options", [
      index("features/system/pages/options-page.tsx"),
      route("/:optionId", "features/system/pages/option-page.tsx"),
      route("/submit", "features/system/pages/submit-option-page.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
