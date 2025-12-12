import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import DaumPostCodeModal, {
  type IAddressType,
} from "~/common/components/daum-post-code-modal";
import Modal from "~/common/components/modal";
import RadioGroup from "~/common/components/radio-group";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { Label } from "~/common/components/ui/label";
import { Separator } from "~/common/components/ui/separator";
import type { AddressType } from "~/types/table";

interface SubmitAddressModalProps {
  open: boolean;
  addressType?: AddressType;
  onClose: () => void;
}
export default function SubmitAddressModal({
  open,
  addressType,
  onClose,
}: SubmitAddressModalProps) {
  const [address, setAddress] = useState<IAddressType>();
  const [addressTypeOptions] = useState<
    { label: string; value: AddressType }[]
  >([
    { label: "출고지", value: "shipping" },
    { label: "반품지", value: "return" },
  ]);
  const handleZoneCode = (data: IAddressType) => {
    setAddress(data);
  };

  const fetcher = useFetcher();

  useEffect(() => {
    if (!open) setAddress({ zoneCode: "", address: "", addressType: "" });
  }, [open]);

  useEffect(() => {
    if (fetcher) {
      const { state, data } = fetcher;
      if (state !== "loading") {
        if (data?.ok) {
          onClose();
        }
      }
    }
  }, [fetcher]);

  return (
    open && (
      <Modal open={open} title="새 주소지 등록" onClose={onClose}>
        <fetcher.Form
          className="space-y-2"
          method="post"
          action="/seller/address/post"
        >
          {!addressType && (
            <div className="flex px-4">
              <Label htmlFor="addressType" className="w-1/4">
                주소구분
              </Label>
              <RadioGroup
                id="addressType"
                name="addressType"
                options={addressTypeOptions}
              />
            </div>
          )}

          <div className="flex px-4">
            <Label htmlFor="addressName" className="w-1/3">
              주소지명
            </Label>
            <TextField id="addressName" name="addressName" />
          </div>

          <div className="flex px-4">
            <Label htmlFor="zoneCode" className="w-1/4">
              우변번호
            </Label>
            <div className="flex gap-2 items-center">
              <TextField
                id="zoneCode"
                name="zoneCode"
                className="w-40 bg-gray-200"
                readOnly
                value={address?.zoneCode}
              />
              <DaumPostCodeModal onComplete={handleZoneCode} />
            </div>
          </div>

          <div className="flex px-4">
            <Label htmlFor="address" className="w-1/3">
              주소
            </Label>
            <TextField
              id="address"
              name="address"
              readOnly
              value={address?.address}
            />
          </div>

          <div className="flex px-4">
            <Label htmlFor="addressDetail" className="w-1/3"></Label>
            <TextField id="addressDetail" name="addressDetail" />
          </div>

          <Separator />
          <div className="flex pt-2 justify-end gap-1">
            <Button
              type="button"
              onClick={() => onClose()}
              size="sm"
              variant="outline"
              className="px-5"
            >
              취소
            </Button>
            <Button type="submit" size="sm" className="px-5">
              등록
            </Button>
          </div>
        </fetcher.Form>
      </Modal>
    )
  );
}
