import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DocumentEditor } from "@/components/document-editor";

export default async function EditorPage() {
    const session = await getServerSession(authOptions);
    
    console.log(session);

    if (!session) {
        return <div>Unauthorized</div>;
    }
    return (
        <div className="flex flex-col h-screen bg-white" >
            <Header />
            <main className="flex-1 overflow-auto">
                <DocumentEditor />
            </main>
            <Footer />
        </div>
    );
};
