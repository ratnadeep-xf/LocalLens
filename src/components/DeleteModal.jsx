import React, { useState, useContext } from "react";
import { articleContext } from "../context/articleContext";

const DeleteModal = () => {
  const { setmodal, modal, setdeleteArticle, deleteArticle } =
    useContext(articleContext);
  const togglemodal = () => {
    setmodal(!modal);
  };

  if (deleteArticle) {
    const handleDelete = () => {
      setdeleteArticle(false);
    };
  }

  return (
    <div
      className="h-screen w-screen fixed top-0 left-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        return e.stopPropagation(), togglemodal();
      }}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Delete Article</h2>
        <p className="mb-6">
          Are you sure you want to delete this article? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={togglemodal}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => {
              return setdeleteArticle(true), togglemodal();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
