import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-[#2c1810]/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-[#f5e6d3] rounded-2xl w-full max-w-4xl mx-4 overflow-hidden shadow-xl">
        <button
          className="absolute top-4 right-4 text-[#2c1810]/60 hover:text-[#2c1810] z-10 cursor-pointer"
          onClick={onClose}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
