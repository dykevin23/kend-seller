import Card from "~/common/components/card";
import Content from "~/common/components/content";
import DaumPostCodeModal from "~/common/components/daum-post-code-modal";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Label } from "~/common/components/ui/label";
import { Separator } from "~/common/components/ui/separator";

export default function SubmitSellerInformationPage() {
  const handleZoneCode = () => {};
  return (
    <Content>
      <Title title="판매자 정보 입력" />

      <Card>
        <h2 className="text-xl font-bold">기본정보</h2>
        <TextField label="사업자 등록번호" direction="row" className="w-1/3" />
        <Separator />
        <TextField label="대표자 명" direction="row" className="w-1/3" />
        <TextField label="상호명" direction="row" className="w-1/3" />
        <div className="flex flex-col gap-2">
          <TextField
            label="사업장 주소"
            direction="row"
            placeholder="우편번호"
            className="w-1/4"
          />
          {/* <DaumPostCodeModal onComplete={handleZoneCode} /> */}

          <TextField
            label=""
            direction="row"
            placeholder="기본주소"
            className="w-1/2"
          />
          <TextField
            label=""
            direction="row"
            placeholder="상세주소"
            className="w-1/2"
          />
        </div>
        <Select label="비즈니스 형태" options={[]} direction="row" />
        <Select label="대표 카테고리" options={[]} direction="row" />
      </Card>
    </Content>
  );
}
