// src/components/ui/dropdown/Dropdown.tsx
import { useState } from "react";
import { Dropdown as AntDropdown, type MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";

interface DropdownProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  renderSelected?: (value: string) => React.ReactNode;
}

const Dropdown = ({
  options,
  selectedValue,
  onChange,
  placeholder = "Select...",
  className = "",
  renderSelected,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);

  const menuItems: MenuProps["items"] = options.map((option) => ({
    key: option.value,
    label: option.label,
    onClick: () => {
      onChange(option.value);
      setOpen(false);
    },
  }));

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayText = selectedOption
    ? renderSelected
      ? renderSelected(selectedValue)
      : selectedOption.label
    : placeholder;

  return (
    <AntDropdown
      menu={{ items: menuItems }}
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
      overlayClassName="z-50"
    >
      <div
        className={`flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        <span className="truncate">{displayText}</span>
        <DownOutlined className="text-gray-400" />
      </div>
    </AntDropdown>
  );
};

export default Dropdown;
