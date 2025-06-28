import React, { useContext } from "react";
import { articleContext } from "../context/articleContext";
import { AlertTriangle, X, Loader2 } from "lucide-react";

const DeleteModal = ({ error, isDeleting }) => {
  const { setmodal, modal, setdeleteArticle } = useContext(articleContext);
  
  const togglemodal = () => {
    setmodal(!modal);
  };
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        return e.stopPropagation(), togglemodal();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-accent-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-accent-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">Delete Article</h2>
          </div>
          <button
            onClick={togglemodal}
            className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
            disabled={isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {error ? (
          <div className="mb-6 p-3 bg-accent-50 text-accent-700 rounded-lg">
            {error}
          </div>
        ) : (
          <p className="text-neutral-600 mb-6 leading-relaxed">
            Are you sure you want to delete this article? This action cannot be
            undone and the article will be permanently removed.
          </p>
        )}
        
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={togglemodal}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              return setdeleteArticle(true), togglemodal();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Article'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;