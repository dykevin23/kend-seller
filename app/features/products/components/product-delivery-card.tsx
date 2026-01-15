import { useState } from "react";
import Card from "~/common/components/card";
import { Button } from "~/common/components/ui/button";
import SubmitAddressModal from "~/features/seller/components/submit-address-modal";
import RadioGroup from "~/common/components/radio-group";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import {
  ISLAND_DELIVERY_TYPES,
  DELIVERY_METHOD_TYPES,
  BUNDLE_DELIVERY_TYPES,
  SHIPPING_FEE_TYPES,
  COURIER_COMPANIES,
} from "../constrants";

interface ProductDeliveryCardProps {
  addressList: Array<{
    id: number;
    address_name: string;
    zone_code: string;
    address: string;
    address_detail: string;
    address_type: string;
  }>;
}

export default function ProductDeliveryCard({
  addressList,
}: ProductDeliveryCardProps) {
  const [submitAddressModalOpen, setSubmitAddressModalOpen] =
    useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<
    (typeof addressList)[0] | null
  >(null);
  const [shippingFeeType, setShippingFeeType] = useState<string>("FREE");

  // SHIPPING 타입 주소만 필터링
  const shippingAddresses = addressList.filter(
    (addr) => addr.address_type === "SHIPPING"
  );

  // 첫 번째 주소를 기본으로 선택 (있는 경우)
  const currentAddress = selectedAddress || shippingAddresses[0] || null;

  const handleOpenModal = () => {
    setSubmitAddressModalOpen(true);
  };

  const handleShippingFeeTypeChange = (value: string) => {
    setShippingFeeType(value);
  };

  return (
    <>
      <Card>
        <h2 className="text-xl font-bold">배송지</h2>
        <div className="flex flex-col gap-6 pt-4">
          {/* 배송지 정보 */}
          <div>
            {shippingAddresses.length === 0 ? (
              <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600">등록된 출고지가 없습니다.</p>
                <Button onClick={handleOpenModal}>등록</Button>
              </div>
            ) : shippingAddresses.length > 1 ? (
              <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600">출고지를 선택해주세요.</p>
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
            {/* Hidden input for address_id */}
            {currentAddress && (
              <input
                type="hidden"
                name="addressId"
                value={currentAddress.id}
              />
            )}
          </div>

          {/* 배송 설정 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 제주/도서산간 배송여부 */}
            <RadioGroup
              label="제주/도서산간 배송"
              id="islandDelivery"
              name="islandDelivery"
              options={ISLAND_DELIVERY_TYPES.map((type) => ({
                label: type.label,
                value: type.value,
              }))}
            />

            {/* 택배사 */}
            <Select
              label="택배사"
              id="courierCompany"
              name="courierCompany"
              options={COURIER_COMPANIES.map((type) => ({
                label: type.label,
                value: type.value,
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* 배송방법 */}
            <Select
              label="배송방법"
              id="deliveryMethod"
              name="deliveryMethod"
              options={DELIVERY_METHOD_TYPES.map((type) => ({
                label: type.label,
                value: type.value,
              }))}
            />

            {/* 출고소요일 */}
            <TextField
              label="출고소요일 (일)"
              id="shippingDays"
              name="shippingDays"
              type="number"
              placeholder="1"
              defaultValue="1"
            />
          </div>

          {/* 묶음배송 */}
          <RadioGroup
            label="묶음배송"
            id="bundleDelivery"
            name="bundleDelivery"
            options={BUNDLE_DELIVERY_TYPES.map((type) => ({
              label: type.label,
              value: type.value,
            }))}
          />

          {/* 배송비 종류 */}
          <div className="space-y-4">
            <Select
              label="배송비 종류"
              id="shippingFeeType"
              name="shippingFeeType"
              options={SHIPPING_FEE_TYPES.map((type) => ({
                label: type.label,
                value: type.value,
              }))}
              onChange={handleShippingFeeTypeChange}
            />

            {/* 배송비 입력 (유료배송, 착불배송, 조건부배송) */}
            {(shippingFeeType === "PAID" ||
              shippingFeeType === "COD" ||
              shippingFeeType === "CONDITIONAL") && (
              <div className="grid grid-cols-2 gap-6">
                <TextField
                  label="배송비 (원)"
                  id="shippingFee"
                  name="shippingFee"
                  type="number"
                  placeholder="0"
                  defaultValue="0"
                />
                {/* 무료배송조건 (조건부배송만) */}
                {shippingFeeType === "CONDITIONAL" && (
                  <TextField
                    label="무료배송조건 금액 (원)"
                    id="freeShippingCondition"
                    name="freeShippingCondition"
                    type="number"
                    placeholder="0"
                    defaultValue="0"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      <SubmitAddressModal
        open={submitAddressModalOpen}
        addressType="shipping"
        onClose={() => setSubmitAddressModalOpen(false)}
      />
    </>
  );
}
