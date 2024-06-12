import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Login } from "@/components/login";

export default function Home() {
  return (
    <main className="main" >
      <Header />
      <Login />
      <Footer/>
    </main>
  );
}
