import Content from "~/common/components/content";
import Title from "~/common/components/title";
import type { Route } from "./+types/address-list-page";
import DataGrid from "~/common/components/data-grid";
import { Button } from "~/common/components/ui/button";
import SubmitAddressModal from "../components/submit-address-modal";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { makeSSRClient } from "~/supa-client";
import { getSellerInfo, getSellerAddresses } from "../queries";
import type { AddressType } from "~/types/table";
import { useRevalidator } from "react-router";

interface AddressProps {
  id: number;
  address_name: string;
  address_type: AddressType;
  zone_code: string;
  address: string;
  address_detail: string;
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);

  // 판매자 정보 가져오기
  const seller = await getSellerInfo(client);
  if (!seller) {
    return { addressList: [] };
  }

  // 주소 목록 가져오기
  const addressList = await getSellerAddresses(client, seller.id);

  return { addressList };
};

export default function AddressListPage({ loaderData }: Route.ComponentProps) {
  const [submitAddressModalOpen, setSubmitAddressModalOpen] =
    useState<boolean>(false);
  const revalidator = useRevalidator();

  const handleCloseModal = () => {
    setSubmitAddressModalOpen(false);
    // 모달 닫힐 때 페이지 데이터 새로고침
    revalidator.revalidate();
  };

  const columns: ColumnDef<AddressProps>[] = [
    {
      accessorKey: "address_type",
      header: "구분",
      cell: ({ row }) => {
        return row.getValue("address_type") === "SHIPPING" ? "출고지" : "반품지";
      },
    },
    { accessorKey: "address_name", header: "주소지명" },
    {
      accessorKey: "address",
      header: "주소",
      cell: ({ row }) => {
        const original = row.original as AddressProps;
        return (
          <div className="flex flex-col">
            <span>({original.zone_code})</span>
            <span>
              {row.getValue("address") + " " + original.address_detail}
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
        onClose={handleCloseModal}
      />
    </>
  );
}
