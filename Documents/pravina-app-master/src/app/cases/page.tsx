import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CaseList } from "@/components/case-list";

export default async function CaseListPage() {
    const session = await getServerSession(authOptions);
    console.log(session);

    if (!session) {
        return <div>Unauthorized</div>;
    }
    return (
        <main className="bg-gray-100" >
            <Header />
                <CaseList session={session}/>
            <Footer />
        </main>
    );
};
