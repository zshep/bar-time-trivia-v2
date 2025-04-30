import { useState } from "react";
import { Eye, EyeOff} from "lucide-react";

export default function PasswordInput({
    label = "Password",
    value,
    onChange,
    id,
    placeholder = "Enter password",
    required = true,
    minLength = 3,
    showToggle = true,
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className="border px-3 py-2 w-full rounded text-center pr-10"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
      );
}