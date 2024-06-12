import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HandPlatter } from "lucide-react";
import { Happy_Monkey } from "next/font/google";
import { Instructions } from "@/components/instructions";
import Head from "next/head";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { OverallProgress } from "@/components/overall-progress";
import { HomeComponent } from "@/components/home-component";


export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    console.log(session);

    if (!session) {
        return <div>Unauthorized</div>;
    }
    return (
        <main className="bg-[#FCFCF7] ">
            <Header />
            <div className="flex items-center justify-center">
                <HomeComponent/>
            </div>
            <Footer />
        </main>
    );
};
