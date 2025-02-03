import { ToastContainer } from "react-toastify";
export default function FacultyLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 px-5">
      <ToastContainer position="top-right" autoClose={3000} />
        {children}
      </div>
    </div>
  );
} 