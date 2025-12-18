import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export interface AlertProps {
  open: boolean;
  title: string;
  message: string;
  primaryButton: { label: string; onClick: () => void };
  secondaryButton?: { label: string; onClick: () => void };
  [key: string]: any;
}

export default function Alert({
  open,
  title,
  message,
  primaryButton,
  secondaryButton,
}: AlertProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {secondaryButton && (
            <AlertDialogCancel>{secondaryButton.label}</AlertDialogCancel>
          )}
          <AlertDialogAction onClick={() => primaryButton.onClick()}>
            {primaryButton.label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
