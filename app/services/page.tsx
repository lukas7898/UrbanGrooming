import { redirect } from "next/navigation";
import { altegioBookingUrl } from "@/lib/links";

export default function ServicesPage() {
  redirect(altegioBookingUrl);
}
