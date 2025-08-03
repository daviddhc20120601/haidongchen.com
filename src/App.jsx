// src/App.jsx
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./pages/Home.jsx";
import Publications from "./pages/Publications.jsx";
import Publication from "./pages/Publication.jsx";
import Talks from "./pages/Talks.jsx";
import Talk from "./pages/Talk.jsx";
import Books from "./pages/Books.jsx";
import Book from "./pages/Book.jsx";
import BookContents from "./pages/BookContents.jsx";
import BookChapter from "./pages/BookChapter.jsx";
import LLMAgents from "./pages/LLMAgents.jsx";
// Update the import path to use .jsx extension
import { MarkdownRenderer } from "./utils/MarkdownService.jsx";
import React from "react";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="layout-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              {/* Use the renamed component */}
              <Route path="/about" element={<MarkdownRenderer filePath="/content/pages/about.md" />} />
              <Route path="/research" element={<MarkdownRenderer filePath="/content/pages/research.md" />} />
              <Route path="/publications" element={<Publications />} />
              <Route path="/publication/:id" element={<Publication />} />
              <Route path="/talks" element={<Talks />} />
              <Route path="/talk/:id" element={<Talk />} />
              <Route path="/books" element={<Books />} />
              <Route path="/book/:bookId/contents" element={<BookContents />} />
              <Route path="/book/:bookId/chapter/:chapterId" element={<BookChapter />} />
              <Route path="/book/:id" element={<Book />} />
              <Route path="/llm-agents" element={<LLMAgents />} />
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
