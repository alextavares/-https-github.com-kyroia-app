import { requireAuth } from "@/lib/auth/guards";
import PixPayment from "@/components/payments/PixPayment";

export const dynamic = "force-dynamic";

export default async function PixPaymentPageServer(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAuth();

  const sp = await props.searchParams;
  const packageIdParam = sp?.package;
  const packageId =
    typeof packageIdParam === "string"
      ? packageIdParam
      : Array.isArray(packageIdParam)
      ? packageIdParam[0]
      : undefined;

  if (!packageId) {
    return (
      <div className="max-w-md w-full">
        <h1 className="text-lg font-semibold mb-2">Pagamento via PIX</h1>
        <p className="text-sm text-red-600">
          Parâmetro &quot;package&quot; ausente. Volte e selecione um pacote de créditos.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full">
      <h1 className="text-lg font-semibold mb-4">Pagamento via PIX</h1>
      <PixPayment packageId={packageId} />
    </div>
  );
}