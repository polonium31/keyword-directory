import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import {
  getFirestore,
  getDocs,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import app from "./firebase";
import logo from "./images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faLink,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginModal from "./modals/LoginModal";
import EditBlogModal from "./modals/EditBlogModal";
import DeleteBlogModal from "./modals/DeleteBlogModal";
import { useUserAuth } from "./context";

function App() {
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [articlesFound, setArticlesFound] = useState(true);
  const [showList, setShowList] = useState(false);
  const [newBlog, setNewBlog] = useState({ keyword: "", link: "" });
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditBlogModalOpen, setIsEditBlogModalOpen] = useState(false);
  const [isDeleteBlogModalOpen, setIsDeleteBlogModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const db = getFirestore(app);
  const { user, logIn, logOut } = useUserAuth();

  const getArticles = useCallback(
    async (collectionName, setStateFunction) => {
      const collectionRef = collection(db, collectionName);
      const collectionSnap = await getDocs(collectionRef);
      const arr = [];
      const arrId = [];
      collectionSnap.forEach((doc) => {
        arr.push(doc.data());
        arrId.push(doc.id);
      });

      const updatedArr = arr.map((item, index) => ({
        ...item,
        articleId: arrId[index],
      }));

      setStateFunction(updatedArr);
    },
    [db]
  );

  const copyToClipboard = (text) => {
    copy(text);
    toast("😀 Link Copied!!", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const toggleList = () => {
    setShowList(!showList);
    setSearchQuery("");
    var getValue = document.getElementById("basic-url");
    if (getValue.value !== "") {
      getValue.value = "";
    }
  };

  const handleLogin = async (email, password) => {
    try {
      await logIn(email, password);
      setUserLoggedIn(true);
      closeLoginModal();
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setUserLoggedIn(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleNewBlogSubmit = async () => {
    if (!newBlog.keyword || !newBlog.link) {
      alert("Please fill in both Keyword and Article Link fields.");
      return;
    }

    const existingBlog = blogs.find(
      (blog) =>
        blog.link === newBlog.link ||
        blog.keyword.toLowerCase() === newBlog.keyword.toLowerCase()
    );

    if (existingBlog) {
      setNewBlog({ keyword: "", link: "" });
      const message =
        existingBlog.link === newBlog.link
          ? `This blog is already present in the directory with the same link.`
          : `A blog with the same keyword "${existingBlog.keyword}" already exists in the directory.`;

      setSearchQuery(newBlog.keyword);
      toast(message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    const newBlogEntry = {
      keyword: newBlog.keyword,
      link: newBlog.link,
      createdAt: new Date(),
    };

    try {
      const docRef = await addDoc(collection(db, "articles"), newBlogEntry);

      setBlogs((prevBlogs) => [
        ...prevBlogs,
        { ...newBlogEntry, articleId: docRef.id },
      ]);

      setNewBlog({ keyword: "", link: "" });
      toast("🥳 New Blog Added!!", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setIsEditBlogModalOpen(true);
  };

  const saveEditedBlog = async (editedBlog) => {
    try {
      const blogRef = doc(db, "articles", editedBlog.articleId);
      await updateDoc(blogRef, editedBlog);
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.articleId === editedBlog.articleId ? editedBlog : blog
        )
      );
      toast("😀 Blog entry updated!", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
    setIsEditBlogModalOpen(false);
  };

  const handleDeleteBlog = (blog) => {
    setSelectedBlog(blog);
    setIsDeleteBlogModalOpen(true);
  };

  const deleteBlog = async (selectedBlog) => {
    try {
      const blogRef = doc(db, "articles", selectedBlog.articleId);
      await deleteDoc(blogRef);
      // Remove the deleted blog from the local state (blogs array)
      setBlogs((prevBlogs) =>
        prevBlogs.filter((blog) => blog.articleId !== selectedBlog.articleId)
      );
      // selectedBlog(null);
      setSelectedBlog(null);

      toast("🗑️ Blog entry deleted!", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
    setIsDeleteBlogModalOpen(false);
  };

  useEffect(() => {
    getArticles("articles", setBlogs);
  }, [getArticles]);

  useEffect(() => {
    const filteredArticles = [...blogs].filter((item) =>
      item.keyword?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setArticlesFound(filteredArticles.length > 0);
  }, [blogs, searchQuery]);

  useEffect(() => {
    if (user) {
      setUserLoggedIn(true);
    }
  }, [user]);
  const sortedBlogs = [...blogs].sort((a, b) =>
    a.keyword?.toLowerCase() > b.keyword?.toLowerCase() ? 1 : -1
  );
  // Pagination
  const indexOfLastBlog = currentPage * itemsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - itemsPerPage;
  const currentBlogs = sortedBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // Function to handle the next page
  const nextPage = () => {
    if (currentPage < Math.ceil(sortedBlogs.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to handle the previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  return (
    <>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <a href="/" className="navbar-brand">
            <img src={logo} width="200" alt="Logo" />
          </a>
          <div className="navbar-text">
            <h3 style={{ marginRight: "10px", color: "#000000" }}>
              Keyword Directory
            </h3>
          </div>
          {!userLoggedIn ? (
            <div className="navbar-text">
              <button
                type="button"
                className="btn btn-primary"
                onClick={openLoginModal}
              >
                Login
              </button>
            </div>
          ) : (
            <div className="navbar-text">
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleSignOut}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
      <div className="container p-4">
        <div className="row justify-content-center">
          <div className="col-10">
            <div className="input-group">
              <span className="input-group-text" id="basic-addon3">
                Search
              </span>
              <input
                type="text"
                className="form-control"
                id="basic-url"
                name="search"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowList(false);
                }}
              />
            </div>
          </div>
        </div>
        {userLoggedIn ? (
          <div className="row mt-4">
            <div className="col-5">
              <input
                type="text"
                className="form-control"
                placeholder="Keyword"
                value={newBlog.keyword}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, keyword: e.target.value })
                }
              />
            </div>
            <div className="col-5">
              <input
                type="url"
                className="form-control"
                placeholder="Article Link"
                value={newBlog.link}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, link: e.target.value })
                }
              />
            </div>
            <div className="col-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNewBlogSubmit}
              >
                Add Blog
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <div className="container p-2">
        {searchQuery.trim() === "" ? (
          <div className="text-center mt-4">
            <h2>Welcome to the Articles Directory!</h2>
            <p>Enter your search query above to find articles.</p>
          </div>
        ) : articlesFound ? (
          <table className="table">
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Article Link</th>
                <th>Copy Link</th>
                {userLoggedIn && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {blogs
                .filter((item) =>
                  item.keyword
                    ?.toLowerCase()
                    .includes(searchQuery?.toLowerCase())
                )
                .map((item, index) => (
                  <tr className="table-row" key={index}>
                    <td style={{ width: "60%" }}>
                      {" "}
                      {item.keyword
                        ?.toLowerCase()
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </td>
                    <td className="other">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        <FontAwesomeIcon icon={faLink} /> Link
                      </a>
                    </td>
                    <td className="other">
                      <button
                        type="button"
                        className="btn"
                        onClick={() => copyToClipboard(item.link)}
                      >
                        <FontAwesomeIcon icon={faCopy} id="icon" />
                      </button>
                    </td>
                    {userLoggedIn && (
                      <>
                        <td className="other" style={{ borderRight: 0 }}>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => handleEditBlog(item)}
                          >
                            <FontAwesomeIcon icon={faEdit} id="icon" />
                          </button>

                          <button
                            type="button"
                            className="btn"
                            onClick={() => handleDeleteBlog(item)}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              id="icon"
                              color="red"
                            />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center mt-4">
            <h4>No articles found for the search query.</h4>
          </div>
        )}
      </div>
      <div>
        <ToastContainer />
      </div>
      {/* Key Glossary button */}
      <div className="text-center mt-4">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={toggleList}
          style={{ fontWeight: "bold", marginBottom: "2%" }}
        >
          {showList ? "Hide List" : "Key Glossary"}
        </button>
      </div>
      {/* Conditionally render the list of blogs */}
      {showList && (
        <div className="container p-2">
          <table className="table">
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Article Link</th>
                <th>Copy Link</th>
                {userLoggedIn && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentBlogs.map((item, index) => (
                <tr className="table-row" key={index}>
                  <td style={{ width: "60%" }}>
                    {item.keyword
                      ?.toLowerCase()
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </td>
                  <td className="other">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="link"
                    >
                      <FontAwesomeIcon icon={faLink} /> Link
                    </a>
                  </td>
                  <td className="other">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => copyToClipboard(item.link)}
                    >
                      <FontAwesomeIcon icon={faCopy} id="icon" />
                    </button>
                  </td>
                  {userLoggedIn && (
                    <>
                      <td className="other" style={{ borderRight: 0 }}>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => handleEditBlog(item)}
                        >
                          <FontAwesomeIcon icon={faEdit} id="icon" />
                        </button>

                        <button
                          type="button"
                          className="btn"
                          onClick={() => handleDeleteBlog(item)}
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            id="icon"
                            color="red"
                          />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <nav>
            <ul className="pagination justify-content-center">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button className="page-link" onClick={prevPage}>
                  &laquo; Prev
                </button>
              </li>
              {Array(Math.ceil(sortedBlogs.length / itemsPerPage))
                .fill()
                .map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
              <li
                className={`page-item ${
                  currentPage === Math.ceil(sortedBlogs.length / itemsPerPage)
                    ? "disabled"
                    : ""
                }`}
              >
                <button className="page-link" onClick={nextPage}>
                  Next &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
      <LoginModal
        isOpen={isLoginModalOpen}
        onRequestClose={closeLoginModal}
        onLogin={handleLogin}
      />
      {/* Render the EditBlogModal component */}
      {selectedBlog && (
        <EditBlogModal
          isOpen={isEditBlogModalOpen}
          onRequestClose={() => {
            setIsEditBlogModalOpen(false);
            setSelectedBlog(null);
          }}
          blog={selectedBlog}
          onEdit={saveEditedBlog}
        />
      )}
      {selectedBlog && (
        <DeleteBlogModal
          isOpen={isDeleteBlogModalOpen}
          onRequestClose={() => {
            setIsDeleteBlogModalOpen(false);
            setSelectedBlog(null);
          }}
          blog={selectedBlog}
          onDelete={deleteBlog}
        />
      )}
    </>
  );
}

export default App;
