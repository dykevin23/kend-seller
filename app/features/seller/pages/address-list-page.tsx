import Content from "~/common/components/content";
import Title from "~/common/components/title";
import type { Route } from "./+types/address-list-page";
import DataGrid from "~/common/components/data-grid";
import { Button } from "~/common/components/ui/button";
import SubmitAddressModal from "../components/submit-address-modal";
import { useState } from "react";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";

interface AddressProps {
  id: string;
  addressName: string;
  addressType: string; // 주소 타입(도로명/지번)
  zoneCode: string;
  address: string;
  addressDetail: string;
}

const formSchema = z.object({
  addressName: z.string().min(1),
  zoneCode: z.string().max(6),
  address: z.string(),
  addressDetail: z.string(),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );
  console.log("### success, data => ", success, data, error);
};

export const loader = async ({}: Route.LoaderArgs) => {
  const addressList: AddressProps[] = [
    {
      id: "address-1",
      addressName: "주소1",
      address: "외대역동로 63-27",
      zoneCode: "11111",
      addressDetail: "112동 1802호",
      addressType: "1",
    },
  ];

  return { addressList };
};

export default function AddressListPage({ loaderData }: Route.ComponentProps) {
  const [submitAddressModalOpen, setSubmitAddressModalOpen] =
    useState<boolean>(false);

  const columns: ColumnDef<AddressProps>[] = [
    {
      accessorKey: "addressType",
      header: "구분",
      cell: ({ row }) => {
        return row.getValue("addressType") === "1" ? "출고지" : "반품지";
      },
    },
    { accessorKey: "addressName", header: "주소지명" },
    {
      accessorKey: "address",
      header: "주소",
      cell: ({ row, ...rest }) => {
        console.log("### row => ", row, rest);
        const original = row.original as AddressProps;
        return (
          <div className="flex flex-col">
            <span>({original.zoneCode})</span>
            <span>
              {row.getValue("address") + " " + original.addressDetail}
            </span>
          </div>
        );
      },
      meta: {
        align: "left",
      },
    },
    {
      accessorKey: "delete",
      header: "",
    },
  ];

  return (
    <>
      <Content className="space-y-4">
        <Title title="배송지/주소지 관리" />
        <Button size="sm" onClick={() => setSubmitAddressModalOpen(true)}>
          새 주소지 등록
        </Button>
        <DataGrid data={loaderData.addressList} columns={columns} />
      </Content>

      <SubmitAddressModal
        open={submitAddressModalOpen}
        onClose={() => setSubmitAddressModalOpen(false)}
      />
    </>
  );
}
