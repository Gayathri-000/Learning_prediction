import React from "react";

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
  if (!isOpen) return null;

  const typeColors = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    info: "bg-blue-500 hover:bg-blue-600",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-2 px-4 rounded-lg transition duration-200 font-medium ${typeColors[type]}`}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
