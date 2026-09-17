import { Link } from "react-router";
import {
  Package,
  Truck,
  Undo2,
  MessageCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Landmark,
  Layers,
  Megaphone,
} from "lucide-react";
import Content from "../components/content";
import Title from "../components/title";
import Card from "../components/card";
import {
  SectionLabel,
  KpiTile,
  OpsHead,
  StatItem,
  SalesTrendCard,
} from "../components/stat-widgets";
import { formatNumber } from "~/common/utils/format";
import type { Route } from "./+types/home-page";
import { makeSSRClient } from "~/supa-client";
import { getUserById } from "~/features/users/queries";
import {
  getSellerInfo,
  getSellerStatusCounts,
  getSellerSignupCountThisMonth,
} from "~/features/seller/queries";
import {
  getNewOrderCount,
  getSellerOrderStatusCounts,
  getSellerReturnCancelCounts,
  getSellerSalesOverview,
  getSellerTopProducts,
  getPlatformSalesTrend,
} from "~/features/orders/queries";
import {
  getSellerInquiryStats,
  getUnansweredGeneralInquiryCount,
} from "~/features/inquiries/queries";
import { getSellerReviewStats } from "~/features/reviews/queries";
import {
  getSellerSettlementSummary,
  getAdminSettlementSummary,
} from "~/features/settlements/queries";
import { getPlatformCatalogStats } from "~/features/products/queries";
import { getVisibleNoticesForSeller } from "~/features/system/queries";

const TREND_DAYS = 14;

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const seller = await getSellerInfo(client);

  if (seller) {
    const [
      newOrderCount,
      orderStatusCounts,
      returnCancelCounts,
      salesOverview,
      topProducts,
      inquiryStats,
      reviewStats,
      settlementSummary,
      notices,
    ] = await Promise.all([
      getNewOrderCount(client, seller.id),
      getSellerOrderStatusCounts(client, seller.id, { days: TREND_DAYS }),
      getSellerReturnCancelCounts(client, seller.id, { days: 30 }),
      getSellerSalesOverview(client, seller.id, { trendDays: TREND_DAYS }),
      getSellerTopProducts(client, seller.id, { days: 30, limit: 5 }),
      getSellerInquiryStats(client, seller.id),
      getSellerReviewStats(client, seller.id),
      getSellerSettlementSummary(client, seller.id),
      getVisibleNoticesForSeller(client, { limit: 3 }),
    ]);

    return {
      view: "seller" as const,
      seller,
      newOrderCount,
      orderStatusCounts,
      returnCancelCounts,
      salesOverview,
      topProducts,
      inquiryStats,
      reviewStats,
      settlementSummary,
      notices,
    };
  }

  const {
    data: { user },
  } = await client.auth.getUser();
  const profile = user ? await getUserById(client, { id: user.id }) : null;

  if (profile?.role === "administrator") {
    const [
      sellerStatusCounts,
      newSellerCount,
      settlementSummary,
      unansweredInquiries,
      platformTrend,
      catalogStats,
    ] = await Promise.all([
      getSellerStatusCounts(client),
      getSellerSignupCountThisMonth(client),
      getAdminSettlementSummary(client),
      getUnansweredGeneralInquiryCount(client),
      getPlatformSalesTrend(client, { trendDays: TREND_DAYS }),
      getPlatformCatalogStats(client),
    ]);

    return {
      view: "admin" as const,
      sellerStatusCounts,
      newSellerCount,
      settlementSummary,
      unansweredInquiries,
      platformTrend,
      catalogStats,
    };
  }

  return { view: "empty" as const };
};

