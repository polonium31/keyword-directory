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
  faRemove,
} from "@fortawesome/free-solid-svg-icons";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginModal from "./modals/LoginModal";
import EditBlogModal from "./modals/EditBlogModal";
import { useUserAuth } from "./context";

function App() {
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [articlesFound, setArticlesFound] = useState(true);
  const [newBlog, setNewBlog] = useState({ keyword: "", link: "" });
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditBlogModalOpen, setIsEditBlogModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
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

    // Check if the blog already exists based on link or keyword
    const isBlogAlreadyExists = blogs.some(
      (blog) =>
        blog.link === newBlog.link ||
        blog.keyword.toLowerCase() === newBlog.keyword.toLowerCase()
    );

    if (isBlogAlreadyExists) {
      setNewBlog({ keyword: "", link: "" });
      alert("This blog is already present in the directory.");

      setSearchQuery(newBlog.keyword);
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
    deleteBlog(blog);
  };

  const deleteBlog = async (selectedBlog) => {
    try {
      const blogRef = doc(db, "articles", selectedBlog.articleId);
      await deleteDoc(blogRef);

      // Remove the deleted blog from the local state (blogs array)
      setBlogs((prevBlogs) =>
        prevBlogs.filter((blog) => blog.articleId !== selectedBlog.articleId)
      );
      selectedBlog(null);

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
  };

  useEffect(() => {
    getArticles("articles", setBlogs);
  }, [getArticles]);

  useEffect(() => {
    const filteredArticles = [...blogs].filter((item) =>
      item.keyword?.toLowerCase().includes(searchQuery?.toLowerCase())
    );
    setArticlesFound(filteredArticles.length > 0);
  }, [blogs, searchQuery]);

  useEffect(() => {
    if (user) {
      setUserLoggedIn(true);
    }
  }, [user]);

  return (
    <>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <img src={logo} className="navbar-brand" width="200" alt="Logo" />
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
                type="text"
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
                    <td style={{ width: "70%" }}>
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
                        </td>
                        <td className="other" style={{ borderRight: 0 }}>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => handleDeleteBlog(item)}
                          >
                            <FontAwesomeIcon
                              icon={faRemove}
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
      <LoginModal
        isOpen={isLoginModalOpen}
        onRequestClose={closeLoginModal}
        onLogin={handleLogin}
      />
      {/* Render the EditBlogModal component */}
      {selectedBlog && (
        <EditBlogModal
          isOpen={isEditBlogModalOpen}
          onRequestClose={() => setIsEditBlogModalOpen(false)}
          blog={selectedBlog}
          onEdit={saveEditedBlog}
        />
      )}
    </>
  );
}

export default App;
