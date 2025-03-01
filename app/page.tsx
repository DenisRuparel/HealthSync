// Define the SearchParamProps type
type SearchParamProps = {
  searchParams: Promise<{ [key: string]: string }>;
};

import Image from "next/image";
import Link from "next/link";
// import { useSearchParams } from 'next/navigation';

import { PatientForm } from "@/components/forms/PatientForm";
import { PasskeyModal } from "@/components/PasskeyModal";

// @ts-ignore
const Home = async ({ searchParams }: SearchParamProps) => {
  const params = await searchParams;
  const isAdmin = params?.admin === "true";
  const year = new Date().getFullYear();

  return (
    <div className="flex h-screen max-h-screen">
      {isAdmin && <PasskeyModal />}
      {isAdmin}

      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[496px]">
          <Image
            src="/assets/icons/logo-full.png"
            height={1000}
            width={1000}
            alt="patient"
            className="mb-12 h-20 w-fit"
          />

          <PatientForm />

          <div className="text-14-regular mt-20 flex justify-between">
            <p className="justify-items-end text-dark-600 xl:text-left">
              Copyright &copy; {year} by <span>HealthSync</span> | All Right Reserved
            </p>
            <Link href="/?admin=true" className="text-green-500">
              Admin
            </Link>
          </div>
        </div>
      </section>

      <Image
        src="/assets/images/dr01.jpg"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[50%]"
      />
    </div>
  );
};

export default Home;