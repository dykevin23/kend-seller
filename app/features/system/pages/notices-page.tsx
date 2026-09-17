import { Link, useFetcher, useRevalidator } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { Button } from "~/common/components/ui/button";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Badge } from "~/common/components/ui/badge";
import { useAlert } from "~/hooks/useAlert";
import { NOTICE_TARGET_LABELS } from "../constrants";
import type { Route } from "./+types/notices-page";
import { makeSSRClient } from "~/supa-client";
import { getNotices } from "../queries";
import { updateNoticeVisibility, deleteNotice } from "../mutations";

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const noticeId = formData.get("noticeId") as string;

  if (intent === "toggleVisibility") {
    const isVisible = formData.get("isVisible") === "true";
    await updateNoticeVisibility(client, { noticeId, isVisible });
    return { success: true };
  }
  if (intent === "delete") {
    await deleteNotice(client, noticeId);
    return { success: true };
  }
  return { success: false, error: "알 수 없는 요청입니다." };
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const notices = await getNotices(client);
  return { notices };
};

export default function NoticesPage({ loaderData }: Route.ComponentProps) {
  const { notices } = loaderData;
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const { confirm } = useAlert();

  const handleToggleVisibility = (noticeId: string, currentVisible: boolean) => {
    fetcher.submit(
      {
        intent: "toggleVisibility",
        noticeId,
        isVisible: String(!currentVisible),
      },
      { method: "post" }
    );
    revalidator.revalidate();
  };

  const handleDelete = (noticeId: string) => {
    confirm({
      title: "공지사항 삭제",
      message: "이 공지사항을 삭제하시겠습니까? 되돌릴 수 없습니다.",
      primaryButton: {
        label: "삭제",
        onClick: () => {
          fetcher.submit({ intent: "delete", noticeId }, { method: "post" });
          revalidator.revalidate();
        },
      },
      secondaryButton: { label: "취소", onClick: () => {} },
    });
  };

  return (
    <Content>
      <Title title="공지사항 관리" />

      <div className="mb-3 flex justify-end">
        <Button asChild>
          <Link to="./submit">등록</Link>
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>제목</TableHead>
              <TableHead className="text-center">대상</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead className="text-center">노출여부</TableHead>
              <TableHead className="text-center">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notices.length > 0 ? (
              notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell className="max-w-[400px] truncate py-3">
                    {notice.title}
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <Badge variant="neutral" className="mx-auto">
                      {NOTICE_TARGET_LABELS[notice.target] ?? notice.target}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    {notice.created_at.slice(0, 10)}
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Checkbox
                        checked={notice.is_visible}
                        onCheckedChange={() =>
                          handleToggleVisibility(notice.id, notice.is_visible)
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {notice.is_visible ? "노출" : "숨김"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(notice.id)}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  등록된 공지사항이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Content>
  );
}
