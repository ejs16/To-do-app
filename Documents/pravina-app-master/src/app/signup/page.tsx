import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SignUp } from "@/components/sign-up";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function SignUpPage() {
    const session = await getServerSession(authOptions);
    
    console.log(session);

    if (!session) {
        return <div>Unauthorized</div>;
    }

    return (
        <main className="bg-[#FCFCF7]">
            <Header />
            <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 8rem)' }}>
                <SignUp/>
            </div>
            <Footer />
        </main>
    );
};
