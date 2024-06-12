import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ClientList } from "@/components/client-list";
import { NewClientJourney } from "@/components/new-client-journey";

export default async function NewPage() {
    const session = await getServerSession(authOptions);
    console.log(session);

    if (!session) {
        return <div>Unauthorized</div>;
    }
    return (
        <main className="bg-[#FCFCF7]">
            <Header />
                <NewClientJourney session={session}/>
            <Footer />
        </main>
    );
};
