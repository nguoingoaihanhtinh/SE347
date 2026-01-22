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
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const displayText = selectedOption
    ? renderSelected
      ? renderSelected(selectedValue)
      : selectedOption.label
    : placeholder;

  const menuItems: MenuProps["items"] = options.map((option) => ({
    key: option.value,
    label: option.label,
  }));

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    onChange(key);
  };

  return (
    <AntDropdown
      menu={{
        items: menuItems,
        onClick: handleMenuClick,
      }}
      trigger={["click"]}
      placement="bottomLeft"
      overlayClassName="z-[10000]" // tăng z-index để tránh bị modal che
    >
      <div
        className={`flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
      >
        <span className="truncate">{displayText}</span>
        <DownOutlined className="text-gray-400 ml-2" />
      </div>
    </AntDropdown>
  );
};

export default Dropdown;
