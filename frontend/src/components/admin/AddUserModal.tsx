import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Modal from "../ui/modal/Modal";

interface AddUserModalProps {
  onClose: () => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "user" | "admin" | "super_admin";
  }) => void;
  isCreating: boolean;
  currentUserRole?: "user" | "admin" | "super_admin";
}

// Strict password regex: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function AddUserModal({
  onClose,
  onSubmit,
  isCreating,
  currentUserRole,
}: AddUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin" | "super_admin",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const handleSubmit = () => {
    console.log("Submitting form data:", formData);
    
    // Validate password before submitting
    if (!PASSWORD_REGEX.test(formData.password)) {
      setPasswordTouched(true);
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Mark password as touched when user starts typing
    if (name === "password") {
      setPasswordTouched(true);
    }
  };

  // Check if password is invalid (only show error if touched)
  const isPasswordInvalid = passwordTouched && formData.password && !PASSWORD_REGEX.test(formData.password);

  // Strict validation: All fields required + password must match regex
  const isValid = 
    formData.firstName.trim() && 
    formData.lastName.trim() && 
    formData.email.trim() && 
    PASSWORD_REGEX.test(formData.password);

  // Get available roles based on current user's role
  const availableRoles =
    currentUserRole === "super_admin"
      ? [
          { value: "user", label: "User" },
          { value: "admin", label: "Admin" },
          { value: "super_admin", label: "Super Admin" },
        ]
      : [
          { value: "user", label: "User" },
          { value: "admin", label: "Admin" },
        ];

  return (
    <Modal
      title="Add New User"
      buttonContent={isCreating ? "Creating..." : "Create User"}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoadingButton={isCreating}
      isSubmitDisabled={!isValid || isCreating}
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="john.doe@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => setPasswordTouched(true)}
              className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                isPasswordInvalid
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500"
              }`}
              placeholder="Enter strong password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className={`text-xs mt-1 ${
            isPasswordInvalid ? "text-red-500" : "text-slate-500"
          }`}>
            Must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)
          </p>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableRoles.map((roleOption) => (
              <option key={roleOption.value} value={roleOption.value}>
                {roleOption.label}
              </option>
            ))}
          </select>
        </div>

        {currentUserRole === "admin" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> As an Admin, you can only create User or Admin accounts.
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