export default function HomePage({ loaderData }: Route.ComponentProps) {
  if (loaderData.view === "admin") {
    return <AdminDashboard {...loaderData} />;
  }

  if (loaderData.view === "empty") {
    return (
      <Content>
        <Title title="대시보드" />
        <Card>
          <p className="text-sm text-muted-foreground">
            판매자 정보를 불러올 수 없습니다.
          </p>
        </Card>
      </Content>
    );
  }

  const {
    seller,
    newOrderCount,
    orderStatusCounts,
    returnCancelCounts,
    salesOverview,
    topProducts,
    inquiryStats,
    reviewStats,
    settlementSummary,
    notices,
  } = loaderData;

  return (
    <Content>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Title title="대시보드" />
          <p className="-mt-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{seller.name}</span>{" "}
            판매자 계정
          </p>
        </div>
        <Link
          to="/products/submit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          상품 등록
        </Link>
      </div>

      {newOrderCount > 0 && (
        <Card className="mb-5 flex flex-row items-center justify-between space-y-0 border-warning-border bg-warning-background">
          <p className="text-sm font-medium text-warning">
            신규 주문 {newOrderCount}건이 접수를 기다리고 있습니다.
          </p>
          <Link
            to="/orders/list?status=pending"
            className="flex items-center gap-1 text-sm font-semibold text-warning hover:underline"
          >
            주문 확인하기
            <ArrowRight className="size-3.5" />
          </Link>
        </Card>
      )}

      {/* KPI 타일 */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiTile
          label="오늘 매출"
          value={`${formatNumber(salesOverview.todaySales)}원`}
          note={`주문 ${formatNumber(salesOverview.todayOrders)}건`}
          to="/orders/list"
        />
        <KpiTile
          label="이번달 매출"
          value={`${formatNumber(salesOverview.monthSales)}원`}
          note={`주문 ${formatNumber(salesOverview.monthOrders)}건`}
          to="/orders/list"
        />
        <KpiTile
          label="이번달 주문"
          value={`${formatNumber(salesOverview.monthOrders)}건`}
          note="이달 1일부터 오늘까지"
          to="/orders/list"
        />
        <KpiTile
          label="정산 예정 금액"
          value={`${formatNumber(settlementSummary.pendingAmount)}원`}
          note={
            settlementSummary.lastPaidAt
              ? `최근 지급 ${settlementSummary.lastPaidAt.slice(0, 10)}`
              : "지급 이력 없음"
          }
          to="/seller/settlements?status=pending"
        />
      </div>

      {/* 운영 현황 */}
      <SectionLabel>운영 현황</SectionLabel>
      <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card>
          <OpsHead icon={Truck} title="주문·배송" period={`최근 ${TREND_DAYS}일`} />
          <div className="flex">
            <StatItem
              to="/orders/list?status=pending"
              value={orderStatusCounts.pending}
              label="신규주문"
              tone={orderStatusCounts.pending > 0 ? "warn" : "default"}
            />
            <StatItem
              to="/orders/list?status=preparing"
              value={orderStatusCounts.preparing}
              label="배송준비중"
            />
            <StatItem
              to="/orders/list?status=shipped"
              value={orderStatusCounts.shipped}
              label="배송중"
              badge={
                orderStatusCounts.stalledInTransit > 0
                  ? `정체 ${orderStatusCounts.stalledInTransit}`
                  : undefined
              }
            />
            <StatItem
              to="/orders/list?status=delivered"
              value={orderStatusCounts.delivered}
              label="배송완료"
            />
          </div>
        </Card>

        <Card>
          <OpsHead icon={Undo2} title="반품·취소" period="최근 30일" />
          <div className="flex">
            <StatItem to="/orders/list?status=cancelled" value={returnCancelCounts.cancelled} label="취소" />
            <StatItem
              to="/orders/returns"
              value={returnCancelCounts.returnRequested}
              label="반품요청"
              tone={returnCancelCounts.returnRequested > 0 ? "danger" : "default"}
            />
            <StatItem to="/orders/returns" value={returnCancelCounts.returned} label="반품완료" />
          </div>
        </Card>

        <Card>
          <OpsHead icon={MessageCircle} title="고객관리" period="전체" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70">
                문의
              </p>
              <div className="flex">
                <StatItem
                  to="/orders/inquiries"
                  value={inquiryStats.unansweredCount}
                  label="미답변"
                  tone={inquiryStats.unansweredCount > 0 ? "danger" : "default"}
                />
                <StatItem to="/orders/inquiries" value={inquiryStats.totalCount} label="전체" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70">
                리뷰
              </p>
              <div className="flex">
                <StatItem
                  to="/products/reviews"
                  value={reviewStats.unansweredCount}
                  label="미답변"
                  tone={reviewStats.unansweredCount > 0 ? "warn" : "default"}
                />
                <StatItem
                  to="/products/reviews"
                  value={reviewStats.averageRating.toFixed(1)}
                  label="평균평점"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 매출 추이 + 인기상품 */}
      <SectionLabel>매출 &amp; 상품</SectionLabel>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.75fr_1fr]">
        <SalesTrendCard trend={salesOverview.dailyTrend} />
        <TopProductsCard products={topProducts} />
      </div>

      {notices.length > 0 && (
        <>
          <SectionLabel>공지사항</SectionLabel>
          <NoticesCard notices={notices} />
        </>
      )}
    </Content>
  );
}

