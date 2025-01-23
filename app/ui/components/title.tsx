import Link from "next/link";

export default function Title() {
  return (
    <Link href="/home">
      <h1 className="text-4xl text-heading font-bold">K8s</h1>
    </Link>
  );
}
