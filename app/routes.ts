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
    ...prefix("information", [
      route(
        "/submit",
        "features/seller/pages/submit-seller-information-page.tsx"
      ),
    ]),
    ...prefix("address", [
      index("features/seller/pages/address-list-page.tsx"),
      route("/post", "features/seller/pages/post-address-page.tsx"),
    ]),
  ]),

  /* 시스템관리 */
  ...prefix("system", [
    // 도메인 관리
    ...prefix("domains", [
      index("features/system/pages/domains-page.tsx"),
      route("/submit", "features/system/pages/submit-domain-page.tsx"),
    ]),
    // 옵션 관리
    ...prefix("options", [
      index("features/system/pages/options-page.tsx"),
      route("/:optionId", "features/system/pages/option-page.tsx"),
      route("/submit", "features/system/pages/submit-option-page.tsx"),
    ]),
    // 공통코드 관리
    ...prefix("commonCodes", [
      index("features/system/pages/common-code-groups-page.tsx"),
      ...prefix("/group", [
        ...prefix("/:groupId", [
          index("features/system/pages/common-code-group-page.tsx"),
          route("/submit", "features/system/pages/submit-common-code-page.tsx"),
          route("/code/:codeId", "features/system/pages/common-code-page.tsx"),
        ]),
        route(
          "/submit",
          "features/system/pages/submit-common-code-group-page.tsx"
        ),
      ]),
    ]),
  ]),

  // Auth
  ...prefix("auth", [
    route("/login", "features/auth/pages/login-page.tsx"),
    route("/join", "features/auth/pages/join-page.tsx"),
  ]),
] satisfies RouteConfig;
