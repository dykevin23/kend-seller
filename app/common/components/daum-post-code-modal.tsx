import { useState } from "react";
import { Button } from "./ui/button";
import Modal from "./modal";
import DaumPostcode from "react-daum-postcode";

export interface IAddressType {
  zoneCode: string;
  addressType: string;
  address: string;
}

interface DaumPostCodeModalProps {
  onComplete: (data: IAddressType) => void;
}

export default function DaumPostCodeModal({
  onComplete,
}: DaumPostCodeModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleComplete = (data: any) => {
    // console.log("### handleComplete => ", data);
    onComplete({
      zoneCode: data.zonecode,
      addressType: data.addressType,
      address: data.address,
    });
    setOpen(false);
  };

  return (
    <>
      <Button
        className="rounded-md"
        size="sm"
        type="button"
        variant="secondary"
        onClick={() => setOpen(true)}
      >
        우편번호 찾기
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="우편 번호 찾기">
        <DaumPostcode onComplete={handleComplete} />
      </Modal>
    </>
  );
}
