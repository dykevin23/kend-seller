import { Form, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  Truck,
  Store,
  Landmark,
  ShieldCheck,
  Layers,
  MessagesSquare,
  Megaphone,
  LogOut,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useRootData } from "~/hooks/useRootData";
import type { AdminCounts } from "~/types/root";
import type { ComponentType } from "react";

type Role = "seller" | "administrator";
type BadgeKey = keyof AdminCounts;

interface MenuItem {
  name: string;
  to: string;
  badgeKey?: BadgeKey;
}

interface Menu {
  name: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  items: MenuItem[];
  roles?: Role[]; // 접근 가능한 role 목록 (없으면 모두 접근 가능)
}

const menus: Menu[] = [
  {
    name: "상품관리",
    to: "/products",
    icon: Package,
    roles: ["seller"],
    items: [
      { name: "상품 목록", to: "/products" },
      { name: "재고 관리", to: "/products/stocks-keeping" },
      { name: "상품 등록", to: "/products/submit" },
      { name: "리뷰 관리", to: "/products/reviews" },
    ],
  },
  {
    name: "주문·배송관리",
    to: "/orders",
    icon: Truck,
    roles: ["seller"],
    items: [
      { name: "주문 목록", to: "/orders/list" },
      { name: "반품 관리", to: "/orders/returns" },
      { name: "문의 관리", to: "/orders/inquiries" },
    ],
  },
  {
    name: "정산관리",
    to: "/seller/settlements",
    icon: Landmark,
    roles: ["seller"],
    items: [{ name: "정산 내역", to: "/seller/settlements" }],
  },
  {
    name: "판매자정보",
    to: "/seller",
    icon: Store,
    roles: ["seller"],
    items: [
      { name: "판매자 프로필", to: "/seller/information/submit" },
      { name: "배송지·반품지 관리", to: "/seller/address" },
      { name: "스토어 배너 관리", to: "/seller/banners" },
    ],
  },
  {
    name: "판매자 운영",
    to: "/system/sellers",
    icon: ShieldCheck,
    roles: ["administrator"],
    items: [
      { name: "판매자 승인 관리", to: "/system/sellers", badgeKey: "pendingSellers" },
      { name: "정산 관리", to: "/system/settlements", badgeKey: "pendingSettlements" },
    ],
  },
  {
    name: "카탈로그 설정",
    to: "/system/domains",
    icon: Layers,
    roles: ["administrator"],
    items: [
      { name: "도메인 관리", to: "/system/domains" },
      { name: "카테고리 관리", to: "/system/categories" },
      { name: "공통코드 관리", to: "/system/commonCodes" },
      { name: "시스템 옵션 관리", to: "/system/systemOptions" },
    ],
  },
  {
    name: "플랫폼",
    to: "/system/inquiries",
    icon: MessagesSquare,
    roles: ["administrator"],
    items: [
      { name: "일반 문의 관리", to: "/system/inquiries", badgeKey: "unansweredInquiries" },
      { name: "공지사항 관리", to: "/system/notices" },
      { name: "플랫폼 설정", to: "/system/settings" },
    ],
  },
];

export default function Sidebar() {
  const { profile, seller, adminCounts } = useRootData();
  const userRole = profile?.role as Role | undefined;
  const location = useLocation();

  const filteredMenus = menus.filter((menu) => {
    if (!menu.roles) return true;
    if (!userRole) return false;
    return menu.roles.includes(userRole);
  });

  // 여러 메뉴가 동시에 prefix로 매칭될 수 있어(예: "/products"가 "/products/reviews"의
  // prefix이기도 함) 가장 구체적으로(가장 길게) 일치하는 항목 하나만 active로 표시한다.
  const allPaths = [
    "/",
    ...(userRole === "seller" ? ["/seller/notices"] : []),
    ...filteredMenus.flatMap((menu) => menu.items.map((item) => item.to)),
  ];
  const matches = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname === to || location.pathname.startsWith(`${to}/`);
  const bestMatch = allPaths
    .filter(matches)
    .sort((a, b) => b.length - a.length)[0];
  const isActive = (to: string) => to === bestMatch;

  const displayName =
    userRole === "administrator" ? "관리자" : (seller?.name ?? "판매자");

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            K
          </span>
          <span className="text-[15px] font-bold tracking-tight text-sidebar-foreground">
            kend seller
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors",
            isActive("/")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/60"
          )}
        >
          <LayoutDashboard className="size-4" />
          대시보드
        </Link>

        {userRole === "seller" && (
          <Link
            to="/seller/notices"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors",
              isActive("/seller/notices")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60"
            )}
          >
            <Megaphone className="size-4" />
            공지사항
          </Link>
        )}

        {filteredMenus.map((menu) => {
          const Icon = menu.icon;
          return (
            <div key={menu.name}>
              <div className="flex items-center gap-2 px-3 pb-1.5 text-[12px] font-bold uppercase tracking-wide text-sidebar-foreground/40">
                <Icon className="size-3.5" />
                {menu.name}
              </div>
              <div className="space-y-0.5">
                {menu.items.map((item) => {
                  const active = isActive(item.to);
                  const badgeCount = item.badgeKey ? adminCounts?.[item.badgeKey] : undefined;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-[13.5px] transition-colors",
                        active
                          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      )}
                    >
                      {item.name}
                      {!!badgeCount && (
                        <span className="rounded-full border border-warning-border bg-warning-background px-1.5 py-px text-[10.5px] font-bold text-warning">
                          {badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5">
          <span className="truncate text-[13px] font-medium text-sidebar-foreground">
            {displayName} 님
          </span>
          <Form method="post" action="/auth/logout">
            <button
              type="submit"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            >
              <LogOut className="size-3.5" />
              로그아웃
            </button>
          </Form>
        </div>
      </div>
    </aside>
  );
}
