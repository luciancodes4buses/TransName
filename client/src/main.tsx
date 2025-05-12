import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Create a custom element to append to the body
const appRoot = document.createElement('div');
appRoot.id = 'transname-root';
document.body.appendChild(appRoot);

createRoot(appRoot).render(<App />);
