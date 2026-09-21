import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import OperationalDashboard from "../components/home/OperationalDashboard";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="lg:flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <OperationalDashboard />
        </div>
      </main>
      <Footer />
    </>
  );
}
