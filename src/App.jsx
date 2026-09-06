// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Seo from "./components/Seo.jsx";
// Home is the landing route — keep it in the initial bundle.
import Home from "./pages/Home.jsx";

// Everything below is route-split: the markdown pipeline (react-markdown +
// rehype/remark) and mermaid only download when a route that needs them opens.
const Publications = lazy(() => import("./pages/Publications.jsx"));
const Publication = lazy(() => import("./pages/Publication.jsx"));
const Talks = lazy(() => import("./pages/Talks.jsx"));
const Talk = lazy(() => import("./pages/Talk.jsx"));
const Books = lazy(() => import("./pages/Books.jsx"));
const Book = lazy(() => import("./pages/Book.jsx"));
const BookContents = lazy(() => import("./pages/BookContents.jsx"));
const BookChapter = lazy(() => import("./pages/BookChapter.jsx"));
const LLMAgents = lazy(() => import("./pages/LLMAgents.jsx"));
const RobotSimulations = lazy(() => import("./pages/RobotSimulations.jsx"));
const RobotSimulation = lazy(() => import("./pages/RobotSimulation.jsx"));
const MarkdownRenderer = lazy(() =>
  import("./utils/MarkdownService.jsx").then((m) => ({ default: m.MarkdownRenderer }))
);

function RouteFallback() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading…</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Seo />
      <div className="app">
        <Header />
        <div className="layout-container">
          <Sidebar />
          <main className="main-content">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<MarkdownRenderer filePath="/content/pages/about.md" />} />
                <Route path="/research" element={<MarkdownRenderer filePath="/content/pages/research.md" />} />
                <Route path="/publications" element={<Publications />} />
                <Route path="/publication/:id" element={<Publication />} />
                <Route path="/talks" element={<Talks />} />
                <Route path="/talk/:id" element={<Talk />} />
                <Route path="/robot-simulations" element={<RobotSimulations />} />
                <Route path="/robot-simulation/:id" element={<RobotSimulation />} />
                <Route path="/books" element={<Books />} />
                <Route path="/book/:bookId/contents" element={<BookContents />} />
                <Route path="/book/:bookId/chapter/:chapterId" element={<BookChapter />} />
                <Route path="/book/:id" element={<Book />} />
                <Route path="/llm-agents" element={<LLMAgents />} />
                <Route path="*" element={<div>Page not found</div>} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
