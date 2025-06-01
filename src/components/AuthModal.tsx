import { useState } from "react";
import Modal from "./Modal";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

interface User {
  name?: string;
  email: string;
  password: string;
}

const AuthModal = ({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (mode === "signup" && !formData.name?.trim()) {
      toast.error("Please enter your name");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }

    if (!formData.password) {
      toast.error("Please enter your password");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted", { mode, formData });

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      if (mode === "signup") {
        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
        console.log("Existing users:", existingUsers);

        const userExists = existingUsers.some(
          (user: User) =>
            user.email.toLowerCase() === formData.email.toLowerCase()
        );

        if (userExists) {
          toast.error("An account with this email already exists");
          setIsSubmitting(false);
          return;
        }

        // Store new user
        const newUser = {
          name: formData.name?.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        };

        localStorage.setItem(
          "users",
          JSON.stringify([...existingUsers, newUser])
        );
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        toast.success("Account created successfully! Welcome to CraftShop!");
        onClose();
      } else {
        // Login logic
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        console.log("Attempting login with:", formData.email);
        console.log("Available users:", users);

        // Check if there are any users registered
        if (users.length === 0) {
          toast.error("No registered users found. Please sign up first.");
          setIsSubmitting(false);
          return;
        }

        const user = users.find(
          (u: User) =>
            u.email.toLowerCase() === formData.email.toLowerCase() &&
            u.password === formData.password
        );

        if (user) {
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("currentUser", JSON.stringify(user));
          toast.success(`Welcome back, ${user.name || ""}!`);
          onClose();
        } else {
          const userExists = users.some(
            (u: User) => u.email.toLowerCase() === formData.email.toLowerCase()
          );
          if (userExists) {
            toast.error("Incorrect password");
          } else {
            toast.error(
              "No account found with this email. Please sign up first."
            );
          }
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    // Reset form data when switching modes
    setFormData({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex min-h-[600px]">
        {/* Left side - Image */}
        <div className="hidden md:block w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1770&auto=format&fit=crop"
            alt="Camping authentication"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
            <h2 className="text-4xl font-bold text-white text-center px-6 drop-shadow-lg">
              {mode === "login"
                ? "Welcome Back to OutdoorBoys!"
                : "Join the OutdoorBoys community and start your adventure."}
            </h2>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-[#f5e6d3]">
          <h3 className="text-2xl font-bold text-[#2c1810] mb-6">
            {mode === "login" ? "Login to Your Account" : "Create Your Account"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#2c1810] mb-1 cursor-pointer"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white/80 border border-[#d4b595] rounded-2xl focus:outline-none focus:border-[#8b5e34] text-[#2c1810] placeholder-[#8b5e34]/60 cursor-text"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#2c1810] mb-1 cursor-pointer"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-white/80 border border-[#d4b595] rounded-2xl focus:outline-none focus:border-[#8b5e34] text-[#2c1810] placeholder-[#8b5e34]/60 cursor-text"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#2c1810] mb-1 cursor-pointer"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-white/80 border border-[#d4b595] rounded-2xl focus:outline-none focus:border-[#8b5e34] text-[#2c1810] placeholder-[#8b5e34]/60 cursor-text"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-[#8b5e34] text-white py-2 px-4 rounded-2xl font-medium transition-colors mt-6 cursor-pointer
                ${
                  isSubmitting
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-[#6f4b29]"
                }`}
            >
              {isSubmitting
                ? "Processing..."
                : mode === "login"
                ? "Login"
                : "Sign Up"}
            </button>
          </form>

          <p className="mt-4 text-center text-[#2c1810]/80">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-2 text-[#8b5e34] hover:text-[#6f4b29] font-medium cursor-pointer"
            >
              {mode === "login" ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
