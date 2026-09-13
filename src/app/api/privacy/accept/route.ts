import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/authorization";
import {
  acceptPrivacyNotice,
  PrivacyNoticeAcceptanceError,
} from "@/server/use-cases/accept-privacy-notice";

export async function POST() {
  try {
    const user = await requireUser();
    const result = await acceptPrivacyNotice(user.id);
    return NextResponse.json(
      { acceptedAt: result.acceptedAt.toISOString(), alreadyAccepted: result.alreadyAccepted },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }
    if (error instanceof PrivacyNoticeAcceptanceError) {
      return NextResponse.json({ error: "No fue posible registrar el aviso." }, { status: 400 });
    }
    console.error("[privacy] acceptance_failed");
    return NextResponse.json({ error: "No fue posible registrar el aviso." }, { status: 500 });
  }
}
