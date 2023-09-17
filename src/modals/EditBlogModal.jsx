import React, { useState } from "react";
import Modal from "react-modal";
import "./EditBlogModal.css";
Modal.setAppElement("#root");

const EditBlogModal = ({ isOpen, onRequestClose, blog, onEdit }) => {
  const [editedBlog, setEditedBlog] = useState({ ...blog });

  const handleEdit = () => {
    onEdit(editedBlog);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit Blog Modal"
      className="login-modal"
    >
      <div className="modal-header">
        <h5 className="modal-title">Edit Blog Entry</h5>
        <button
          type="button"
          className="btn-close"
          onClick={onRequestClose}
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        <form>
          <div className="form-group">
            <label htmlFor="editKeyword" className="form-label">
              Keyword:
            </label>
            <input
              type="text"
              className="form-control"
              id="editKeyword"
              placeholder="Enter keyword"
              value={editedBlog.keyword}
              onChange={(e) =>
                setEditedBlog({ ...editedBlog, keyword: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="editLink" className="form-label">
              Article Link:
            </label>
            <input
              type="text"
              className="form-control"
              id="editLink"
              placeholder="Enter article link"
              value={editedBlog.link}
              onChange={(e) =>
                setEditedBlog({ ...editedBlog, link: e.target.value })
              }
            />
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          id="edit-btn"
          onClick={onRequestClose}
        >
          Close
        </button>

        <button
          type="button"
          className="btn btn-primary"
          id="edit-btn"
          onClick={handleEdit}
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

export default EditBlogModal;
