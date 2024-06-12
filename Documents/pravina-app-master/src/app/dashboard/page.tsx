import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DocumentEditor } from "@/components/document-editor";
import { DashboardComponent } from "@/components/dashboard-component";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    
    console.log(session);

    if (!session) {
        return <div>Unauthorized</div>;
    }
    return (
        <div className="flex flex-col h-screen bg-white" >
            <Header />
            <main className="flex-1 overflow-auto">
                <DashboardComponent/>
            </main>
            <Footer />
        </div>
    );
};
