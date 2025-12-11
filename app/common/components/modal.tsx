import { Dialog, DialogContent, DialogFooter, DialogHeader } from "./ui/dialog";

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
}

export default function Modal({
  open,
  title,
  children,
  footer,
  onClose,
}: ModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="flex flex-col w-full rounded-md"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row justify-between h-11 self-stretch px-4">
          <div className="size-7"></div>
          <div className="flex h-9 px-3 justify-center items-center gap-2.5">
            <span className="text-base font-bold leading-4 tracking-[-0.4px]">
              {title}
            </span>
          </div>
          <div
            className="aspect-square size-7 cursor-pointer"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
            >
              <path
                d="M15.645 14.0002L22.995 6.66188C23.2147 6.4422 23.3381 6.14424 23.3381 5.83355C23.3381 5.52286 23.2147 5.2249 22.995 5.00522C22.7753 4.78553 22.4774 4.66211 22.1667 4.66211C21.856 4.66211 21.558 4.78553 21.3383 5.00522L14 12.3552L6.66168 5.00522C6.44199 4.78553 6.14403 4.66211 5.83334 4.66211C5.52266 4.66211 5.2247 4.78553 5.00501 5.00522C4.78532 5.2249 4.6619 5.52286 4.6619 5.83355C4.6619 6.14424 4.78532 6.4422 5.00501 6.66188L12.355 14.0002L5.00501 21.3386C4.89566 21.447 4.80887 21.576 4.74964 21.7182C4.69041 21.8604 4.65991 22.0129 4.65991 22.1669C4.65991 22.3209 4.69041 22.4734 4.74964 22.6156C4.80887 22.7577 4.89566 22.8868 5.00501 22.9952C5.11347 23.1046 5.2425 23.1914 5.38467 23.2506C5.52684 23.3098 5.67933 23.3403 5.83334 23.3403C5.98736 23.3403 6.13985 23.3098 6.28202 23.2506C6.42419 23.1914 6.55322 23.1046 6.66168 22.9952L14 15.6452L21.3383 22.9952C21.4468 23.1046 21.5758 23.1914 21.718 23.2506C21.8602 23.3098 22.0127 23.3403 22.1667 23.3403C22.3207 23.3403 22.4732 23.3098 22.6153 23.2506C22.7575 23.1914 22.8866 23.1046 22.995 22.9952C23.1044 22.8868 23.1912 22.7577 23.2504 22.6156C23.3096 22.4734 23.3401 22.3209 23.3401 22.1669C23.3401 22.0129 23.3096 21.8604 23.2504 21.7182C23.1912 21.576 23.1044 21.447 22.995 21.3386L15.645 14.0002Z"
                fill="black"
              />
            </svg>
          </div>
        </DialogHeader>

        <div className="flex flex-col">{children}</div>

        {footer && (
          <DialogFooter className="fixed bottom-0 flex w-full h-18 p-4 justify-center items-center gap-1.5 shrink-0 bg-white border-t-1 border-t-muted/10">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
