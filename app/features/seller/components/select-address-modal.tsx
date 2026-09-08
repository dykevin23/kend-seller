import Modal from "~/common/components/modal";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";

interface AddressItem {
  id: string;
  address_name: string;
  zone_code: string;
  address: string;
  address_detail: string;
  address_type: string;
}

interface SelectAddressModalProps {
  open: boolean;
  addresses: AddressItem[];
  selectedId?: string;
  onSelect: (address: AddressItem) => void;
  onRegisterNew: () => void;
  onClose: () => void;
}

export default function SelectAddressModal({
  open,
  addresses,
  selectedId,
  onSelect,
  onRegisterNew,
  onClose,
}: SelectAddressModalProps) {
  return (
    open && (
      <Modal open={open} title="주소 선택" onClose={onClose}>
        <div className="max-h-96 space-y-2 overflow-y-auto px-4 py-2">
          {addresses.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item);
                onClose();
              }}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors hover:bg-gray-50",
                item.id === selectedId
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              )}
            >
              <p className="font-semibold">{item.address_name}</p>
              <p className="text-sm text-gray-600">
                ({item.zone_code}) {item.address} {item.address_detail}
              </p>
            </button>
          ))}
        </div>
        <div className="flex justify-end px-4 pb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRegisterNew}
          >
            새 주소 등록
          </Button>
        </div>
      </Modal>
    )
  );
}
