import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProcessingComponent } from "@/components/processing-component";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProcessingPage() {
    const session = await getServerSession(authOptions);
    console.log(session);

    if (!session) {
        return <div>Unauthorized</div>;
    }

    return (
        <main className="bg-gray-100">
            <Header />
            <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 8rem)' }}>
                <ProcessingComponent session={session}/>
            </div>
            <Footer />
        </main>
    );
};
