import { Form, useNavigate } from "react-router";
import Card from "~/common/components/card";
import Content from "~/common/components/content";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/common-code-page";
import { useRootData } from "~/hooks/useRootData";

export default function CommonCodePage({ params }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { commonCodes } = useRootData();

  const group = commonCodes?.find((item) => item.id + "" === params.groupId);
  const commonCode = group?.children.find(
    (item) => (item.id = Number(params.codeId))
  );

  return (
    <Content>
      <Title title="공통코드 관리" />

      <Form className="space-y-5">
        <Card>
          <h2 className="text-xl font-bold">공통코드</h2>
          <TextField label="공통코드" value={commonCode?.code} />
          <TextField label="공통코드명" value={commonCode?.name} />
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit">수정</Button>
        </div>
      </Form>
    </Content>
  );
}
