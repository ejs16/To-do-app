import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProcessingComponent } from "@/components/processing-component";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FileManager } from "@/components/file-manager";

export default async function FilesPage() {
    const session = await getServerSession(authOptions);
    console.log(session);

    if (!session) {
        return <div>Unauthorized</div>;
    }

    return (
        <main className="bg-[#FCFCF7]">
            <Header />
            <div className="flex" style={{ height: 'calc(100vh - 8rem)' }}>
                <FileManager session={session} />
            </div>
            <Footer />
        </main>
    );
};