function NoticesCard({
  notices,
}: {
  notices: { id: string; title: string; created_at: string }[];
}) {
  return (
    <Card>
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[14.5px] font-bold">
          <Megaphone className="size-4 text-muted-foreground" />
          최신 공지
        </span>
        <Link
          to="/seller/notices"
          className="text-[12.5px] font-medium text-primary hover:underline"
        >
          전체보기
        </Link>
      </div>
      <div className="divide-y divide-border">
        {notices.map((notice) => (
          <Link
            key={notice.id}
            to="/seller/notices"
            className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary"
          >
            <span className="truncate">{notice.title}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {notice.created_at.slice(0, 10)}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

type AdminDashboardProps = Extract<
  Route.ComponentProps["loaderData"],
  { view: "admin" }
>;

function AdminDashboard({
  sellerStatusCounts,
  newSellerCount,
  settlementSummary,
  unansweredInquiries,
  platformTrend,
  catalogStats,
}: AdminDashboardProps) {
  return (
    <Content>
      <Title title="대시보드" />
      <p className="-mt-4 mb-5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">관리자</span> 계정
      </p>

      {sellerStatusCounts.pending > 0 && (
        <Card className="mb-5 flex flex-row items-center justify-between space-y-0 border-warning-border bg-warning-background">
          <p className="text-sm font-medium text-warning">
            승인 대기 중인 판매자가 {sellerStatusCounts.pending}건 있습니다.
          </p>
          <Link
            to="/system/sellers?status=PENDING"
            className="flex items-center gap-1 text-sm font-semibold text-warning hover:underline"
          >
            승인 처리하기
            <ArrowRight className="size-3.5" />
          </Link>
        </Card>
      )}

      <SectionLabel>처리 필요</SectionLabel>
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiTile
          label="승인 대기 판매자"
          value={`${formatNumber(sellerStatusCounts.pending)}건`}
          note="판매자 승인 관리에서 처리"
          tone={sellerStatusCounts.pending > 0 ? "warn" : "default"}
          to="/system/sellers?status=PENDING"
        />
        <KpiTile
          label="정산 대기 금액"
          value={`${formatNumber(settlementSummary.pendingAmount)}원`}
          note={`${formatNumber(settlementSummary.pendingCount)}건 대기`}
          tone={settlementSummary.pendingCount > 0 ? "warn" : "default"}
          to="/system/settlements?status=pending"
        />
        <KpiTile
          label="미답변 일반문의"
          value={`${formatNumber(unansweredInquiries)}건`}
          note="판매자/상품과 무관한 문의"
          tone={unansweredInquiries > 0 ? "danger" : "default"}
          to="/system/inquiries?status=pending"
        />
        <KpiTile
          label="이번달 신규 판매자"
          value={`${formatNumber(newSellerCount)}건`}
          note="이달 1일부터 오늘까지"
          to="/system/sellers"
        />
      </div>

      <SectionLabel>운영 현황</SectionLabel>
      <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <OpsHead icon={ShieldCheck} title="판매자 현황" period={`전체 ${formatNumber(sellerStatusCounts.pending + sellerStatusCounts.approved + sellerStatusCounts.rejected)}개사`} />
          <div className="flex">
            <StatItem
              to="/system/sellers?status=APPROVED"
              value={sellerStatusCounts.approved}
              label="활성"
            />
            <StatItem
              to="/system/sellers?status=PENDING"
              value={sellerStatusCounts.pending}
              label="승인대기"
              tone={sellerStatusCounts.pending > 0 ? "warn" : "default"}
            />
            <StatItem
              to="/system/sellers?status=REJECTED"
              value={sellerStatusCounts.rejected}
              label="반려"
            />
          </div>
        </Card>

        <Card>
          <OpsHead icon={Landmark} title="정산 현황" period="전체 판매자" />
          <div className="flex">
            <StatItem
              to="/system/settlements?status=pending"
              value={settlementSummary.pendingCount}
              label="지급대기건"
              tone={settlementSummary.pendingCount > 0 ? "warn" : "default"}
            />
            <StatItem
              to="/system/settlements?status=pending"
              value={formatNumber(settlementSummary.pendingAmount)}
              label="대기금액(원)"
            />
            <StatItem
              to="/system/settlements?status=paid"
              value={settlementSummary.paidThisMonthCount}
              label="이번달 지급완료"
            />
          </div>
        </Card>
      </div>

      <SectionLabel>플랫폼 지표</SectionLabel>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.75fr_1fr]">
        <SalesTrendCard trend={platformTrend} title="플랫폼 거래액 추이" />
        <CatalogStatsCard stats={catalogStats} />
      </div>
    </Content>
  );
}

function CatalogStatsCard({
  stats,
}: {
  stats: { totalProducts: number; onSale: number; soldOut: number; lowStockSkus: number };
}) {
  const rows: Array<{ label: string; value: number; tone?: "warn" }> = [
    { label: "전체 등록 상품", value: stats.totalProducts },
    { label: "판매중", value: stats.onSale },
    { label: "품절", value: stats.soldOut, tone: "warn" },
    { label: "재고부족 옵션(SKU)", value: stats.lowStockSkus, tone: "warn" },
  ];

  return (
    <Card>
      <OpsHead icon={Layers} title="카탈로그 현황" period="전체 판매자" />
      <div>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b border-border py-2.5 text-sm last:border-0"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span
              className={`font-bold tabular-nums ${row.tone === "warn" ? "text-warning" : ""}`}
            >
              {formatNumber(row.value)}개
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TopProductsCard({
  products,
}: {
  products: { productName: string; quantity: number; amount: number }[];
}) {
  return (
    <Card>
      <OpsHead icon={Package} title="인기 상품 TOP 5" period="최근 30일" />
      {products.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          최근 30일 내 판매 내역이 없습니다.
        </p>
      ) : (
        <div className="space-y-0.5">
          {products.map((p, i) => (
            <div
              key={p.productName}
              className="flex items-center gap-3 rounded-lg px-1 py-2"
            >
              <span
                className={`w-4 flex-shrink-0 text-center text-[12.5px] font-bold ${
                  i < 3 ? "text-primary" : "text-muted-foreground/50"
                }`}
              >
                {i + 1}
              </span>
              <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Package className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.8px] font-medium">{p.productName}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatNumber(p.amount)}원
                </p>
              </div>
              <div className="flex-shrink-0 text-right text-[13px] font-bold tabular-nums">
                {formatNumber(p.quantity)}
                <span className="ml-0.5 text-[10.5px] font-medium text-muted-foreground">개</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
