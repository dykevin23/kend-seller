import Card from "~/common/components/card";
import Content from "~/common/components/content";
import DaumPostCodeModal from "~/common/components/daum-post-code-modal";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Separator } from "~/common/components/ui/separator";

export default function SubmitSellerInformationPage() {
  const handleZoneCode = () => {};
  return (
    <Content>
      <Title title="판매자 정보 입력" />

      <Card>
        <h2 className="text-xl font-bold">기본정보</h2>
        <TextField label="사업자 등록번호" direction="row" />
        <Separator />
        <TextField label="대표자 명" direction="row" />
        <TextField label="상호명" direction="row" />
        <div className="flex flex-col gap-1">
          <div className="flex">
            <div className="flex">
              <TextField
                label="사업장 주소"
                direction="row"
                placeholder="우편번호"
              />
            </div>
            <DaumPostCodeModal onComplete={handleZoneCode} />
          </div>
          <TextField label="" direction="row" placeholder="기본주소" />
          <TextField label="" direction="row" placeholder="상세주소" />
        </div>
        <Select label="비즈니스 형태" options={[]} direction="row" />
        <Select label="대표 카테고리" options={[]} direction="row" />
      </Card>
    </Content>
  );
}
