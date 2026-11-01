import AppHeader from "../_components/AppHeader";
import ComposeForm from "../_components/ComposeForm";
import MobileNav from "../_components/MobileNav";

export default function ComposePage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 p-6 pb-24 md:pb-6">
        <ComposeForm />
      </main>
      <MobileNav activeHref="/compose" />
    </>
  );
}
