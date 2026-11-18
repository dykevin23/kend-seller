import { useState } from "react";
import { Button } from "./ui/button";
import Modal from "./modal";
import DaumPostcode from "react-daum-postcode";

// 카카오 공지: t1.daumcdn.net 도메인 2026-11-30 종료 → t1.kakaocdn.net 사용.
// react-daum-postcode 3.2.0의 기본 scriptUrl이 daumcdn이라 명시적으로 덮어쓴다.
const POSTCODE_SCRIPT_URL =
  "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

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
        <DaumPostcode scriptUrl={POSTCODE_SCRIPT_URL} onComplete={handleComplete} />
      </Modal>
    </>
  );
}
