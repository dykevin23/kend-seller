import { useState } from "react";
import Card from "~/common/components/card";
import { Button } from "~/common/components/ui/button";
import SubmitAddressModal from "~/features/seller/components/submit-address-modal";

interface ProductReturnCardProps {
  addressList: Array<{
    id: number;
    address_name: string;
    zone_code: string;
    address: string;
    address_detail: string;
    address_type: string;
  }>;
}

export default function ProductReturnCard({
  addressList,
}: ProductReturnCardProps) {
  const [submitAddressModalOpen, setSubmitAddressModalOpen] =
    useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<
    (typeof addressList)[0] | null
  >(null);

  // RETURN 타입 주소만 필터링
  const returnAddresses = addressList.filter(
    (addr) => addr.address_type === "RETURN"
  );

  // 첫 번째 주소를 기본으로 선택 (있는 경우)
  const currentAddress = selectedAddress || returnAddresses[0] || null;

  const handleOpenModal = () => {
    setSubmitAddressModalOpen(true);
  };

  return (
    <>
      <Card>
        <h2 className="text-xl font-bold">반품/교환</h2>
        <div className="flex flex-col gap-4 pt-4">
          {returnAddresses.length === 0 ? (
            <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">등록된 반품지가 없습니다.</p>
              <Button onClick={handleOpenModal}>등록</Button>
            </div>
          ) : returnAddresses.length > 1 ? (
            <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">반품지를 선택해주세요.</p>
              <Button onClick={handleOpenModal}>조회</Button>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">
                  {currentAddress.address_name}
                </h3>
                <Button variant="outline" size="sm" onClick={handleOpenModal}>
                  변경
                </Button>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  {currentAddress.address} (우: {currentAddress.zone_code})
                </p>
                <p>{currentAddress.address_detail}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <SubmitAddressModal
        open={submitAddressModalOpen}
        addressType="RETURN"
        onClose={() => setSubmitAddressModalOpen(false)}
      />
    </>
  );
}
