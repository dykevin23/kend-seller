import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import type { Route } from "./+types/seller-notice-list-page";
import { makeSSRClient } from "~/supa-client";
import { getVisibleNoticesForSeller } from "../queries";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const notices = await getVisibleNoticesForSeller(client);
  return { notices };
};

export default function SellerNoticeListPage({
  loaderData,
}: Route.ComponentProps) {
  const { notices } = loaderData;

  return (
    <Content>
      <Title title="공지사항" />

      {notices.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-muted-foreground">
            등록된 공지사항이 없습니다.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notices.map((notice) => (
            <NoticeRow
              key={notice.id}
              title={notice.title}
              content={notice.content}
              createdAt={notice.created_at}
            />
          ))}
        </div>
      )}
    </Content>
  );
}

function NoticeRow({
  title,
  content,
  createdAt,
}: {
  title: string;
  content: string;
  createdAt: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="space-y-0 p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0">
          <p className="truncate font-medium">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {createdAt.slice(0, 10)}
          </p>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="whitespace-pre-wrap border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {content}
        </div>
      )}
    </Card>
  );
}
