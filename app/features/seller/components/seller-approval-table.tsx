import { useState } from "react";
import { useFetcher, useRevalidator } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/common/components/ui/dialog";
import { useAlert } from "~/hooks/useAlert";
import { SELLER_STATUS } from "../constrants";

interface Seller {
  id: string;
  seller_code: string;
  name: string;
  representative_name: string;
  bizr_no: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  created_at: string;
}

interface SellerApprovalTableProps {
  sellers: Seller[];
}

const STATUS_LABEL = Object.fromEntries(
  SELLER_STATUS.map((status) => [status.value, status.label])
);

export default function SellerApprovalTable({
  sellers,
}: SellerApprovalTableProps) {
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const { confirm } = useAlert();

  const handleApprove = (sellerId: string) => {
    confirm({
      title: "판매자 승인",
      message: "이 판매자를 승인하시겠습니까? 승인 후 즉시 서비스를 이용할 수 있습니다.",
      primaryButton: {
        label: "승인",
        onClick: () => {
          fetcher.submit(
            { intent: "approve", sellerId },
            { method: "post", action: "/system/sellers/post" }
          );
          revalidator.revalidate();
        },
      },
      secondaryButton: { label: "취소", onClick: () => {} },
    });
  };

  const handleReject = (sellerId: string, reason: string) => {
    fetcher.submit(
      { intent: "reject", sellerId, reason },
      { method: "post", action: "/system/sellers/post" }
    );
    revalidator.revalidate();
  };

  if (sellers.length === 0) {
    return <p className="text-sm text-muted-foreground">등록된 판매자가 없습니다.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted">
          <TableHead>번호</TableHead>
          <TableHead>판매자 코드</TableHead>
          <TableHead>상호명</TableHead>
          <TableHead>대표자</TableHead>
          <TableHead>사업자등록번호</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>등록일</TableHead>
          <TableHead>처리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sellers.map((seller, index) => (
          <TableRow key={seller.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{seller.seller_code}</TableCell>
            <TableCell>{seller.name}</TableCell>
            <TableCell>{seller.representative_name}</TableCell>
            <TableCell>{seller.bizr_no}</TableCell>
            <TableCell>
              {STATUS_LABEL[seller.status]}
              {seller.status === "REJECTED" && seller.rejection_reason && (
                <p className="text-xs text-muted-foreground">
                  ({seller.rejection_reason})
                </p>
              )}
            </TableCell>
            <TableCell>{seller.created_at.slice(0, 10)}</TableCell>
            <TableCell>
              {seller.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleApprove(seller.id)}
                  >
                    승인
                  </Button>
                  <RejectDialog sellerId={seller.id} onReject={handleReject} />
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RejectDialog({
  sellerId,
  onReject,
}: {
  sellerId: string;
  onReject: (sellerId: string, reason: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onReject(sellerId, reason.trim());
    setOpen(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          반려
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>판매자 반려</DialogTitle>
          <DialogDescription>
            반려 사유를 입력해주세요. 판매자에게 그대로 노출됩니다.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="반려 사유를 입력하세요"
          rows={4}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!reason.trim()}
            onClick={handleSubmit}
          >
            반려
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
