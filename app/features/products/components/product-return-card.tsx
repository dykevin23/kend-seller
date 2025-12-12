import { useState } from "react";
import Card from "~/common/components/card";
import { Button } from "~/common/components/ui/button";
import SubmitAddressModal from "~/features/seller/components/submit-address-modal";

export default function ProductReturnCard() {
  const [submitAddressModalOpen, setSubmitAddressModalOpen] =
    useState<boolean>(false);

  return (
    <>
      <Card>
        <h2 className="text-xl font-bold">반품/교환</h2>
        <Button onClick={() => setSubmitAddressModalOpen(true)}>
          새 주소지 등록
        </Button>
      </Card>

      <SubmitAddressModal
        open={submitAddressModalOpen}
        addressType="shipping"
        onClose={() => setSubmitAddressModalOpen(false)}
      />
    </>
  );
}
