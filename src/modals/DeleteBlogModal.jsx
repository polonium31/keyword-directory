import React from "react";
import Modal from "react-modal";
import "./EditBlogModal.css";
Modal.setAppElement("#root");

const DeleteBlogModal = ({ isOpen, onRequestClose, blog, onDelete }) => {
  const handleEdit = () => {
    onDelete(blog);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Delete Blog Modal"
      className="login-modal"
    >
      <div className="modal-header">
        <h5 className="modal-title">Delete Blog Entry</h5>
        <button
          type="button"
          className="btn-close"
          onClick={onRequestClose}
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        <h5>Are you sure?</h5>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-success"
          id="edit-btn"
          onClick={onRequestClose}
        >
          NO
        </button>

        <button
          type="button"
          className="btn btn-danger"
          id="edit-btn"
          onClick={handleEdit}
        >
          YES
        </button>
      </div>
    </Modal>
  );
};

export default DeleteBlogModal;
