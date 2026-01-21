import { createContext, useContext, useState, type Context } from "react";
import type { AlertProps } from "~/common/components/alert";
import { v4 as uuidv4 } from "uuid";
import Alert from "~/common/components/alert";

interface AlertsProps extends Omit<AlertProps, "open"> {}

interface IAlert {
  alert: (props: AlertsProps) => string;
  confirm: (props: AlertsProps) => string;
  hideAlert: (key: string) => void;
  hideAlertAll: () => void;
}

const AlertContext: Context<IAlert> = createContext({
  alert: (props: AlertsProps) => "",
  confirm: (props: AlertsProps) => "",
  hideAlert: (key: string) => {},
  hideAlertAll: () => {},
});

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const initialAlert: AlertProps = {
    open: false,
    title: "",
    message: "",
    primaryButton: { label: "", onClick: () => {} },
  };
  const [alerts, setAlerts] = useState<AlertProps>(initialAlert);
  const [alertKey, setAlertKey] = useState<string>("");

  const initialState = () => {
    setAlerts(initialAlert);
  };

  const handleAlert = (props: AlertsProps) => {
    const { title, message, primaryButton, secondaryButton } = props;

    const newAlertKey = uuidv4();
    setAlertKey(newAlertKey);

    setAlerts({
      open: true,
      title: title,
      message: message,
      primaryButton: {
        label: primaryButton.label,
        onClick: () => {
          primaryButton?.onClick();
          initialState();
        },
      },
      secondaryButton: secondaryButton
        ? {
            label: secondaryButton.label,
            onClick: () => {
              secondaryButton?.onClick();
              initialState();
            },
          }
        : undefined,
    });

    return newAlertKey;
  };

  return (
    <AlertContext.Provider
      value={{
        alert: handleAlert,
        confirm: handleAlert,
        hideAlert: () => "",
        hideAlertAll: () => {},
      }}
    >
      {children}
      <Alert key={alertKey} {...alerts} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
