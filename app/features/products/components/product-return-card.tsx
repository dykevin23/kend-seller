import { useState } from "react";
import Card from "~/common/components/card";
import { Button } from "~/common/components/ui/button";
import SubmitAddressModal from "~/features/seller/components/submit-address-modal";
import TextField from "~/common/components/text-field";

interface ProductReturnCardProps {
  addressList: Array<{
    id: string;
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
        <h2 className="text-xl font-bold">반품/교환 정보</h2>
        <div className="flex flex-col gap-6 pt-4">
          {/* 반품지 정보 */}
          <div>
            {returnAddresses.length === 0 ? (
              <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600">등록된 반품지가 없습니다.</p>
                <Button type="button" onClick={handleOpenModal}>등록</Button>
              </div>
            ) : returnAddresses.length > 1 ? (
              <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600">반품지를 선택해주세요.</p>
                <Button type="button" onClick={handleOpenModal}>조회</Button>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">
                    {currentAddress.address_name}
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={handleOpenModal}>
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
            {/* Hidden input for return_address_id */}
            {currentAddress && (
              <input
                type="hidden"
                name="returnAddressId"
                value={currentAddress.id}
              />
            )}
          </div>

          {/* 배송비 정보 */}
          <div className="grid grid-cols-2 gap-6">
            <TextField
              label="초도배송비 (편도, 원)"
              id="initialShippingFee"
              name="initialShippingFee"
              type="number"
              placeholder="0"
              defaultValue="0"
            />
            <TextField
              label="반품배송비 (편도, 원)"
              id="returnShippingFee"
              name="returnShippingFee"
              type="number"
              placeholder="0"
              defaultValue="0"
            />
          </div>
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
