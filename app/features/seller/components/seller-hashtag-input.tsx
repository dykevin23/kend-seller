import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";

interface Hashtag {
  id: string;
  name: string;
}

interface SellerHashtagInputProps {
  initialHashtags: Hashtag[];
  onChanged?: (changed: boolean) => void;
}

export default function SellerHashtagInput({
  initialHashtags,
  onChanged,
}: SellerHashtagInputProps) {
  const [tags, setTags] = useState<Hashtag[]>(initialHashtags);
  const [inputValue, setInputValue] = useState("");

  // 초기 해시태그 이름 목록 (변경 비교용)
  const initialNames = useMemo(
    () => initialHashtags.map((h) => h.name).sort().join(","),
    [initialHashtags]
  );

  useEffect(() => {
    const currentNames = tags.map((t) => t.name).sort().join(",");
    onChanged?.(currentNames !== initialNames);
  }, [tags, initialNames, onChanged]);

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // # 접두어가 있으면 제거 (텍스트만 저장)
    const name = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;

    // 중복 체크
    if (tags.some((tag) => tag.name === name)) {
      setInputValue("");
      return;
    }

    // 신규 태그는 임시 id 부여 (서버에서 실제 id 생성)
    setTags([...tags, { id: `new_${Date.now()}`, name }]);
    setInputValue("");
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // 한글 IME 조합 중이면 무시
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Label>해시태그</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="해시태그 입력 (예: 유기농)"
          className="w-60"
        />
        <Button type="button" variant="outline" onClick={addTag}>
          추가
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-sm"
            >
              #{tag.name}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:bg-primary/20 rounded-full p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* form submit 시 해시태그 이름 목록 전달 */}
      <input
        type="hidden"
        name="hashtags"
        value={JSON.stringify(tags.map((t) => t.name))}
      />
    </div>
  );
}
